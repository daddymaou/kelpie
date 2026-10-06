---
title: Quick start
description: Create a local collection, make a write, and send it when your app comes online.
group: GETTING STARTED
order: 3
---

This walkthrough creates a small field-note collection. It assumes the core package and IndexedDB adapter are installed.

```ts
import { createKelpie, defineSchema } from '@kelpie/sync';
import { indexedDbStore } from '@kelpie/adapter-indexeddb';

const schema = defineSchema({
  notes: {
    id: 'string',
    body: 'string',
    updatedAt: 'number'
  }
});

const kelpie = createKelpie({
  schema,
  store: indexedDbStore({ name: 'field-notes' }),
  clientId: 'browser'
});
```

## Write locally

Open the store before subscribing or writing. A successful local write resolves without waiting for a network connection.

```ts
await kelpie.open();
await kelpie.collection('notes').put({
  id: crypto.randomUUID(),
  body: 'Check the tide gauge',
  updatedAt: Date.now()
});
```

## Add a transport

```ts
await kelpie.sync({
  transport: httpTransport({ endpoint: '/api/sync' })
});
```

The transport can report offline status without rejecting local operations. Inspect `pendingCount` to show a sync indicator, and use [offline queue](/docs/library/offline-queue) to tune retries and persistence.

## Close cleanly

Call `close()` when the owning application scope ends. In a component framework, keep one engine instance per application rather than creating one per render.
