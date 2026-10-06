---
title: Cursor pagination
description: Sync large collections in bounded, repeatable pages without missing concurrent writes.
group: GUIDES
order: 10
---

For a large remote collection, use a stable cursor rather than page numbers. The cursor represents a position in the server's change stream, not a count of records that happened to be returned.

## Request a page

```ts
const page = await transport.pull({
  cursor: checkpoint,
  limit: 250,
  signal
});
```

Apply each page and its next cursor in one local transaction. If the process stops before commit, request the same page again; the server endpoint should return idempotent operations for a repeated cursor.

## Avoid gaps

The server should advance the cursor only after all operations in the page have been included. If writes can arrive during pagination, use a snapshot boundary or a monotonic change sequence, then continue from that boundary.

## Keep checkpoints per account

A cursor belongs to the authenticated data scope that issued it. Clear or partition checkpoints when accounts change; never reuse one account's cursor under another identity.
