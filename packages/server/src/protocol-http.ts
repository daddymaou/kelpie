import { protocolVersion, type ProtocolError, type ProtocolFailure } from '@kelpie/protocol';

export function protocolFailure(status: number, error: ProtocolError): { body: ProtocolFailure; status: number } {
	return {
		status,
		body: { protocolVersion, error }
	};
}

export function invalidRequest(details: unknown): { body: ProtocolFailure; status: number } {
	return protocolFailure(400, {
		code: 'INVALID_REQUEST',
		message: 'The request body did not match the Kelpie protocol.',
		retryable: false,
		details: typeof details === 'object' && details !== null ? (details as Record<string, unknown>) : { details }
	});
}

export function unauthenticated(): { body: ProtocolFailure; status: number } {
	return protocolFailure(401, {
		code: 'UNAUTHENTICATED',
		message: 'A valid Authorization header is required.',
		retryable: false
	});
}

export function forbidden(message: string): ProtocolError {
	return { code: 'FORBIDDEN', message, retryable: false };
}

export function rateLimited(retryAfterSeconds: number): { body: ProtocolFailure; status: number; headers: Record<string, string> } {
	return {
		status: 429,
		body: {
			protocolVersion,
			error: {
				code: 'RATE_LIMITED',
				message: 'Too many requests for this identity.',
				retryable: true,
				details: { retryAfterSeconds }
			}
		},
		headers: { 'Retry-After': String(retryAfterSeconds) }
	};
}

export function payloadTooLarge(maxBytes: number): { body: ProtocolFailure; status: number } {
	return protocolFailure(413, {
		code: 'PAYLOAD_TOO_LARGE',
		message: `Request body exceeds the ${maxBytes}-byte limit.`,
		retryable: false,
		details: { maxBytes }
	});
}

export function internal(message: string): { body: ProtocolFailure; status: number } {
	return protocolFailure(500, {
		code: 'INTERNAL',
		message,
		retryable: false
	});
}
