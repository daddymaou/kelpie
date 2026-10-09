import { useEffect, useRef, useState } from 'react';
import { Kelpie, MemoryStore, type EngineOptions, type KelpieEvent, type SyncStatus } from '@kelpie/core';

export interface UseSyncOptions {
	deviceId: string;
	schemaVersion: number;
	transport?: EngineOptions['transport'];
	store?: EngineOptions['store'];
	autoStart?: boolean;
	resolvers?: EngineOptions['resolvers'];
}

export function useSync(options: UseSyncOptions): Kelpie | null {
	const [engine, setEngine] = useState<Kelpie | null>(null);
	const optionsRef = useRef(options);
	optionsRef.current = options;

	useEffect(() => {
		const current = optionsRef.current;
		const store = current.store ?? new MemoryStore();
		const nextEngine = new Kelpie({
			deviceId: current.deviceId,
			schemaVersion: current.schemaVersion,
			store,
			transport: current.transport,
			resolvers: current.resolvers
		});
		setEngine(nextEngine);

		if (current.autoStart !== false && current.transport) {
			void nextEngine.start();
		}

		return () => {
			void nextEngine.stop();
		};
	}, [options.deviceId, options.schemaVersion, options.store, options.transport, options.autoStart, options.resolvers]);

	return engine;
}

export function useKelpieStatus(engine: Kelpie | null): SyncStatus {
	const [status, setStatus] = useState<SyncStatus>(engine?.status ?? 'idle');
	useEffect(() => {
		if (!engine) {
			setStatus('idle');
			return;
		}
		setStatus(engine.status);
		return engine.on((event: KelpieEvent) => {
			if (event.type === 'status') setStatus(event.status);
		});
	}, [engine]);
	return status;
}

export function useKelpieEvents(engine: Kelpie | null, onEvent: (event: KelpieEvent) => void): void {
	const handler = useRef(onEvent);
	handler.current = onEvent;
	useEffect(() => {
		if (!engine) return;
		return engine.on((event) => handler.current(event));
	}, [engine]);
}
