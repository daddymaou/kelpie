---
title: Quick start
description: Create a local collection, make a write, and send it when your app comes online.
group: GETTING STARTED
order: 3
---

This walkthrough creates a small field-note collection. It uses `MemoryStore` so you can run it in a test or a notebook; swap in `openIndexedDbStore('field-notes')` for a real browser without changing anything else.

```ts
import { Kelpie, MemoryStore } from '@kelpie/core';

const kelpie = new Kelpie({
  deviceId: 'device-A',
  schemaVersion: 1,
  store: new MemoryStore()
});
```

## Write locally

A successful local write resolves without waiting for a network. The engine applies the mutation to the store and records it in the outbox:

```ts
const mutation = await kelpie.insert('notes', {
  id: 'n_01H8Z',
  body: 'Check the tide gauge',
  updatedAt: Date.now()
});

console.log(kelpie.status); // 'idle' — no transport configured yet
```

Every local write returns the typed `Mutation` it created, including the hybrid logical clock stamp.

## Read what is here

Queries materialize current rows from the store. A row with fields written after a delete is hidden; see [conflict resolution](/docs/library/conflict-resolution) for tombstones.

```ts
const notes = await kelpie.query({
  table: 'notes',
  select: (row) => ({ id: row.id, body: row.body })
});
```

Subscribe to a query to get rows reactively whenever the table changes — from local writes or incoming sync:

```ts
const unsubscribe = kelpie.subscribe(
  { table: 'notes' },
  (rows) => console.log('notes changed', rows)
);
```

## Add a transport

Once a transport exists, the engine can push pending mutations and pull remote ones:

```ts
import { createHttpSyncTransport } from '@kelpie/core';

const kelpie = new Kelpie({
  // ...as above, plus:
  transport: createHttpSyncTransport({
    baseUrl: 'http://localhost:8787',
    getToken: () => session.accessToken
  })
});

await kelpie.start();        // connect and run the sync loop
await kelpie.syncOnce();     // or: push + pull exactly once
```

The transport can fail without rejecting local operations: writes stay in the queue, and the engine reports `offline` or `error` status. The [offline queue guide](/docs/library/offline-queue) covers retries and persistence.

## Close cleanly

Stop the engine and close the store when the application scope ends:

```ts
await kelpie.stop();
store.close();
```

Keep one engine instance per application rather than creating one per render.

## Next

- [Conflict resolution](/docs/library/conflict-resolution) — what happens when two devices edit the same row.
- [Offline queue](/docs/library/offline-queue) — the durable outbox, retries, and honest status.
- [Adapters](/docs/library/adapters) — the `LocalStore` and `SyncTransport` contracts.