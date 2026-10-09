---
title: Conflict resolution
description: Choose predictable, domain-aware rules for overlapping changes from multiple devices.
group: FEATURES
order: 4
banner: bannerB
---

Conflicts happen when two replicas change the same logical row before either has seen the other's change. Kelpie keeps the full mutation history of both replicas, and each store materializes a row by replaying mutations through the table's resolver. The resolver, not a merge engine, decides what survives.

## How a row is materialized

A store holds *materialized rows* — the current values of each field, each stamped with the clock of the mutation that won it — plus the append-only log of every mutation. When a remote mutation arrives, the engine asks the table's resolver:

```ts
type TableResolver = (
  current: MaterializedRow | undefined,
  incoming: Mutation
) => MaterializedRow;
```

The same resolver runs on the client and, conceptually, the server. Because both sides apply the same rule to the same history, they converge on the same row.

## The built-in resolver: last-write-wins

`lastWriteWins` keeps, for each field, the value whose hybrid logical clock is newer. A `delete` writes a *tombstone* clock; a row is visible again only if a later write arrives, or stays hidden if the tombstone is still the newest event.

```ts
import { Kelpie, lastWriteWins } from '@kelpie/core';

const kelpie = new Kelpie({
  deviceId: 'device-A',
  schemaVersion: 1,
  store,
  resolvers: {
    preferences: lastWriteWins
  }
});
```

This is a good default for fields where *newer* means *the deliberate current choice*: the theme setting, the description, the last edited timestamp.

## A resolver must be deterministic

The same pair of history and mutation must produce the same row on every replica. Never read the wall clock, a random value, browser state, or a mutable global inside a resolver. The hybrid logical clock stamp already provides the ordering; a deterministic tie-break just uses it consistently.

If a field's meaning is not "newest wins", write a table-specific resolver that captures the domain rule exactly:

```ts
function preferNonEmpty(
  current: MaterializedRow | undefined,
  incoming: Mutation
): MaterializedRow {
  // Seed from the current row.
  const row: MaterializedRow = current
    ? { id: current.id, fields: { ...current.fields } }
    : { id: incoming.rowId, fields: {} };

  if (incoming.op === 'delete') {
    row.tombstone = incoming.hlc;
    return row;
  }

  for (const [name, value] of Object.entries(incoming.fields)) {
    const previous = row.fields[name];
    // Keep the first non-empty value that arrived for a field.
    if (!previous || previous.value === '' || previous.value === undefined) {
      row.fields[name] = { value, clock: incoming.hlc };
    }
  }
  return row;
}
```

## Preserve meaningful intent

Automatic merge is not automatically correct. A counter, an inventory reservation, and a free-form note have different invariants, and only some of them survive field-level merging. When a field genuinely cannot be merged — a name, an assigned owner, a version pin — the resolver's job is to pick one outcome *and be deterministic about it*, so that two devices never disagree about which outcome was picked.

## Inspection

Every remote mutation is emitted with `source: 'remote'` on the engine's event stream. Subscribe to it to log conflicts, surface unresolved records for deliberate review, or alert when a resolver rules against a mutation you care about:

```ts
kelpie.on((event) => {
  if (event.type === 'mutation' && event.source === 'remote') {
    console.log('applied remote', event.mutation);
  }
});
```

Do not silently discard an operation just because a newer timestamp arrived; the protocol's `rejected` list exists for the server to explain *why* a mutation was refused. For offline writes and retries, see [the durable queue](/docs/library/offline-queue).