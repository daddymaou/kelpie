import type { CliRenderer } from '../render/interface.js';
import { loadConfig } from '../config.js';
import { getLocalEngine } from '../local-engine.js';

export async function runStatus(renderer: CliRenderer): Promise<number> {
	const config = loadConfig();
	const engine = getLocalEngine(config);
	const pending = await engine.options.store.pendingMutations(10_000);
	const cursor = await engine.options.store.lastCursor();
	const payload = {
		status: engine.status,
		deviceId: config.deviceId,
		schemaVersion: config.schemaVersion,
		storage: config.storage,
		serverUrl: config.serverUrl ?? null,
		queueDepth: pending.length,
		lastCursor: cursor
	};
	renderer.print(JSON.stringify(payload, null, 2));
	return 0;
}
