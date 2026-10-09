import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { protocolVersion, pullRequestSchema, pushRequestSchema, type Mutation } from '@kelpie/protocol';
import type { Logger } from 'pino';
import { createAuthenticator, type AuthHook } from './auth.js';
import type { ServerConfig } from './config.js';
import { Metrics } from './metrics.js';
import { allowAll, type RowPermissionHook } from './permissions.js';
import {
	forbidden,
	internal,
	invalidRequest,
	payloadTooLarge,
	protocolFailure,
	rateLimited,
	unauthenticated
} from './protocol-http.js';
import { RateLimiter } from './rate-limit.js';
import type { ServerStore } from './store.js';

export interface KelpieAppOptions {
	config: ServerConfig;
	store: ServerStore;
	authHook?: AuthHook;
	rowPermissionHook?: RowPermissionHook;
	logger?: Logger;
	metrics?: Metrics;
}

function permissionOp(mutation: Mutation): 'read' | 'write' | 'delete' {
	if (mutation.op === 'delete') return 'delete';
	return 'write';
}

export function createKelpieApp(options: KelpieAppOptions): Hono {
	const { config, store } = options;
	const logger = options.logger;
	const metrics = options.metrics ?? new Metrics();
	const authHook =
		options.authHook ??
		createAuthenticator({
			mode: config.authMode,
			sharedSecret: config.jwtSecret,
			jwksUrl: config.jwksUrl,
			issuer: config.jwtIssuer,
			audience: config.jwtAudience
		});
	const rowPermissionHook = options.rowPermissionHook ?? allowAll;
	const rateLimiter = new RateLimiter(config.rateLimitPerMinute);

	const app = new Hono();

	app.use('*', cors({ origin: config.corsOrigin }));

	app.use('*', async (c, next) => {
		const contentLength = c.req.header('content-length');
		if (contentLength) {
			const bytes = Number(contentLength);
			if (Number.isFinite(bytes) && bytes > config.maxRequestBytes) {
				const failure = payloadTooLarge(config.maxRequestBytes);
				return c.json(failure.body, failure.status);
			}
		}
		await next();
	});

	app.use('*', async (c, next) => {
		const auth = await authHook(c.req.header('authorization'));
		const identity = auth?.userId ?? c.req.header('x-forwarded-for') ?? 'anonymous';
		const decision = rateLimiter.check(identity);
		c.header('X-RateLimit-Remaining', String(decision.remaining));
		if (!decision.allowed) {
			const failure = rateLimited(decision.retryAfterSeconds);
			for (const [key, value] of Object.entries(failure.headers)) c.header(key, value);
			metrics.increment('rate_limited_total');
			return c.json(failure.body, failure.status);
		}
		await next();
	});

	app.get('/health', (c) => c.json({ status: 'ok', protocolVersion }));

	app.get('/metrics', async (c) => {
		const stats = await store.stats();
		metrics.gauge('store_mutations', stats.mutations);
		metrics.gauge('store_rows', stats.rows);
		if (stats.cursor) metrics.gauge('store_cursor', Number(stats.cursor));
		const accept = c.req.header('accept') ?? '';
		if (accept.includes('text/plain') || accept.includes('application/openmetrics-text')) {
			return c.text(metrics.render(), 200, { 'Content-Type': 'text/plain; version=0.0.4' });
		}
		return c.json({ ...metrics.toJson(), store: stats });
	});

	app.get('/status', async (c) => {
		const stats = await store.stats();
		return c.json({
			status: 'online',
			uptimeSeconds: process.uptime(),
			protocolVersion,
			store: stats.backend,
			cursor: stats.cursor,
			mutationCount: stats.mutations,
			authMode: config.authMode,
			serverSchemaVersion: config.serverSchemaVersion
		});
	});

	app.post('/push', async (c) => {
		try {
			const auth = await authHook(c.req.header('authorization'));
			if (!auth && config.authMode !== 'none') {
				const failure = unauthenticated();
				return c.json(failure.body, failure.status);
			}
			const ctx = auth ?? { userId: 'anonymous', scopes: [] };

			const rawBody = await c.req.json();
			const parsed = pushRequestSchema.safeParse(rawBody);
			if (!parsed.success) {
				const failure = invalidRequest(parsed.error.flatten());
				return c.json(failure.body, failure.status);
			}

			const request = parsed.data;
			const accepted: string[] = [];
			const rejected: Array<{ id: string; error: ReturnType<typeof forbidden> }> = [];
			const toAppend: Mutation[] = [];

			for (const mutation of request.mutations) {
				if (mutation.schemaVersion > config.serverSchemaVersion) {
					rejected.push({
						id: mutation.id,
						error: {
							code: 'SCHEMA_VERSION_TOO_NEW',
							message: `Schema version ${mutation.schemaVersion} exceeds server maximum ${config.serverSchemaVersion}.`,
							retryable: false
						}
					});
					continue;
				}
				const op = permissionOp(mutation);
				const allowed = await rowPermissionHook(ctx, mutation.table, mutation.rowId, op);
				if (!allowed) {
					rejected.push({
						id: mutation.id,
						error: forbidden(`Operation denied for ${mutation.table}:${mutation.rowId}.`)
					});
					continue;
				}
				toAppend.push(mutation);
			}

			const outcome = await store.append(toAppend);
			accepted.push(...outcome.accepted);
			rejected.push(...outcome.rejected);
			metrics.increment('push_requests_total');
			metrics.increment('push_mutations_accepted_total', {}, accepted.length);
			metrics.increment('push_mutations_rejected_total', {}, rejected.length);

			return c.json({
				protocolVersion,
				accepted,
				cursor: outcome.cursor,
				rejected
			});
		} catch (error) {
			logger?.error({ err: error }, 'push failed');
			const failure = internal(error instanceof Error ? error.message : 'Unknown server error');
			return c.json(failure.body, failure.status);
		}
	});

	app.post('/pull', async (c) => {
		try {
			const auth = await authHook(c.req.header('authorization'));
			if (!auth && config.authMode !== 'none') {
				const failure = unauthenticated();
				return c.json(failure.body, failure.status);
			}
			const ctx = auth ?? { userId: 'anonymous', scopes: [] };

			const rawBody = await c.req.json();
			const parsed = pullRequestSchema.safeParse(rawBody);
			if (!parsed.success) {
				const failure = invalidRequest(parsed.error.flatten());
				return c.json(failure.body, failure.status);
			}

			const request = parsed.data;
			if (request.schemaVersion > config.serverSchemaVersion) {
				const failure = protocolFailure(400, {
					code: 'SCHEMA_VERSION_TOO_NEW',
					message: `Schema version ${request.schemaVersion} exceeds server maximum ${config.serverSchemaVersion}.`,
					retryable: false
				});
				return c.json(failure.body, failure.status);
			}

			const outcome = await store.pull(request.cursor, request.limit, async (mutation) => {
				if (mutation.schemaVersion > config.serverSchemaVersion) return false;
				return rowPermissionHook(ctx, mutation.table, mutation.rowId, 'read');
			});

			metrics.increment('pull_requests_total');
			metrics.increment('pull_mutations_total', {}, outcome.mutations.length);

			return c.json({
				protocolVersion,
				mutations: outcome.mutations,
				nextCursor: outcome.nextCursor,
				hasMore: outcome.hasMore
			});
		} catch (error) {
			logger?.error({ err: error }, 'pull failed');
			if (error instanceof Error && error.message.startsWith('Invalid cursor')) {
				const failure = invalidRequest({ cursor: error.message });
				return c.json(failure.body, failure.status);
			}
			const failure = internal(error instanceof Error ? error.message : 'Unknown server error');
			return c.json(failure.body, failure.status);
		}
	});

	return app;
}
