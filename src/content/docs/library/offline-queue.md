---
title: Offline queue
description: Understand durable pending writes, retry behavior, and how to expose sync status.
group: FEATURES
order: 5
---

Every local mutation enters an ordered outbox. The configured store persists it beside the record so a refresh or process restart does not turn an offline write into lost work.

## Queue lifecycle

An operation moves from `pending` to `sending`, then to `acknowledged` or `blocked`. A transport failure returns the operation to `pending` with a retry time. Server validation failures become `blocked` and are emitted for the application to inspect.

## Retry policy

Use bounded exponential backoff with jitter for transient failures. Respect `Retry-After` when the server provides it, and avoid retrying permanent authorization or validation errors until the underlying issue changes.

```ts
const retry = {
  initialDelayMs: 800,
  maximumDelayMs: 45_000,
  multiplier: 2,
  jitter: 0.2
};
```

## Show honest status

Expose the pending count and last successful sync time. A pending item means the change is saved locally, not that every device has received it. Avoid presenting a green “synced” state until the server has acknowledged the relevant operation.

## Queue size and retention

Monitor queue growth and define an application-specific retention policy for acknowledged operation metadata. Never prune pending or blocked operations automatically; provide a recovery or export path first.
