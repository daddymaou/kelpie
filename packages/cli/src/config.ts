import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface KelpieProjectConfig {
	protocolVersion: number;
	deviceId: string;
	schemaVersion: number;
	storage: 'memory' | 'indexeddb';
	serverUrl?: string;
}

export const KELPIE_DIR = '.kelpie';
export const CONFIG_FILE = 'config.json';

export function projectRoot(cwd = process.cwd()): string {
	return cwd;
}

export function configPath(root = projectRoot()): string {
	return join(root, KELPIE_DIR, CONFIG_FILE);
}

export function loadConfig(root = projectRoot()): KelpieProjectConfig {
	const path = configPath(root);
	if (!existsSync(path)) {
		throw new Error(
			`No Kelpie project found at ${path}. Run \`kelpie init\` in your project directory first.`
		);
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown;
	} catch {
		throw new Error(`Could not parse ${path} as JSON.`);
	}
	if (typeof parsed !== 'object' || parsed === null) {
		throw new Error(`${path} must contain a JSON object.`);
	}
	const record = parsed as Record<string, unknown>;
	const protocolVersion = record.protocolVersion;
	const deviceId = record.deviceId;
	const schemaVersion = record.schemaVersion;
	const storage = record.storage;
	if (protocolVersion !== 1) {
		throw new Error(`${path}: protocolVersion must be 1.`);
	}
	if (typeof deviceId !== 'string' || !deviceId.trim()) {
		throw new Error(`${path}: deviceId must be a non-empty string.`);
	}
	if (typeof schemaVersion !== 'number' || !Number.isInteger(schemaVersion) || schemaVersion < 1) {
		throw new Error(`${path}: schemaVersion must be a positive integer.`);
	}
	if (storage !== 'memory' && storage !== 'indexeddb') {
		throw new Error(`${path}: storage must be "memory" or "indexeddb".`);
	}
	const serverUrl = typeof record.serverUrl === 'string' ? record.serverUrl.trim() : undefined;
	return {
		protocolVersion: 1,
		deviceId: deviceId.trim(),
		schemaVersion,
		storage,
		serverUrl: serverUrl || undefined
	};
}

export function defaultConfig(deviceId: string): KelpieProjectConfig {
	return {
		protocolVersion: 1,
		deviceId,
		schemaVersion: 1,
		storage: 'memory'
	};
}
