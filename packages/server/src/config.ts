export type AuthMode = 'none' | 'shared-secret' | 'jwks';

export interface CompactionConfig {
	/** Compaction only runs when a max age is configured. */
	enabled: boolean;
	maxAgeMs: number;
}

export interface ServerConfig {
	port: number;
	corsOrigin: string | string[];
	rateLimitPerMinute: number;
	maxRequestBytes: number;
	authMode: AuthMode;
	jwtSecret: string | undefined;
	jwksUrl: string | undefined;
	jwtIssuer: string | undefined;
	jwtAudience: string | undefined;
	store: 'postgres' | 'memory';
	databaseUrl: string | undefined;
	serverSchemaVersion: number;
	compaction: CompactionConfig;
	logLevel: string;
}

function parseInteger(name: string, raw: string | undefined, fallback: number, min: number, max: number): number {
	if (raw === undefined || raw.trim() === '') return fallback;
	const value = Number(raw);
	if (!Number.isInteger(value) || value < min || value > max) {
		throw new Error(`${name} must be an integer between ${min} and ${max}; received ${JSON.stringify(raw)}.`);
	}
	return value;
}

function parseAuthMode(env: Record<string, string | undefined>): AuthMode {
	const explicit = env.KELPIE_AUTH?.trim().toLowerCase();
	const secret = env.KELPIE_JWT_SECRET?.trim();
	const jwksUrl = env.KELPIE_JWKS_URL?.trim();

	if (explicit && explicit !== 'none' && explicit !== 'shared-secret' && explicit !== 'jwks') {
		throw new Error('KELPIE_AUTH must be one of: none, shared-secret, jwks.');
	}
	if (explicit === 'none') {
		if (secret || jwksUrl) {
			throw new Error('KELPIE_AUTH=none cannot be combined with KELPIE_JWT_SECRET or KELPIE_JWKS_URL.');
		}
		return 'none';
	}
	if (explicit === 'shared-secret') {
		if (!secret) throw new Error('KELPIE_AUTH=shared-secret requires KELPIE_JWT_SECRET.');
		if (jwksUrl) throw new Error('KELPIE_AUTH=shared-secret cannot be combined with KELPIE_JWKS_URL.');
		return 'shared-secret';
	}
	if (explicit === 'jwks') {
		if (!jwksUrl) throw new Error('KELPIE_AUTH=jwks requires KELPIE_JWKS_URL.');
		if (secret) throw new Error('KELPIE_AUTH=jwks cannot be combined with KELPIE_JWT_SECRET.');
		return 'jwks';
	}
	if (secret && jwksUrl) {
		throw new Error('Set only one of KELPIE_JWT_SECRET or KELPIE_JWKS_URL, or set KELPIE_AUTH explicitly.');
	}
	if (secret) return 'shared-secret';
	if (jwksUrl) return 'jwks';
	return 'none';
}

/**
 * Resolve the server configuration from environment variables.
 *
 * Environment variables:
 * - KELPIE_PORT                  listen port (default 3000)
 * - KELPIE_CORS_ORIGIN           comma-separated allowed origins (default *)
 * - KELPIE_RATE_LIMIT_PER_MINUTE per-identity request budget (default 600)
 * - KELPIE_MAX_REQUEST_BYTES     max JSON body size (default 1 MiB)
 * - KELPIE_AUTH                  none | shared-secret | jwks (default: derived)
 * - KELPIE_JWT_SECRET            HS256 shared secret
 * - KELPIE_JWKS_URL              JWKS endpoint for asymmetric verification
 * - KELPIE_JWT_ISSUER / KELPIE_JWT_AUDIENCE  optional claim checks
 * - DATABASE_URL                 Postgres connection string (selects the postgres store)
 * - KELPIE_STORE                 postgres | memory (default: postgres when DATABASE_URL set, else error)
 * - KELPIE_SCHEMA_VERSION        server schema version (default 1)
 * - KELPIE_COMPACTION_MAX_AGE_MS enables log/tombstone compaction older than this age
 * - KELPIE_LOG_LEVEL             pino level (default info)
 */
export function resolveConfig(env: Record<string, string | undefined> = process.env): ServerConfig {
	const authMode = parseAuthMode(env);
	const databaseUrl = env.DATABASE_URL?.trim() || undefined;
	const explicitStore = env.KELPIE_STORE?.trim().toLowerCase();

	if (explicitStore && explicitStore !== 'postgres' && explicitStore !== 'memory') {
		throw new Error('KELPIE_STORE must be either postgres or memory.');
	}
	const store: 'postgres' | 'memory' = explicitStore
		? (explicitStore as 'postgres' | 'memory')
		: databaseUrl
			? 'postgres'
			: 'memory';
	if (store === 'postgres' && !databaseUrl) {
		throw new Error('KELPIE_STORE=postgres requires DATABASE_URL.');
	}
	if (store === 'memory' && !explicitStore && !databaseUrl) {
		// Not fatal: local development without a database is a supported, explicit-looking path,
		// but make sure the operator knows the data is process-local.
		process.emitWarning(
			'KELPIE_STORE=memory: mutations are kept in process memory and are lost when the server stops.',
			'KelpieConfigWarning'
		);
	}

	const compactionAge = env.KELPIE_COMPACTION_MAX_AGE_MS?.trim();
	const parsedCompactionAge = compactionAge ? parseInteger('KELPIE_COMPACTION_MAX_AGE_MS', compactionAge, 0, 0, Number.MAX_SAFE_INTEGER) : 0;

	const corsRaw = env.KELPIE_CORS_ORIGIN?.trim();
	const corsOrigin: string | string[] =
		!corsRaw || corsRaw === '*' ? '*' : corsRaw.split(',').map((origin) => origin.trim()).filter(Boolean);

	return {
		port: parseInteger('KELPIE_PORT', env.KELPIE_PORT, 3000, 1, 65_535),
		corsOrigin,
		rateLimitPerMinute: parseInteger('KELPIE_RATE_LIMIT_PER_MINUTE', env.KELPIE_RATE_LIMIT_PER_MINUTE, 600, 1, 1_000_000),
		maxRequestBytes: parseInteger('KELPIE_MAX_REQUEST_BYTES', env.KELPIE_MAX_REQUEST_BYTES, 1024 * 1024, 1024, 64 * 1024 * 1024),
		authMode,
		jwtSecret: env.KELPIE_JWT_SECRET?.trim() || undefined,
		jwksUrl: env.KELPIE_JWKS_URL?.trim() || undefined,
		jwtIssuer: env.KELPIE_JWT_ISSUER?.trim() || undefined,
		jwtAudience: env.KELPIE_JWT_AUDIENCE?.trim() || undefined,
		store,
		databaseUrl,
		serverSchemaVersion: parseInteger('KELPIE_SCHEMA_VERSION', env.KELPIE_SCHEMA_VERSION, 1, 1, Number.MAX_SAFE_INTEGER),
		compaction: { enabled: parsedCompactionAge > 0, maxAgeMs: parsedCompactionAge },
		logLevel: env.KELPIE_LOG_LEVEL?.trim() || 'info'
	};
}
