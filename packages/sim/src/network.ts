import {
	protocolVersion,
	type Mutation,
	type PullResponse,
	type PushResponse
} from '@kelpie/protocol';
import type { SyncTransport } from '@kelpie/core';

interface QueuedPush {
	deviceId: string;
	mutations: Mutation[];
	resolve(response: PushResponse): void;
	reject(error: Error): void;
}

export interface NetworkOptions {
	reorder?: boolean;
	duplicateDelivery?: number;
	seed?: number;
}

export class DeterministicNetwork {
	readonly #log: Array<{ cursor: string; mutation: Mutation }> = [];
	readonly #ids = new Set<string>();
	readonly #partitions = new Set<string>();
	readonly #queued: QueuedPush[] = [];
	#randomState: number;

	constructor(private readonly options: NetworkOptions = {}) {
		this.#randomState = options.seed ?? 0x4b454c50;
	}

	partition(deviceId: string): void {
		this.#partitions.add(deviceId);
	}

	heal(deviceId: string): void {
		this.#partitions.delete(deviceId);
	}

	transport(deviceId: string): SyncTransport {
		return {
			push: (mutations) => this.#push(deviceId, mutations),
			pull: (cursor, schemaVersion) => this.#pull(deviceId, cursor, schemaVersion)
		};
	}

	async flush(): Promise<void> {
		const delivery = this.#queued.splice(0);
		if (this.options.reorder) this.#shuffle(delivery);
		for (const queued of delivery) {
			if (this.#partitions.has(queued.deviceId)) {
				queued.reject(new Error(`Network partition prevents ${queued.deviceId} from syncing.`));
				continue;
			}
			const accepted: string[] = [];
			for (const mutation of queued.mutations) {
				this.#append(mutation);
				accepted.push(mutation.id);
				const duplicates = this.options.duplicateDelivery ?? 0;
				for (let count = 0; count < duplicates; count += 1) this.#append(mutation);
			}
			queued.resolve({
				protocolVersion,
				accepted,
				cursor: String(this.#log.length),
				rejected: []
			});
		}
	}

	mutations(): Mutation[] {
		return this.#log.map(({ mutation }) => mutation);
	}

	async #push(deviceId: string, mutations: Mutation[]): Promise<PushResponse> {
		return new Promise((resolve, reject) => {
			this.#queued.push({ deviceId, mutations, resolve, reject });
		});
	}

	async #pull(
		deviceId: string,
		cursor: string | null,
		_schemaVersion: number
	): Promise<PullResponse> {
		if (this.#partitions.has(deviceId)) {
			throw new Error(`Network partition prevents ${deviceId} from syncing.`);
		}
		const offset = cursor === null ? 0 : Number(cursor);
		if (!Number.isSafeInteger(offset) || offset < 0 || offset > this.#log.length) {
			throw new Error(`Invalid simulator cursor: ${cursor ?? 'null'}`);
		}
		const batch = this.#log.slice(offset, offset + 100);
		const nextOffset = offset + batch.length;
		return {
			protocolVersion,
			mutations: batch.map(({ mutation }) => mutation),
			nextCursor: String(nextOffset),
			hasMore: nextOffset < this.#log.length
		};
	}

	#append(mutation: Mutation): void {
		if (this.#ids.has(mutation.id)) return;
		this.#ids.add(mutation.id);
		this.#log.push({ cursor: String(this.#log.length + 1), mutation });
	}

	#shuffle<T>(items: T[]): void {
		for (let index = items.length - 1; index > 0; index -= 1) {
			const swap = Math.floor(this.#random() * (index + 1));
			[items[index], items[swap]] = [items[swap]!, items[index]!];
		}
	}

	#random(): number {
		let value = this.#randomState;
		value ^= value << 13;
		value ^= value >>> 17;
		value ^= value << 5;
		this.#randomState = value >>> 0;
		return this.#randomState / 0x1_0000_0000;
	}
}
