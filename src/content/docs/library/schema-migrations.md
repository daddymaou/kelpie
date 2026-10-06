---
title: Schema & migrations
description: Evolve local data safely with versioned schemas and restartable migrations.
group: CUSTOMIZE
order: 6
---

Schemas describe the records Kelpie stores locally and validates before a write enters the queue. Keep schema versions with your application release so the data model and migration path can be reviewed together.

## Declare a version

```ts
const schema = defineSchema({
  version: 2,
  collections: {
    notes: {
      id: 'string',
      body: 'string',
      pinned: 'boolean'
    }
  }
});
```

## Migrate incrementally

A migration receives the prior record and returns a record valid for the new schema. Migrations should be deterministic and safe to resume; process bounded batches so large stores do not block startup.

```ts
const migrations = {
  1: (old: { id: string; body: string }) => ({
    ...old,
    pinned: false
  })
};
```

## Handle interrupted work

Store migration progress transactionally with each batch. If the app closes partway through, it can continue without applying a non-idempotent transformation twice. Keep a backup or export path for high-value user data.

## Roll forward deliberately

Do not assume that an older client can understand a new server payload. Version the wire format independently, and use a compatibility window while old application versions remain supported.
