import type { CliRenderer } from '../render/interface.js';
import { loadConfig } from '../config.js';
import { getLocalEngine } from '../local-engine.js';

export async function runLogs(renderer: CliRenderer, limit: number): Promise<number> {
	const config = loadConfig();
	const engine = getLocalEngine(config);
	const records = await engine.options.store.allMutations(limit);
	if (!records.length) {
		renderer.print('No mutations recorded in the local store.');
		return 0;
	}
	for (const record of records) {
		const m = record.mutation;
		const ack = record.acknowledged ? 'ack' : 'pending';
		renderer.print(`${m.hlc.wallTime} ${ack} ${m.op} ${m.table}:${m.rowId} (${m.id})`);
	}
	return 0;
}
