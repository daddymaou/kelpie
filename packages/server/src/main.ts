import { serve } from '@hono/node-server';
import pino from 'pino';
import { createKelpieApp } from './app.js';
import { resolveConfig } from './config.js';
import { createServerStore } from './create-store.js';

const config = resolveConfig();
const logger = pino({ level: config.logLevel });
const store = await createServerStore(config);
const app = createKelpieApp({ config, store, logger });

let compactionTimer: NodeJS.Timeout | undefined;
if (config.compaction.enabled) {
	compactionTimer = setInterval(() => {
		const cutoff = Date.now() - config.compaction.maxAgeMs;
		void store
			.compact({ tombstoneBefore: cutoff, logBefore: undefined })
			.then((report) => {
				if (report.removedLogEntries || report.removedTombstones) {
					logger.info(report, 'compaction completed');
				}
			})
			.catch((error: unknown) => {
				logger.error({ err: error }, 'compaction failed');
			});
	}, Math.min(config.compaction.maxAgeMs, 3_600_000));
}

const server = serve({ fetch: app.fetch, port: config.port }, (info) => {
	logger.info(
		{
			port: info.port,
			store: config.store,
			authMode: config.authMode,
			serverSchemaVersion: config.serverSchemaVersion
		},
		'Kelpie server listening'
	);
});

async function shutdown(signal: string): Promise<void> {
	logger.info({ signal }, 'shutting down');
	if (compactionTimer) clearInterval(compactionTimer);
	server.close();
	await store.close();
	process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
