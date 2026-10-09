import type { CliRenderer } from '../render/interface.js';
import { loadConfig } from '../config.js';
import { getLocalEngine } from '../local-engine.js';

export async function runInspect(renderer: CliRenderer, table?: string): Promise<number> {
	const config = loadConfig();
	const engine = getLocalEngine(config);
	const tables = table ? [table] : ['tasks', 'notes'];
	const snapshot: Record<string, unknown[]> = {};
	for (const name of tables) {
		snapshot[name] = await engine.query({ table: name });
	}
	renderer.print(JSON.stringify({ tables: snapshot }, null, 2));
	return 0;
}
