---
title: What is Kelpie?
description: A practical introduction to local-first sync, and where Kelpie fits in your app.
group: GETTING STARTED
order: 1
banner: bannerA
---

Kelpie is an open-source sync engine for TypeScript applications. It gives your app a local store that stays useful offline, then moves changes between devices when a transport is available.

The important distinction is the direction of control: your interface reads and writes locally. A server is a collaborator, not a place every interaction has to wait for.

## The short version

`@kelpie/core` combines a typed local database, a durable outbound queue, a transport adapter, and an explicit conflict policy. It does not choose your cloud provider, your UI framework, or your authorization model.

```ts
import { Kelpie, openIndexedDbStore, createHttpSyncTransport } from '@kelpie/core';

const kelpie = new Kelpie({
  deviceId: 'device-A',
  schemaVersion: 1,
  store: await openIndexedDbStore('field-notes'),
  transport: createHttpSyncTransport({
    baseUrl: '/sync',
    getToken: () => session.accessToken
  })
});
```

## How the engine is put together

Every piece of a document is owned by a specific part of the engine:

- **The hybrid logical clock** orders mutations without requiring synchronized wall clocks. Two devices can be set to the wrong time and the engine still agrees on order.
- **The store** persists materialized rows *and* the append-only mutation log in the same place. IndexedDB in the browser, memory in tests.
- **The queue** is the set of locally-written mutations the server has not acknowledged yet. It survives a restart.
- **The transport** exchanges push and pull messages with your sync endpoint over the small, versioned [protocol](/docs/library/cursor-pagination).
- **The resolver** decides, per table, what to keep when overlapping edits arrive. Applications choose the policy.

## The shape of a sync

1. Your app writes a typed record through the engine. It is applied locally immediately.
2. The write is recorded as a mutation in the durable outbox.
3. When a transport is configured, the engine pushes pending mutations and pulls new ones.
4. The server acknowledges, rejects, or returns changes; each response page carries a cursor.
5. Your per-table resolver reconciles overlapping edits as remote mutations land.

## What it is not

Kelpie is not a hosted database, an authentication service, or a replacement for domain validation. The server still owns authorization and shared invariants — the client persists and reconciles, but it does not make untrusted input trustworthy.

## Start here

Install the package, open a store, and make one local write. The [quick start](/docs/library/quick-start) walks through that path; [conflict resolution](/docs/library/conflict-resolution) explains what happens when two devices change the same record.