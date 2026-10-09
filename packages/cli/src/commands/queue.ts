import type { CliRenderer } from '../render/interface.js';
import { loadConfig } from '../config.js';
import { getLocalEngine } from '../local-engine.js';

export async function runQueue(renderer: CliRenderer): Promise<number> {
	const config = loadConfig();
	const engine = getLocalEngine(config);
	const pending = await engine.options.store.pendingMutations(500);
	if (!pending.length) {
		renderer.print('No queued mutations.');
		return 0;
	}
	for (const record of pending) {
		const m = record.mutation;
		renderer.print(`${m.id} ${m.op} ${m.table}:${m.rowId}`);
	}
	return 0;
}
