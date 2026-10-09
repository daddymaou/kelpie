# @kelpie/core

The Kelpie engine: durable local writes, a typed outbox, queries and subscriptions, hybrid logical clocks, conflict resolvers, and the stores and transports those rely on.

```ts
import { Kelpie, openIndexedDbStore, createHttpSyncTransport } from '@kelpie/core';

const kelpie = new Kelpie({
  deviceId: 'browser_a1b2',
  schemaVersion: 1,
  store: await openIndexedDbStore('field-notes'),
  transport: createHttpSyncTransport({ baseUrl: '/sync' })
});

await kelpie.insert('notes', { id: 'n_01', body: 'Write locally. Reconcile later.' });
await kelpie.start();
```

## Contents

- `Kelpie` — the engine (`insert`, `update`, `delete`, `query`, `subscribe`, `syncOnce`, `start`, `stop`).
- `HybridLogicalClock` — total event ordering without synchronized wall clocks.
- `MemoryStore`, `IndexedDbStore`, `openIndexedDbStore` — the `LocalStore` contract.
- `createHttpSyncTransport`, `SyncTransport` — the seam for moving mutations.
- `lastWriteWins`, `visibleRow`, `TableResolver` — deterministic conflict resolution.
- `KelpieSchema`, `runMigrations`, `MigrationStep` — versioned local data evolution.

## Run

```sh
pnpm install
pnpm --filter @kelpie/core test
pnpm --filter @kelpie/core check
```

## License

Apache-2.0.