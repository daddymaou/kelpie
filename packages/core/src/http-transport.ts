import {
	protocolFailureSchema,
	protocolVersion,
	type Mutation,
	type PullResponse,
	type PushResponse
} from '@kelpie/protocol';
import { KelpieProtocolError, type SyncTransport } from './transport.js';

export interface HttpSyncTransportOptions {
	baseUrl: string;
	/** Returns a Bearer token, or null when unauthenticated. */
	getToken?: () => string | null | Promise<string | null>;
	fetchImpl?: typeof fetch;
}

async function readFailure(response: Response): Promise<never> {
	let body: unknown;
	try {
		body = await response.json();
	} catch {
		throw new KelpieProtocolError({
			code: 'INTERNAL',
			message: `HTTP ${response.status} without a protocol error body.`,
			retryable: response.status >= 500
		});
	}
	const parsed = protocolFailureSchema.safeParse(body);
	if (parsed.success) throw new KelpieProtocolError(parsed.data.error);
	throw new KelpieProtocolError({
		code: 'INTERNAL',
		message: `Unexpected error response (HTTP ${response.status}).`,
		retryable: false
	});
}

export function createHttpSyncTransport(options: HttpSyncTransportOptions): SyncTransport {
	const fetchImpl = options.fetchImpl ?? fetch;
	const base = options.baseUrl.replace(/\/+$/, '');

	async function headers(): Promise<HeadersInit> {
		const result: Record<string, string> = {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		};
		const token = options.getToken ? await options.getToken() : null;
		if (token) result.Authorization = `Bearer ${token}`;
		return result;
	}

	return {
		async push(mutations: Mutation[], signal?: AbortSignal): Promise<PushResponse> {
			const response = await fetchImpl(`${base}/push`, {
				method: 'POST',
				headers: await headers(),
				body: JSON.stringify({ protocolVersion, mutations }),
				signal
			});
			if (!response.ok) await readFailure(response);
			return (await response.json()) as PushResponse;
		},
		async pull(cursor: string | null, schemaVersion: number, signal?: AbortSignal): Promise<PullResponse> {
			const response = await fetchImpl(`${base}/pull`, {
				method: 'POST',
				headers: await headers(),
				body: JSON.stringify({ protocolVersion, cursor, schemaVersion, limit: 100 }),
				signal
			});
			if (!response.ok) await readFailure(response);
			return (await response.json()) as PullResponse;
		}
	};
}
