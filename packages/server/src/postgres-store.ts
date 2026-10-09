import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { asc, eq, gt, lt, sql } from 'drizzle-orm';
import pg from 'pg';
import type { Mutation, ProtocolError } from '@kelpie/protocol';
import type { MaterializedRow } from '@kelpie/core';
import { materializedRows, mutationLog, sequenceState } from './schema.js';
import {
	materialize,
	parseCursor,
	PULL_EXAMINE_WINDOW,
	type AppendOutcome,
	type CompactionOptions,
	type CompactionReport,
	type PullFilter,
	type PullOutcome,
	type ServerStore,
	type StoreStats
} from './store.js';

const SEQUENCE_NAME = 'mutation_log';

function fingerprint(mutation: Mutation): string {
	return JSON.stringify([
		mutation.table,
		mutation.rowId,
		mutation.op,
		mutation.fields,
		mutation.hlc,
		mutation.schemaVersion,
		mutation.deviceId
	]);
}

function rowKey(table: string, rowId: string): string {
	return `${table}\u0000${rowId}`;
}

function mutationFromRow(row: typeof mutationLog.$inferSelect): Mutation {
	return row.mutation as Mutation;
}

export class PostgresServerStore implements ServerStore {
	readonly #pool: pg.Pool;
	readonly #db: NodePgDatabase;

	constructor(databaseUrl: string) {
		this.#pool = new pg.Pool({ connectionString: databaseUrl, max: 10 });
		this.#db = drizzle(this.#pool);
	}

	async ensureSchema(): Promise<void> {
		const here = dirname(fileURLToPath(import.meta.url));
		const sqlPath = join(here, '..', 'sql', '001_init.sql');
		const script = readFileSync(sqlPath, 'utf8');
		await this.#pool.query(script);
	}

	async #allocateSeq(count: number): Promise<number> {
		const client = await this.#pool.connect();
		try {
			await client.query('BEGIN');
			const current = await client.query<{ last_value: string }>(
				'SELECT last_value FROM sequence_state WHERE name = $1 FOR UPDATE',
				[SEQUENCE_NAME]
			);
			const start = Number(current.rows[0]?.last_value ?? 0);
			const next = start + count;
			await client.query('UPDATE sequence_state SET last_value = $1 WHERE name = $2', [next, SEQUENCE_NAME]);
			await client.query('COMMIT');
			return next;
		} catch (error) {
			await client.query('ROLLBACK');
			throw error;
		} finally {
			client.release();
		}
	}

	async append(mutations: Mutation[]): Promise<AppendOutcome> {
		const accepted: string[] = [];
		const rejected: Array<{ id: string; error: ProtocolError }> = [];

		for (const mutation of mutations) {
			const existing = await this.#db
				.select()
				.from(mutationLog)
				.where(eq(mutationLog.id, mutation.id))
				.limit(1);
			if (existing.length > 0) {
				const stored = mutationFromRow(existing[0]!);
				if (fingerprint(stored) === fingerprint(mutation)) {
					accepted.push(mutation.id);
				} else {
					rejected.push({
						id: mutation.id,
						error: {
							code: 'CONFLICT',
							message: `Mutation ${mutation.id} was already stored with different content.`,
							retryable: false
						}
					});
				}
				continue;
			}

			const seq = await this.#allocateSeq(1);
			await this.#db.insert(mutationLog).values({
				id: mutation.id,
				seq,
				tableName: mutation.table,
				rowId: mutation.rowId,
				op: mutation.op,
				deviceId: mutation.deviceId,
				schemaVersion: mutation.schemaVersion,
				wallTime: mutation.hlc.wallTime,
				hlcCounter: mutation.hlc.counter,
				hlcDeviceId: mutation.hlc.deviceId,
				mutation
			});

			const key = rowKey(mutation.table, mutation.rowId);
			const prior = await this.#db
				.select()
				.from(materializedRows)
				.where(eq(materializedRows.key, key))
				.limit(1);
			const current = prior[0]?.value as MaterializedRow | undefined;
			const next = materialize(current, mutation);
			await this.#db
				.insert(materializedRows)
				.values({
					key,
					tableName: mutation.table,
					rowId: mutation.rowId,
					value: next
				})
				.onConflictDoUpdate({
					target: materializedRows.key,
					set: { value: next, updatedAt: sql`NOW()` }
				});

			accepted.push(mutation.id);
		}

		const stats = await this.stats();
		return { accepted, rejected, cursor: stats.cursor };
	}

	async pull(after: string | null, limit: number, filter: PullFilter): Promise<PullOutcome> {
		const afterCursor = parseCursor(after) ?? 0;
		const rows = await this.#db
			.select()
			.from(mutationLog)
			.where(gt(mutationLog.seq, afterCursor))
			.orderBy(asc(mutationLog.seq))
			.limit(PULL_EXAMINE_WINDOW);

		const mutations: Mutation[] = [];
		let nextCursor = afterCursor;
		for (const row of rows) {
			nextCursor = row.seq;
			const mutation = mutationFromRow(row);
			if (mutations.length < limit && (await filter(mutation))) {
				mutations.push(mutation);
			}
		}

		const hasMore =
			rows.length === PULL_EXAMINE_WINDOW ||
			(await this.#db
				.select({ seq: mutationLog.seq })
				.from(mutationLog)
				.where(gt(mutationLog.seq, nextCursor))
				.limit(1)).length > 0;

		return {
			mutations,
			nextCursor: String(nextCursor),
			hasMore
		};
	}

	async stats(): Promise<StoreStats> {
		const seqRow = await this.#db
			.select()
			.from(sequenceState)
			.where(eq(sequenceState.name, SEQUENCE_NAME))
			.limit(1);
		const lastValue = seqRow[0]?.lastValue ?? 0;
		const countRow = await this.#db.select({ count: sql<number>`count(*)::int` }).from(mutationLog);
		const rowCount = await this.#db.select({ count: sql<number>`count(*)::int` }).from(materializedRows);
		const tables = await this.#db
			.selectDistinct({ tableName: mutationLog.tableName })
			.from(mutationLog)
			.orderBy(asc(mutationLog.tableName));

		return {
			cursor: lastValue > 0 ? String(lastValue) : null,
			mutations: countRow[0]?.count ?? 0,
			rows: rowCount[0]?.count ?? 0,
			tables: tables.map((row) => row.tableName),
			backend: 'postgres'
		};
	}

	async compact(options: CompactionOptions): Promise<CompactionReport> {
		let removedLogEntries = 0;
		if (options.logBefore !== undefined && options.logBefore > 0) {
			const deleted = await this.#db
				.delete(mutationLog)
				.where(lt(mutationLog.seq, options.logBefore))
				.returning({ id: mutationLog.id });
			removedLogEntries = deleted.length;
		}

		let removedTombstones = 0;
		if (options.tombstoneBefore !== undefined) {
			const rows = await this.#db.select().from(materializedRows);
			for (const row of rows) {
				const value = row.value as MaterializedRow;
				if (value.tombstone && value.tombstone.wallTime < options.tombstoneBefore) {
					await this.#db.delete(materializedRows).where(eq(materializedRows.key, row.key));
					removedTombstones += 1;
				}
			}
		}

		const stats = await this.stats();
		return {
			removedLogEntries,
			removedTombstones,
			cursor: stats.cursor
		};
	}

	async close(): Promise<void> {
		await this.#pool.end();
	}
}
