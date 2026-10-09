/**
 * Minimal in-process counters exposed at /metrics in Prometheus text format.
 * Metrics are process-local: a restarted server restarts its counters, which
 * matches how the rest of the in-memory state behaves.
 */
export interface MetricLabels {
	[name: string]: string | number;
}

function labelKey(name: string, labels: MetricLabels): string {
	const entries = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b));
	if (entries.length === 0) return name;
	const rendered = entries.map(([key, value]) => `${key}="${String(value).replaceAll('"', '\\"')}"`).join(',');
	return `${name}{${rendered}}`;
}

export class Metrics {
	readonly #counters = new Map<string, number>();
	readonly #startedAt = Date.now();

	constructor(
		private readonly namePrefix = 'kelpie_',
		private readonly now: () => number = Date.now
	) {}

	increment(name: string, labels: MetricLabels = {}, delta = 1): void {
		const key = this.namePrefix + labelKey(name, labels);
		this.#counters.set(key, (this.#counters.get(key) ?? 0) + delta);
	}

	gauge(name: string, value: number, labels: MetricLabels = {}): void {
		this.#counters.set(this.namePrefix + labelKey(name, labels), value);
	}

	get(name: string, labels: MetricLabels = {}): number {
		return this.#counters.get(this.namePrefix + labelKey(name, labels)) ?? 0;
	}

	/** Prometheus text exposition format. */
	render(): string {
		const lines: string[] = [];
		const sorted = [...this.#counters.entries()].sort(([a], [b]) => a.localeCompare(b));
		for (const [key, value] of sorted) {
			lines.push(`${key} ${value}`);
		}
		lines.push(`${this.namePrefix}uptime_seconds ${(this.now() - this.#startedAt) / 1000}`);
		return `${lines.join('\n')}\n`;
	}

	toJson(): Record<string, number> {
		return Object.fromEntries([...this.#counters.entries()].map(([key, value]) => [key, value]));
	}
}
