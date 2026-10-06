---
title: Conflict resolution
description: Choose predictable, domain-aware rules for overlapping changes from multiple devices.
group: FEATURES
order: 4
banner: bannerB
---

Conflicts happen when two replicas change the same logical record before either has seen the other change. Kelpie preserves both operation histories until the collection's configured policy can resolve them.

## Pick a policy per collection

For independent fields, a field merge can preserve both edits. For a preference where the newest deliberate choice wins, last-write-wins may be appropriate. For collaborative text or rich data, use a domain-specific resolver.

```ts
const schema = defineSchema({
  preferences: {
    theme: 'string',
    updatedAt: 'number'
  }
});

const kelpie = createKelpie({
  schema,
  conflicts: {
    preferences: lastWriteWins({ timestamp: 'updatedAt' })
  }
});
```

## A resolver should be deterministic

The same pair of operations must produce the same result on every replica. Avoid reading the current time, random values, browser state, or mutable globals inside a resolver. Include an explicit tie-break field when equal timestamps are possible.

## Preserve meaningful intent

Automatic merge is not automatically correct. A counter, inventory reservation, and free-form note have different invariants. Keep authorization and business constraints on the server, and reject changes that cannot safely merge.

## Inspect rejected operations

Subscribe to the conflict event stream and surface unresolved records for deliberate review. Do not silently discard an operation just because a newer timestamp arrived. For offline writes and retries, see [the durable queue](/docs/library/offline-queue).
