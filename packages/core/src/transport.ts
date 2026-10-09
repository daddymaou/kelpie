import type {
	Mutation,
	PullResponse,
	PushResponse,
	ProtocolError
} from '@kelpie/protocol';

export interface SyncTransport {
	push(mutations: Mutation[], signal?: AbortSignal): Promise<PushResponse>;
	pull(cursor: string | null, schemaVersion: number, signal?: AbortSignal): Promise<PullResponse>;
	connect?(handlers: {
		onMutations(mutations: Mutation[], cursor: string): void;
		onError(error: Error): void;
	}): Promise<() => void>;
}

export class KelpieProtocolError extends Error {
	constructor(readonly protocolError: ProtocolError) {
		super(protocolError.message);
		this.name = 'KelpieProtocolError';
	}
}
