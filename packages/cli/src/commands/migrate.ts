import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CliRenderer } from '../render/interface.js';
import { loadConfig } from '../config.js';

export async function runMigrate(renderer: CliRenderer): Promise<number> {
	const config = loadConfig();
	if (!config.serverUrl) {
		renderer.printError('migrate requires serverUrl in .kelpie/config.json pointing at a Kelpie server.');
		return 1;
	}
	const here = dirname(fileURLToPath(import.meta.url));
	const sqlPath = join(here, '..', '..', '..', 'server', 'sql', '001_init.sql');
	let script: string;
	try {
		script = readFileSync(sqlPath, 'utf8');
	} catch (error) {
		renderer.printError(
			`Could not read server schema at ${sqlPath}: ${error instanceof Error ? error.message : String(error)}`
		);
		return 1;
	}
	renderer.print('Postgres schema migration is applied by the Kelpie server on startup.');
	renderer.print('Ensure DATABASE_URL is set where the server runs, then restart the server.');
	renderer.print(`Reference SQL (${script.split('\n').length} lines): ${sqlPath}`);
	return 0;
}
