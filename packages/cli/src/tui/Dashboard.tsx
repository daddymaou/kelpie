import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import type { Kelpie, KelpieEvent, SyncStatus } from '@kelpie/core';
import type { Mutation } from '@kelpie/protocol';
import colors from 'yoctocolors';

export interface DashboardProps {
	engine: Kelpie;
	deviceId: string;
	serverUrl?: string;
	onSync?: () => Promise<void>;
}

interface LogLine {
	at: number;
	text: string;
}

export function Dashboard({ engine, deviceId, serverUrl, onSync }: DashboardProps): React.ReactElement {
	const { exit } = useApp();
	const [status, setStatus] = useState<SyncStatus>(engine.status);
	const [queueDepth, setQueueDepth] = useState(0);
	const [logs, setLogs] = useState<LogLine[]>([]);
	const [mutations, setMutations] = useState<Mutation[]>([]);
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const pushLog = (text: string) => {
		setLogs((prev) => [{ at: Date.now(), text }, ...prev].slice(0, 12));
	};

	useEffect(() => {
		const off = engine.on((event: KelpieEvent) => {
			if (event.type === 'status') setStatus(event.status);
			if (event.type === 'queue') setQueueDepth(event.depth);
			if (event.type === 'mutation') {
				pushLog(`${event.source} ${event.mutation.op} ${event.mutation.table}:${event.mutation.rowId}`);
				setMutations((prev) => [event.mutation, ...prev].slice(0, 8));
			}
			if (event.type === 'error') pushLog(`error ${event.error.message}`);
		});
		void engine.options.store.pendingMutations(10_000).then((pending) => setQueueDepth(pending.length));
		return off;
	}, [engine]);

	useInput((input, key) => {
		if (key.ctrl && input === 'p') {
			setPaletteOpen((open) => !open);
			return;
		}
		if (key.ctrl && input === 'c') {
			exit();
			return;
		}
		if (input === 's') {
			setMessage('Syncing…');
			void (onSync ?? (() => engine.syncOnce()))()
				.then(() => setMessage('Sync complete.'))
				.catch((error: unknown) => setMessage(error instanceof Error ? error.message : String(error)));
		}
		if (input === 'r' && paletteOpen) {
			setMessage('Conflict resolution is application-defined — inspect server rejections in logs.');
			setPaletteOpen(false);
		}
	});

	const statusColor = useMemo(() => {
		if (status === 'online') return colors.green;
		if (status === 'error') return colors.red;
		if (status === 'offline') return colors.yellow;
		return colors.cyan;
	}, [status]);

	return (
		<Box flexDirection="column" padding={1}>
			<Text bold>Kelpie CLI</Text>
			<Text dimColor>
				{deviceId} · {serverUrl ?? 'local-only'} · status {statusColor(status)} · queue {queueDepth}
			</Text>
			<Box marginTop={1} flexDirection="row" columnGap={4}>
				<Box flexDirection="column" width="50%">
					<Text underline>Recent mutations</Text>
					{mutations.length === 0 ? <Text dimColor>No mutations yet.</Text> : null}
					{mutations.map((m) => (
						<Text key={m.id}>
							{m.op} {m.table}:{m.rowId}
						</Text>
					))}
				</Box>
				<Box flexDirection="column" width="50%">
					<Text underline>Event log</Text>
					{logs.map((line) => (
						<Text key={`${line.at}-${line.text}`} dimColor>
							{line.text}
						</Text>
					))}
				</Box>
			</Box>
			{paletteOpen ? (
				<Box marginTop={1} flexDirection="column" borderStyle="single" paddingX={1}>
					<Text bold>Command palette (Ctrl+P)</Text>
					<Text>s — sync once</Text>
					<Text>r — conflict notes</Text>
					<Text>Ctrl+C — exit</Text>
				</Box>
			) : null}
			{message ? (
				<Box marginTop={1}>
					<Text>{message}</Text>
				</Box>
			) : null}
			<Box marginTop={1}>
				<Text dimColor>s sync · Ctrl+P palette · Ctrl+C quit</Text>
			</Box>
		</Box>
	);
}
