---
title: What is Kelpie?
description: A practical introduction to local-first sync, and where Kelpie fits in your app.
group: GETTING STARTED
order: 1
banner: bannerA
---

Kelpie is a fictional, open-source sync engine for TypeScript applications. It gives your app a local store that stays useful offline, then moves changes between devices when a transport is available.

The important distinction is the direction of control: your interface reads and writes locally. A server is a collaborator, not the place every interaction has to wait for.

## The short version

Kelpie combines a typed local database, an outbound queue, a transport adapter, and an explicit conflict policy. It does not choose your cloud provider or prescribe a UI framework.

```ts
const kelpie = createKelpie({
  store: indexedDbStore({ name: 'field-notes' }),
  transport: httpTransport({ endpoint: '/sync' })
});
```

## What it is not

Kelpie is not a hosted database, authentication service, or a replacement for domain validation. The server still owns authorization and shared invariants. Kelpie makes the client resilient; it does not make untrusted input trustworthy.

## The shape of a sync

1. Your app writes a typed record to local storage.
2. Kelpie records the change in an ordered, durable queue.
3. A transport sends pending operations when it can reach the server.
4. The server acknowledges, rejects, or returns changes to apply.
5. Your conflict policy decides how overlapping edits are reconciled.

## Start here

Install the package, define a store, then make one local write. The [quick start](/docs/library/quick-start) walks through that path; [conflict resolution](/docs/library/conflict-resolution) explains what happens when two devices change the same record.
