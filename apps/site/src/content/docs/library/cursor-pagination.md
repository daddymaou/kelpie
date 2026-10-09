---
title: Cursor pagination
description: Sync large collections in bounded, repeatable pages without missing concurrent writes.
group: GUIDES
order: 10
---

For a large remote collection, use a stable cursor rather than page numbers. The cursor represents a position in the server's change stream, not a count of records that happened to be returned.

## Push first, then pull

The engine's sync does two things in order: it pushes pending mutations and then pulls. Pushing first guarantees the server has your writes before you read its view of the world.

```ts
// What @kelpie/core does inside syncOnce():
const pending = await store.pendingMutations(500);
if (pending.length) {
  const pushed = await transport.push(pending.map((record) => record.mutation));
  await store.markAcknowledged(pushed.accepted, pushed.cursor);
}

let cursor = await store.lastCursor();
for (;;) {
  const pulled = await transport.pull(cursor, schemaVersion);
  await store.applyRemote(pulled.mutations, pulled.nextCursor);
  if (!pulled.hasMore) break;
  cursor = pulled.nextCursor;
}
```

## Why a cursor and not a page number

A page number assumes a stable, ordered list: insert a write between two fetches and every later page silently shifts. A cursor is an opaque position marker returned by the server. The client sends it back unchanged, so the server can resume exactly where it left off — including concurrent writes that landed after the previous page was issued.

The server's cursor advances monotonically as mutations are appended. A small number of pages (`limit` up to `500` per request, `100` by default in the HTTP transport) keeps each response bounded.

## Idempotent application

Every mutation has a client-generated `id` (a ULID). When the same id is pushed twice — a retry, a duplicate delivery, a crashed client — the server appends it once, and the store records it once:

```
accepted  → the subset of pushed ids the server kept
rejected  → per-mutation failures with a protocol error
cursor    → the server's position after this append batch
```

The pushed cursor and ids let the client mark exactly those mutations acknowledged. On the other side, `applyRemote` skips mutations already present in the local store, so re-pulling the same cursor is harmless.

## Reading the wire shapes

The protocol defines three strict schemas — the mutation, the push response, and the pull response — all in `@kelpie/protocol`. The wire format is a few hundred lines of Zod and is [documented in the package](/docs/library/adapters):

```ts
{
  protocolVersion,        // 1
  mutations: Mutation[],  // bounded page
  nextCursor: string | null,
  hasMore: boolean
}
```

When `hasMore` is true, the client keeps pulling with the returned cursor. When it is false, the whole change stream is caught up — until the next push or someone else writes.