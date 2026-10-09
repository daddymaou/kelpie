---
title: Offline queue
description: Understand durable pending writes, retry behavior, and how to expose sync status.
group: FEATURES
order: 5
---

Every local mutation enters the store's durable outbox. In IndexedDB the outbox lives beside the materialized rows, so a refresh or process restart does not turn an offline write into lost work.

## Queue lifecycle

The outbox is the set of mutations the server has not acknowledged. Each record is `{ mutation, acknowledged, cursor }`:

- **pending** — written locally, not yet acknowledged by the server.
- **acknowledged** — the server accepted the mutation id; the record is retained in the log for diagnosis, but is no longer pending.

`pendingMutations(limit)` returns the pending set; `markAcknowledged(ids, cursor)` moves entries out of it. The `Kelpie` engine combines these internally on every sync:

```ts
const pending = await store.pendingMutations(500);
if (pending.length) {
  const pushed = await transport.push(pending.map((record) => record.mutation));
  await store.markAcknowledged(pushed.accepted, pushed.cursor);
}
```

A rejected mutation is never silently dropped — the engine emits it as an error event carrying the protocol error, so the application can decide what to do.

## Retry policy

The engine runs a sync loop while it is started, calling `syncOnce()` every second. On failure it backs off with exponential retry, bounded and jittered:

```ts
new Kelpie({
  // ...
  retryBaseMs: 500,
  retryMaxMs: 30_000
});
```

An HTTP transport should never be retried blindly: the server returns a structured protocol error with a `retryable` flag, and the engine treats per-mutation rejects as distinct from transport-level failures.

## Honest status

The engine exposes a `status` that reflects *this device's sync state*, not the network at large:

| Value | Meaning |
| --- | --- |
| `idle` | No transport configured, or stopped. |
| `connecting` | `start()` is negotiating the transport. |
| `online` | The last sync succeeded. |
| `syncing` | A push or pull is currently in flight. |
| `offline` | The transport reported a connection error. |
| `error` | Sync failed; the engine is backing off. |

Expose the pending count and the status together. A pending item means the change is saved locally — not that every device has received it. Avoid showing "all synced" when a queue is non-empty.

## Queue size and retention

Monitor queue growth and define an application-specific retention policy for acknowledged history. Never prune pending or rejected operations automatically; provide a recovery or export path first. The [CLI reference](/docs/cli/cli-reference) shows how to inspect the queue and log from a project directory.