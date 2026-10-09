import type { Clock } from '@kelpie/protocol';

export interface ClockSource {
	now(): number;
}

const systemClock: ClockSource = { now: () => Date.now() };

export function compareClocks(left: Clock, right: Clock): number {
	if (left.wallTime !== right.wallTime) return left.wallTime - right.wallTime;
	if (left.counter !== right.counter) return left.counter - right.counter;
	return left.deviceId.localeCompare(right.deviceId);
}

export class HybridLogicalClock {
	#last: Clock;

	constructor(
		readonly deviceId: string,
		initial?: Clock,
		private readonly source: ClockSource = systemClock
	) {
		if (!deviceId.trim()) throw new Error('A deviceId is required to create a hybrid logical clock.');
		this.#last = initial ?? { wallTime: 0, counter: 0, deviceId };
	}

	get last(): Clock {
		return { ...this.#last };
	}

	tick(): Clock {
		const physical = Math.max(0, Math.trunc(this.source.now()));
		if (physical > this.#last.wallTime) {
			this.#last = { wallTime: physical, counter: 0, deviceId: this.deviceId };
		} else {
			this.#last = { ...this.#last, counter: this.#last.counter + 1 };
		}
		return this.last;
	}

	receive(remote: Clock): Clock {
		const now = Math.max(0, Math.trunc(this.source.now()));
		const maximum = Math.max(now, this.#last.wallTime, remote.wallTime);
		let counter = 0;
		if (maximum === this.#last.wallTime && maximum === remote.wallTime) {
			counter = Math.max(this.#last.counter, remote.counter) + 1;
		} else if (maximum === this.#last.wallTime) {
			counter = this.#last.counter + 1;
		} else if (maximum === remote.wallTime) {
			counter = remote.counter + 1;
		}
		this.#last = { wallTime: maximum, counter, deviceId: this.deviceId };
		return this.last;
	}
}
