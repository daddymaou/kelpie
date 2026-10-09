---
title: Configuration
description: Reference for the engine, storage, transport, conflict, and server options.
group: REFERENCE
order: 9
---

Configuration is passed to the `Kelpie` constructor on the client and resolved from environment variables on the server. Keep values explicit so behavior is easy to inspect in tests and deployment reviews.

## Engine options

```ts
interface EngineOptions {
  deviceId: string;
  schemaVersion: number;
  store: LocalStore;
  transport?: SyncTransport;
  resolvers?: Record<string, TableResolver>;
  now?: () => number;
  random?: () => number;
  retryBaseMs?: number;
  retryMaxMs?: number;
}
```

| Option | Purpose |
| --- | --- |
| `deviceId` | Stable identity for this replica; stamps every mutation it creates. |
| `schemaVersion` | The local data version this build understands. Sent on every pull so the server can refuse too-new clients and migrate older ones. |
| `store` | The persistence adapter (`MemoryStore`, IndexedDB, or custom). |
| `transport` | A push/pull endpoint. Without it, the engine is a fully functional offline store. |
| `resolvers` | Per-table conflict policies; the default is `lastWriteWins`. |
| `now` / `random` | Clock and jitter sources, injectable for determinism in tests. |
| `retryBaseMs` / `retryMaxMs` | Bounds for the sync loop's exponential backoff. |

## Server configuration

The server reads environment variables (see `packages/server/.env.example`):

| Variable | Default | Meaning |
| --- | --- | --- |
| `KELPIE_PORT` | `3000` | Listen port. |
| `KELPIE_CORS_ORIGIN` | `*` | Comma-separated allowed origins. |
| `KELPIE_RATE_LIMIT_PER_MINUTE` | `600` | Per-identity push request budget. |
| `KELPIE_MAX_REQUEST_BYTES` | `1 MiB` | Max JSON body size. |
| `KELPIE_AUTH` | derived | `none`, `shared-secret`, or `jwks`. |
| `KELPIE_JWT_SECRET` | — | HS256 shared secret (shared-secret mode). |
| `KELPIE_JWKS_URL` | — | JWKS endpoint for asymmetric verification. |
| `KELPIE_JWT_ISSUER` / `KELPIE_JWT_AUDIENCE` | — | Optional token claim checks. |
| `KELPIE_STORE` | derived | `postgres` or `memory`; defaults to `postgres` when `DATABASE_URL` is set. |
| `DATABASE_URL` | — | Postgres connection string for the durable store. |
| `KELPIE_SCHEMA_VERSION` | `1` | The schema version this server accepts. |
| `KELPIE_COMPACTION_MAX_AGE_MS` | off | Age past which tombstones/log entries are compacted. |
| `KELPIE_LOG_LEVEL` | `info` | pino log level. |

The `memory` store keeps mutations in process memory and loses them on restart; it is for local development only. Authentication mode conflicts (for example setting both a secret and a JWKS URL) are rejected at startup rather than ignored.

## Permission hooks

Authorization is application-owned. The server accepts a `rowPermissionHook` that receives the verified claims, the table, the row id, and the operation, and decides whether it is allowed. Writes are rejected per-mutation on push; reads are filtered on pull. Helpers ship for common cases:

```ts
import { createKelpieApp, ownerOnly, scopedAccess } from '@kelpie/server';

const app = createKelpieApp({
  config,
  store,
  logger,
  // Single-tenant "my data only" app:
  rowPermissionHook: ownerOnly('user_42'),
  // or, for role curricula:
  // rowPermissionHook: scopedAccess({ readScopes: ['notes:read'], writeScopes: ['notes:write'] })
});
```

The hook receives the authenticated context (`userId` and `scopes` from the verified token) plus the operation. Return `false` to reject. See the [rules guide](/docs/library/rules) for the boundary between client policy and server authority.