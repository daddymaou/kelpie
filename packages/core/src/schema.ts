export interface TableDefinition {
	fields: Record<string, 'string' | 'number' | 'boolean' | 'json'>;
	primaryKey?: 'id';
}

export interface KelpieSchema {
	version: number;
	tables: Record<string, TableDefinition>;
}

export type Migration = (context: MigrationContext) => Promise<void>;

export interface MigrationContext {
	renameField(table: string, from: string, to: string): Promise<void>;
	dropField(table: string, field: string): Promise<void>;
	transformRows(
		table: string,
		transform: (row: Record<string, unknown>) => Record<string, unknown>
	): Promise<void>;
}

export interface MigrationStep {
	from: number;
	to: number;
	migrate: Migration;
}

export async function runMigrations(
	fromVersion: number,
	targetVersion: number,
	migrations: MigrationStep[],
	context: MigrationContext
): Promise<void> {
	if (fromVersion > targetVersion) {
		throw new Error(`Local schema ${fromVersion} is newer than configured schema ${targetVersion}.`);
	}
	const byVersion = new Map(migrations.map((migration) => [migration.from, migration]));
	let current = fromVersion;
	while (current < targetVersion) {
		const step = byVersion.get(current);
		if (!step || step.to !== current + 1) {
			throw new Error(`Missing migration from schema version ${current} to ${current + 1}.`);
		}
		await step.migrate(context);
		current = step.to;
	}
}

export interface TextConflictAdapter {
	merge(base: string, local: string, remote: string): Promise<string>;
}
