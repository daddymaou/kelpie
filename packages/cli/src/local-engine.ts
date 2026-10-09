import { Kelpie, MemoryStore, createHttpSyncTransport } from '@kelpie/core';
import type { KelpieProjectConfig } from './config.js';

let shared: { engine: Kelpie; config: KelpieProjectConfig } | undefined;

export function getLocalEngine(config: KelpieProjectConfig): Kelpie {
	if (shared && shared.config === config) return shared.engine;
	const transport = config.serverUrl
		? createHttpSyncTransport({ baseUrl: config.serverUrl })
		: undefined;
	const engine = new Kelpie({
		deviceId: config.deviceId,
		schemaVersion: config.schemaVersion,
		store: new MemoryStore(),
		transport
	});
	shared = { engine, config };
	return engine;
}

export function resetLocalEngine(): void {
	shared = undefined;
}
