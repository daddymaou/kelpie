import { describe, expect, it } from 'vitest';
import {
	clockSchema,
	mutationSchema,
	protocolFailureSchema,
	protocolVersion,
	pullRequestSchema,
	pushRequestSchema
} from './index.js';

const validMutation = {
	id: '01JGFJJZ000000000000000000',
	table: 'tasks',
	rowId: 'task-1',
	op: 'update',
	fields: { title: 'Review sync protocol' },
	hlc: { wallTime: 1_735_689_600_000, counter: 0, deviceId: 'device-a' },
	schemaVersion: 1,
	deviceId: 'device-a'
} as const;

describe('protocol schemas', () => {
	it('accepts a valid hybrid logical clock and mutation', () => {
		expect(clockSchema.parse(validMutation.hlc).counter).toBe(0);
		expect(mutationSchema.parse(validMutation).id).toBe(validMutation.id);
	});

	it('rejects malformed mutation identifiers and negative clock components', () => {
		expect(
			mutationSchema.safeParse({ ...validMutation, id: 'not-a-ulid' }).success
		).toBe(false);
		expect(
			clockSchema.safeParse({ wallTime: 10, counter: -1, deviceId: 'device-a' }).success
		).toBe(false);
	});

	it('applies the pull page default and caps invalid page sizes', () => {
		expect(
			pullRequestSchema.parse({
				protocolVersion,
				cursor: null,
				schemaVersion: 1
			}).limit
		).toBe(100);
		expect(
			pullRequestSchema.safeParse({
				protocolVersion,
				cursor: null,
				limit: 501,
				schemaVersion: 1
			}).success
		).toBe(false);
	});

	it('requires the matching protocol version on every request', () => {
		expect(
			pushRequestSchema.safeParse({
				protocolVersion: 2,
				mutations: [validMutation]
			}).success
		).toBe(false);
	});

	it('validates structured protocol failures', () => {
		expect(
			protocolFailureSchema.safeParse({
				protocolVersion,
				error: {
					code: 'SCHEMA_VERSION_TOO_NEW',
					message: 'The server does not support this schema version.',
					retryable: false
				}
			}).success
		).toBe(true);
	});
});
