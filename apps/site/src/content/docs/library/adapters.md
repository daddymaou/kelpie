---
title: Adapters
description: Select a persistence and transport adapter that matches your runtime boundary.
group: CUSTOMIZE
order: 7
---

Kelpie's core depends on adapter contracts, not a specific database or network service. A storage adapter persists records and queue metadata; a transport adapter exchanges operations with your sync endpoint.

## The LocalStore contract

A store owns rows, the mutation log, the outbox, and the sync cursor. Any implementation of `LocalStore` from `@kelpie/core` works:

```ts
interface LocalStore {
  appendAndApply(mutation, resolver): Promise<void>;
  applyRemote(mutation, cursor, resolver): Promise<void>;
  getRow(table, rowId): Promise<MaterializedRow | undefined>;
  listRows(table): Promise<MaterializedRow[]>;
  pendingMutations(limit): Promise<MutationRecord[]>;
  markAcknowledged(ids, cursor): Promise<void>;
  lastCursor(): Promise<string | null>;
  setCursor(cursor): Promise<void>;
  allMutations(limit): Promise<MutationRecord[]>;
}
```

The two write methods split local writes from incoming sync: `appendAndApply` is used by the engine for writes this device made, `applyRemote` for mutations from the transport (which also advance the cursor).

### Bundled stores

- **`MemoryStore`** — deterministic, in-process. Use it in tests, simulation, and SSR-safe code.
- **`openIndexedDbStore(name)`** → `IndexedDbStore` — durable browser persistence. It opens (or creates) three object stores: `rows`, `mutations`, and `state`. Call `close()` when the app scope ends.

```ts
import { Kelpie, MemoryStore, openIndexedDbStore } from '@kelpie/core';

const inTest = new Kelpie({ deviceId: 'a', schemaVersion: 1, store: new MemoryStore() });
const inBrowser = new Kelpie({ deviceId: 'a', schemaVersion: 1, store: await openIndexedDbStore('app') });
```

## The SyncTransport contract

A transport moves mutations in and out. It need not be, and usually is not, the same authority as your application server:

```ts
interface SyncTransport {
  push(mutations, signal?): Promise<PushResponse>;
  pull(cursor, schemaVersion, signal?): Promise<PullResponse>;
  connect?(handlers): Promise<() => void>;
}
```

`createHttpSyncTransport` implements the codec for the Kelpie wire protocol against your endpoint's `/push` and `/pull`:

```ts
import { createHttpSyncTransport } from '@kelpie/core';

const transport = createHttpSyncTransport({
  baseUrl: 'https://sync.example.com',
  getToken: () => localStorage.getItem('access_token')
});
```

The optional `connect()` lets a transport stream mutations in real time (for example over WebSocket) while keeping the same push/pull contract for the durable path.

## Lifecycle notes

- Create one engine per application, not per render. It owns the clock, the store, and the sync loop.
- Across prerender — `MemoryStore` is safe anywhere; IndexedDB initialization must run after the browser runtime exists.
- Always close engine-scoped resources (`stop()` and store `close()`) so IndexedDB connections do not accumulate.

The [protocol](/docs/library/cursor-pagination) describes the wire shapes a custom transport must honor.