import { bigint, jsonb, pgTable, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';

/**
 * Append-only mutation log. `seq` is a monotonic cursor assigned by Postgres;
 * rows are never updated, only inserted (or deleted by explicit compaction).
 */
export const mutationLog = pgTable(
	'mutation_log',
	{
		id: text('id').primaryKey(),
		seq: bigint('seq', { mode: 'number' }).notNull(),
		tableName: text('table_name').notNull(),
		rowId: text('row_id').notNull(),
		op: text('op').notNull(),
		deviceId: text('device_id').notNull(),
		schemaVersion: bigint('schema_version', { mode: 'number' }).notNull(),
		wallTime: bigint('wall_time', { mode: 'number' }).notNull(),
		hlcCounter: bigint('hlc_counter', { mode: 'number' }).notNull(),
		hlcDeviceId: text('hlc_device_id').notNull(),
		mutation: jsonb('mutation').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('mutation_log_seq_idx').on(table.seq), uniqueIndex('mutation_log_seq_unique').on(table.seq)]
);

/** Materialized row state: the resolved view of every mutation applied so far. */
export const materializedRows = pgTable(
	'materialized_rows',
	{
		key: text('key').primaryKey(),
		tableName: text('table_name').notNull(),
		rowId: text('row_id').notNull(),
		value: jsonb('value').notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [index('materialized_rows_table_idx').on(table.tableName)]
);

/** Monotonic sequence allocator so cursors keep advancing across restarts/compaction. */
export const sequenceState = pgTable('sequence_state', {
	name: text('name').primaryKey(),
	lastValue: bigint('last_value', { mode: 'number' }).notNull()
});

export type MutationLogRow = typeof mutationLog.$inferSelect;
export type MaterializedRowRecord = typeof materializedRows.$inferSelect;
