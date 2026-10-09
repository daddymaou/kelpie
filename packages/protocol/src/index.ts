import { z } from 'zod';

export const protocolVersion = 1 as const;

export const protocolVersionSchema = z.literal(protocolVersion);

export const clockSchema = z
	.object({
		wallTime: z.number().int().nonnegative(),
		counter: z.number().int().nonnegative(),
		deviceId: z.string().min(1)
	})
	.strict();

export type Clock = z.infer<typeof clockSchema>;

const ulidSchema = z.string().regex(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i, 'Expected a ULID');

export const mutationSchema = z
	.object({
		id: ulidSchema,
		table: z.string().min(1),
		rowId: z.string().min(1),
		op: z.enum(['insert', 'update', 'delete']),
		fields: z.record(z.unknown()),
		hlc: clockSchema,
		schemaVersion: z.number().int().positive(),
		deviceId: z.string().min(1)
	})
	.strict();

export type Mutation = z.infer<typeof mutationSchema>;

export const protocolErrorCodeSchema = z.enum([
	'UNSUPPORTED_PROTOCOL_VERSION',
	'INVALID_REQUEST',
	'SCHEMA_VERSION_TOO_NEW',
	'UNAUTHENTICATED',
	'FORBIDDEN',
	'RATE_LIMITED',
	'PAYLOAD_TOO_LARGE',
	'CONFLICT',
	'INTERNAL'
]);

export const protocolErrorSchema = z
	.object({
		code: protocolErrorCodeSchema,
		message: z.string().min(1),
		retryable: z.boolean(),
		details: z.record(z.unknown()).optional()
	})
	.strict();

export type ProtocolError = z.infer<typeof protocolErrorSchema>;

export const pullRequestSchema = z
	.object({
		protocolVersion: protocolVersionSchema,
		cursor: z.string().nullable(),
		limit: z.number().int().min(1).max(500).default(100),
		schemaVersion: z.number().int().positive()
	})
	.strict();

export type PullRequest = z.infer<typeof pullRequestSchema>;

export const pullResponseSchema = z
	.object({
		protocolVersion: protocolVersionSchema,
		mutations: z.array(mutationSchema),
		nextCursor: z.string().nullable(),
		hasMore: z.boolean()
	})
	.strict();

export type PullResponse = z.infer<typeof pullResponseSchema>;

export const pushRequestSchema = z
	.object({
		protocolVersion: protocolVersionSchema,
		mutations: z.array(mutationSchema).max(500)
	})
	.strict();

export type PushRequest = z.infer<typeof pushRequestSchema>;

export const pushResponseSchema = z
	.object({
		protocolVersion: protocolVersionSchema,
		accepted: z.array(ulidSchema),
		cursor: z.string().nullable(),
		rejected: z
			.array(
				z
					.object({
						id: ulidSchema,
						error: protocolErrorSchema
					})
					.strict()
			)
			.default([])
	})
	.strict();

export type PushResponse = z.infer<typeof pushResponseSchema>;

export const protocolFailureSchema = z
	.object({
		protocolVersion: protocolVersionSchema,
		error: protocolErrorSchema
	})
	.strict();

export type ProtocolFailure = z.infer<typeof protocolFailureSchema>;
