/**
 * Fixed-window per-identity rate limiter.
 * Windows align to wall-clock minutes so Retry-After math is deterministic.
 */
export interface RateLimitDecision {
	allowed: boolean;
	remaining: number;
	retryAfterSeconds: number;
}

export class RateLimiter {
	readonly #counts = new Map<string, { window: number; count: number }>();

	constructor(
		private readonly limitPerMinute: number,
		private readonly now: () => number = Date.now
	) {}

	check(identity: string): RateLimitDecision {
		const window = Math.floor(this.now() / 60_000);
		const entry = this.#counts.get(identity);
		if (!entry || entry.window !== window) {
			this.#counts.set(identity, { window, count: 1 });
			return { allowed: true, remaining: this.limitPerMinute - 1, retryAfterSeconds: 0 };
		}
		entry.count += 1;
		if (entry.count > this.limitPerMinute) {
			const retryAfterSeconds = Math.max(1, Math.ceil((60_000 - (this.now() % 60_000)) / 1000));
			return { allowed: false, remaining: 0, retryAfterSeconds };
		}
		return { allowed: true, remaining: Math.max(0, this.limitPerMinute - entry.count), retryAfterSeconds: 0 };
	}

	/** Drop entries from windows older than the current one to bound memory. */
	sweep(): void {
		const window = Math.floor(this.now() / 60_000);
		for (const [identity, entry] of this.#counts) {
			if (entry.window < window) this.#counts.delete(identity);
		}
	}
}
