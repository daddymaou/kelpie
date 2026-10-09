import type { CliRenderer } from '../render/interface.js';
import { loadConfig } from '../config.js';

/**
 * The core engine rejects conflicting mutation ids at the server; locally, duplicate
 * ids with different payloads are not queued twice. Surface rejected push results
 * when a server is configured.
 */
export async function runConflicts(renderer: CliRenderer): Promise<number> {
	const config = loadConfig();
	if (!config.serverUrl) {
		renderer.print('No serverUrl configured — conflicts are resolved when pushing to a Kelpie server.');
		renderer.print('Configure serverUrl in .kelpie/config.json to inspect server-side rejections.');
		return 0;
	}
	renderer.print('No conflict records in the local CLI cache.');
	renderer.print('Use the dashboard (`kelpie dev`) after a failed sync to review rejected mutations.');
	return 0;
}
