#!/usr/bin/env node
import { Command } from 'commander';
import { existsSync, mkdirSync, randomUUID, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { runConflicts } from './commands/conflicts.js';
import { runDev } from './commands/dev.js';
import { runDoctor } from './commands/doctor.js';
import { runInspect } from './commands/inspect.js';
import { runLogs } from './commands/logs.js';
import { runMigrate } from './commands/migrate.js';
import { runQueue } from './commands/queue.js';
import { runStatus } from './commands/status.js';
import { KELPIE_DIR, defaultConfig } from './config.js';
import { PlainRenderer } from './render/interface.js';

const program = new Command();
const renderer = new PlainRenderer();

program.name('kelpie').description('Kelpie local-first sync engine CLI').version('0.1.0');

program
	.command('init')
	.description('Create a local Kelpie project scaffold')
	.option('--device-id <id>', 'Device identifier stored in config')
	.action((options: { deviceId?: string }) => {
		const root = process.cwd();
		const configDir = join(root, KELPIE_DIR);
		if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true });
		const deviceId = options.deviceId?.trim() || `device-${randomUUID().slice(0, 8)}`;
		writeFileSync(join(configDir, 'config.json'), `${JSON.stringify(defaultConfig(deviceId), null, 2)}\n`);
		renderer.print(`Kelpie project initialized at ${configDir}/config.json`);
	});

program
	.command('dev')
	.description('Open the Ink dashboard for live sync status')
	.action(async () => {
		process.exit(await runDev());
	});

program
	.command('status')
	.description('Inspect current sync status')
	.action(async () => {
		try {
			process.exit(await runStatus(renderer));
		} catch (error) {
			renderer.printError(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

program
	.command('inspect')
	.description('Inspect local materialized tables')
	.option('--table <name>', 'Table name')
	.action(async (options: { table?: string }) => {
		try {
			process.exit(await runInspect(renderer, options.table));
		} catch (error) {
			renderer.printError(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

program
	.command('queue')
	.description('View pending sync mutations')
	.action(async () => {
		try {
			process.exit(await runQueue(renderer));
		} catch (error) {
			renderer.printError(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

program
	.command('conflicts')
	.description('View conflict guidance for this project')
	.action(async () => {
		try {
			process.exit(await runConflicts(renderer));
		} catch (error) {
			renderer.printError(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

program
	.command('logs')
	.description('View recent local mutations')
	.option('--limit <n>', 'Maximum entries', '25')
	.action(async (options: { limit: string }) => {
		try {
			const limit = Number(options.limit);
			if (!Number.isInteger(limit) || limit < 1) throw new Error('--limit must be a positive integer.');
			process.exit(await runLogs(renderer, limit));
		} catch (error) {
			renderer.printError(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

program
	.command('doctor')
	.description('Run integrity and local setup checks')
	.action(async () => {
		process.exit(await runDoctor(renderer));
	});

program
	.command('migrate')
	.description('Show Postgres schema migration guidance')
	.action(async () => {
		try {
			process.exit(await runMigrate(renderer));
		} catch (error) {
			renderer.printError(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

program.parse(process.argv);
