---
title: Configuration
description: Reference for the engine, storage, transport, conflict, and retry options.
group: REFERENCE
order: 9
---

Configuration is passed to `createKelpie`. Keep values explicit so app behavior is easy to inspect in tests and deployment reviews.

## Engine options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `schema` | `Schema` | required | Collection definitions and schema version |
| `store` | `StoreAdapter` | required | Local persistence for records and queue |
| `clientId` | `string` | generated | Stable identifier for this replica |
| `conflicts` | `Record<string, Resolver>` | per-engine policy | Resolver selected by collection |
| `retry` | `RetryOptions` | bounded exponential | Transient transport retry policy |
| `batchSize` | `number` | `100` | Maximum operations per transport request |
| `logger` | `Logger` | silent | Structured diagnostic event sink |

## Retry options

| Option | Type | Description |
| --- | --- | --- |
| `initialDelayMs` | `number` | Delay before the first retry |
| `maximumDelayMs` | `number` | Upper bound for retry delay |
| `multiplier` | `number` | Backoff growth between attempts |
| `jitter` | `number` | Randomized fraction to spread retry traffic |

`batchSize` must be a positive integer. Keep it within server limits and account for operation payload size, not only record count.
