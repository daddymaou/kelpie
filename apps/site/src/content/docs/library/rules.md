---
title: Rules
description: Keep client sync policy separate from authorization and server-side invariants.
group: CUSTOMIZE
order: 8
---

Rules describe how a client queues and reconciles changes. They improve user experience; they are not a security boundary. A modified client can bypass any local rule, so the server must still authorize every operation.

## What belongs on the client

- A durable outbox and retry scheduling ([offline queue](/docs/library/offline-queue)).
- Per-table conflict resolution for a good default experience ([conflict resolution](/docs/library/conflict-resolution)).
- Query subscriptions that reflect the local materialized state.

These are presentational and experiential. They decide how the interface behaves, not who may change what.

## What belongs on the server

- Authentication: verifying the bearer token, either from a shared secret or a JWKS endpoint.
- Authorization: the row-level permission hook, run against verified claims for every push mutation and every pulled row.
- Shared invariants: queries, uniqueness, or business constraints that must hold even when many devices write concurrently.
- Server-side schema version: the maximum `schemaVersion` the deployment accepts.

```ts
import { createKelpieApp } from '@kelpie/server';

const app = createKelpieApp({
  config,
  store,
  logger,
  rowPermissionHook: (ctx, table, _rowId, op) => {
    if (table === 'posts' && op !== 'read') return ctx.scopes.includes('posts:write');
    return true;
  }
});
```

## Never trust a client rule as a gate

A resolver might be configured to keep the newest edit, and a UI might disable input while offline. Neither stops a malicious user or a buggy release. Anything that must be *enforced* — quotas, ownership checks, schema boundaries — has to run on the server, where a modified client cannot reach around it.

## When the server rejects

The protocol separates *rejected* mutations (failed validation or permission) from *accepted* ones. The engine surfaces each rejection as an error event with the protocol error message, so the application can show a reason instead of a mystery. A rejected mutation stays in the log for inspection; it is the application's job to decide whether to retry, repair, or hide it.

Read about [configuration](/docs/library/configuration) for the hook signature and the built-in helpers.