---
title: Adapters
description: Select a persistence and transport adapter that matches your runtime boundary.
group: CUSTOMIZE
order: 7
---

Kelpie's core depends on adapter contracts, not a specific database or network service. A storage adapter persists records and queue metadata; a transport adapter exchanges operations with your sync endpoint.

## Storage choices

| Adapter | Typical use | Considerations |
| --- | --- | --- |
| IndexedDB | Browser applications | Async, durable, scoped to an origin |
| SQLite | Desktop and mobile | Strong transactions, platform packaging required |
| Memory | Tests and ephemeral tools | Lost when the process exits |

## Transport boundary

The transport receives a batch and returns server acknowledgements and remote operations. It should honor cancellation, propagate HTTP failures, and avoid turning an authorization error into a successful empty response.

## Server rendering

Do not open a browser-only adapter during server rendering. Create the engine at the client boundary, then close it when the application shuts down. For tests, inject the memory adapter and a deterministic transport rather than relying on ambient browser globals.

## Implement an adapter

Implement the small adapter interface for transactions, operation ordering, and durable acknowledgement. Preserve ordering per record, make batch acknowledgements idempotent, and include conformance tests for interrupted transactions.
