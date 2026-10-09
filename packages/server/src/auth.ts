import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { AuthMode } from './config.js';

export interface AuthContext {
	userId: string;
	scopes: string[];
}

/**
 * Receives the raw Authorization header (or undefined) and returns the
 * authenticated identity, or null when the request is not authenticated.
 * Returning null never throws; the caller converts it into UNAUTHENTICATED.
 */
export type AuthHook = (
	authorizationHeader: string | undefined
) => Promise<AuthContext | null> | AuthContext | null;

function extractIdentity(payload: JWTPayload): AuthContext | null {
	const userId = typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : undefined;
	if (!userId) return null;

	let scopes: string[] = [];
	if (Array.isArray(payload.scopes)) {
		scopes = payload.scopes.filter((scope): scope is string => typeof scope === 'string');
	} else if (typeof payload.scope === 'string') {
		scopes = payload.scope.split(/\s+/).filter(Boolean);
	}
	return { userId, scopes };
}

const bearerPattern = /^Bearer\s+(.+)$/i;

function bearerToken(authorizationHeader: string | undefined): string | null {
	if (!authorizationHeader) return null;
	const match = bearerPattern.exec(authorizationHeader.trim());
	return match?.[1]?.trim() || null;
}

export interface AuthenticatorOptions {
	mode: AuthMode;
	sharedSecret?: string;
	jwksUrl?: string;
	issuer?: string;
	audience?: string;
}

/**
 * Build the authenticator for the configured mode.
 * - shared-secret: HS256 verification against KELPIE_JWT_SECRET
 * - jwks: asymmetric verification against a remote JWKS endpoint (cached by jose)
 * - none: development mode; every request is anonymous (userId "anonymous")
 */
export function createAuthenticator(options: AuthenticatorOptions): AuthHook {
	if (options.mode === 'none') {
		return () => ({ userId: 'anonymous', scopes: [] });
	}

	if (options.mode === 'shared-secret') {
		if (!options.sharedSecret) throw new Error('shared-secret auth requires a secret.');
		const secret = new TextEncoder().encode(options.sharedSecret);
		return async (authorizationHeader) => {
			const token = bearerToken(authorizationHeader);
			if (!token) return null;
			try {
				const { payload } = await jwtVerify(token, secret, {
					algorithms: ['HS256'],
					...(options.issuer ? { issuer: options.issuer } : {}),
					...(options.audience ? { audience: options.audience } : {})
				});
				return extractIdentity(payload);
			} catch {
				return null;
			}
		};
	}

	if (options.mode === 'jwks') {
		if (!options.jwksUrl) throw new Error('jwks auth requires a JWKS URL.');
		const jwks = createRemoteJWKSet(new URL(options.jwksUrl), { cooldownDuration: 30_000, cacheMaxAge: 600_000 });
		return async (authorizationHeader) => {
			const token = bearerToken(authorizationHeader);
			if (!token) return null;
			try {
				const { payload } = await jwtVerify(token, jwks, {
					algorithms: ['RS256', 'ES256'],
					...(options.issuer ? { issuer: options.issuer } : {}),
					...(options.audience ? { audience: options.audience } : {})
				});
				return extractIdentity(payload);
			} catch {
				return null;
			}
		};
	}

	throw new Error(`Unsupported auth mode: ${options.mode}`);
}
