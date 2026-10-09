import React from 'react';
import { render } from 'ink';
import { loadConfig } from '../config.js';
import { getLocalEngine } from '../local-engine.js';
import { Dashboard } from '../tui/Dashboard.js';

export async function runDev(): Promise<number> {
	const config = loadConfig();
	const engine = getLocalEngine(config);
	if (config.serverUrl) {
		await engine.start();
	}
	const { waitUntilExit } = render(
		<Dashboard engine={engine} deviceId={config.deviceId} serverUrl={config.serverUrl} />
	);
	await waitUntilExit();
	await engine.stop();
	return 0;
}
