import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { CliRenderer } from '../render/interface.js';
import { KELPIE_DIR, configPath, loadConfig, projectRoot } from '../config.js';

export async function runDoctor(renderer: CliRenderer, root = projectRoot()): Promise<number> {
	const issues: string[] = [];
	const kelpieDir = join(root, KELPIE_DIR);
	if (!existsSync(kelpieDir)) {
		issues.push(`Missing ${kelpieDir}/ — run kelpie init.`);
	} else if (!existsSync(configPath(root))) {
		issues.push(`Missing ${configPath(root)} — run kelpie init.`);
	}

	let config;
	try {
		config = loadConfig(root);
	} catch (error) {
		issues.push(error instanceof Error ? error.message : String(error));
	}

	if (config?.serverUrl) {
		try {
			const response = await fetch(new URL('/health', config.serverUrl));
			if (!response.ok) {
				issues.push(`Server ${config.serverUrl} returned HTTP ${response.status} on /health.`);
			}
		} catch (error) {
			issues.push(
				`Could not reach server at ${config.serverUrl}: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	} else if (config) {
		renderer.print('No serverUrl in config — CLI will use in-memory state only.');
	}

	if (issues.length) {
		for (const issue of issues) renderer.printError(issue);
		return 1;
	}
	renderer.print('Kelpie project checks passed.');
	return 0;
}
