---
title: Troubleshooting
description: Diagnose a stalled queue, migration failure, or adapter that behaves differently offline.
group: HELP
order: 11
---

Start with the operation state and the server logs. A useful diagnostic record includes the mutation id, table, retry count, and error category. Avoid logging record contents or credentials.

## A stalled queue

Pending mutations never drain. Check, in order:

1. Is a transport configured? Without one, nothing leaves the device — by design. `kelpie status` shows `serverUrl: null`.
2. Is the engine started? `start()` runs the loop; a bare `new Kelpie(...)` stays `idle`.
3. What does `transport.push` return? A `rejected` entry carries a protocol error — `FORBIDDEN`, `SCHEMA_VERSION_TOO_NEW`, or `RATE_LIMITED` each point at a different layer.
4. Run `kelpie queue` to see the oldest pending mutations and their cursors.

## SCHEMA_VERSION_TOO_NEW

The client's `schemaVersion` exceeds the server's `KELPIE_SCHEMA_VERSION`. Raise the server variable only after every deployed client has migrated, or deploy a matching client. The engine surfaces the exact rejected mutation id.

## Permission denied

`FORBIDDEN` on push means the `rowPermissionHook` returned `false` for that table/row/op. Check the hook against the verified token's `userId` and `scopes`. `UNAUTHENTICATED` means no (or an invalid) bearer token reached the server — verify the transport's `getToken` and the JWT mode (`shared-secret` vs `jwks`) match the issuer.

## Migration failed

A migration throws. The engine reports the failed step. Because migrations restart from the recorded version, fix the step and re-run. If `runMigrations` throws *"Missing migration from version X to X+1"*, a step is missing from the chain — every boundary needs an entry.

## Adapter differences offline

The `MemoryStore` and `IndexedDbStore` implement the same `LocalStore` contract, but memory is process-local: a crash, a reload, or a server restart empties it. If "lost" writes surprise you, confirm which store the engine received.

## IndexedDB errors in SSR

`openIndexedDbStore` throws where `indexedDB` is undefined. Guard the call to the browser runtime, or use `MemoryStore` during prerender and swap on `onMount`. See the [adapter guide](/docs/library/adapters) for lifecycle notes.

## Invalid cursor

A pull with a malformed or out-of-range cursor returns `INVALID_REQUEST`. Reset the local cursor with `store.setCursor(null)` and re-sync, or inspect where a custom transport fabricated its own cursor value.

## Where to look next

- `kelpie doctor` runs local setup checks.
- `kelpie logs --limit 50` shows recent local mutations.
- Server pino logs trace each push/pull decision and external rejection.