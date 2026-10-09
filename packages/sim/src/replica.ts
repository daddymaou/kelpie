import { Kelpie, MemoryStore } from '@kelpie/core';
import { DeterministicNetwork, type NetworkOptions } from './network.js';

export class SimulatedReplica {
	readonly store = new MemoryStore();
	readonly engine: Kelpie;
	#online = true;

	constructor(
		readonly deviceId: string,
		readonly network: DeterministicNetwork,
		options: { now?: () => number; schemaVersion?: number } = {}
	) {
		this.engine = new Kelpie({
			deviceId,
			schemaVersion: options.schemaVersion ?? 1,
			store: this.store,
			transport: network.transport(deviceId),
			now: options.now
		});
	}

	setOnline(online: boolean): void {
		this.#online = online;
		if (online) this.network.heal(this.deviceId);
		else this.network.partition(this.deviceId);
	}

	get online(): boolean {
		return this.#online;
	}
}

export class SyncSimulation {
	readonly network: DeterministicNetwork;
	readonly replicas: SimulatedReplica[];

	constructor(
		deviceIds: string[],
		options: NetworkOptions & { now?: (deviceId: string) => () => number } = {}
	) {
		this.network = new DeterministicNetwork(options);
		this.replicas = deviceIds.map(
			(deviceId) =>
				new SimulatedReplica(deviceId, this.network, {
					now: options.now?.(deviceId)
				})
		);
	}

	async converge(rounds = 8): Promise<void> {
		for (let round = 0; round < rounds; round += 1) {
			let hadPending = false;
			for (const replica of this.replicas) {
				if (!replica.online) continue;
				const pending = await replica.store.pendingMutations(1);
				if (pending.length) {
					hadPending = true;
					const pushing = replica.engine.syncOnce();
					await Promise.resolve();
					await this.network.flush();
					await pushing;
				}
			}
			for (const replica of this.replicas) {
				if (!replica.online) continue;
				await replica.engine.syncOnce();
			}
			if (!hadPending) break;
		}
	}

	async snapshot(table: string): Promise<Array<Record<string, unknown>[]>> {
		return Promise.all(this.replicas.map((replica) => replica.engine.query({ table })));
	}
}
