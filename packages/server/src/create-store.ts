import type { ServerStore } from './store.js';
import { MemoryServerStore } from './memory-store.js';
import { PostgresServerStore } from './postgres-store.js';
import type { ServerConfig } from './config.js';

export async function createServerStore(config: ServerConfig): Promise<ServerStore> {
	if (config.store === 'memory') {
		return new MemoryServerStore();
	}
	if (!config.databaseUrl) {
		throw new Error('Postgres store requires DATABASE_URL.');
	}
	const store = new PostgresServerStore(config.databaseUrl);
	await store.ensureSchema();
	return store;
}
