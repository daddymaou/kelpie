---
title: Conflicts have a shape
description: A timestamp is a tie-breaker, not a universal theory of what a user meant.
date: 2026-08-27
order: 2
---

"Last write wins" sounds neutral because it is easy to say. It quietly assumes that clocks are comparable and that the latest timestamp represents the most valuable intention. Underneath all that, it assumes every conflict is a race — and that the winner of a race is what the user actually wanted.

Conflicts are not a plumbing failure. They are what happens when two people, or two devices, make different decisions about the same fact, and both of those decisions are real. The interesting work is figuring out what the domain says should happen when that collision occurs — which means a conflict has to have a shape before it can have a winner.

## Two edits, one row

Take the classic example. A field note has a `title`. Device A edits it to "Tide tables", device B edits the same field to "Tide calculations". Both writes are valid locally. Both are durable. When they meet on the server, the resolution policy decides what survives.

Last-write-wins says: whichever mutation carries the higher hybrid logical clock stamp. This is predictable, cheap, and frequently wrong. It discards a legitimate edit because a different device happened to be a few milliseconds later. For a field like `lastEditedAt`, that is exactly the policy you want — there is no meaning to merging. For a field like `assignedTo` or `tags`, discarding is editing the user's intention without asking.

## The three questions

Before choosing a resolver, ask three questions about the collection:

1. **Is this field monotonic?** Does a newer value always carry more truth? Timestamps, counters, and statuses that only move forward qualify.
2. **Can the fields be merged?** If two edits touch different fields of the same row, a field-level merge may have no conflict at all. A tag list is often a union, not a winner.
3. **Who is allowed to decide?** Sometimes nobody is, and the system must record the conflict and ask the user — or the domain rules must resolve it deterministically so that two servers converge on the same answer.

Kelpie's resolver is a per-table function, not a global policy. Each collection can answer these questions differently:

```ts
import { Kelpie, lastWriteWins, type MaterializedRow, type TableResolver } from '@kelpie/core';

const kelpie = new Kelpie({
  deviceId: 'browser_a1b2',
  schemaVersion: 1,
  store,
  transport,
  resolvers: {
    notes: lastWriteWins,
    tags: mergeTagLists
  }
});

// A deterministic per-table policy: the union of a tag list wins, newest sort order first.
const mergeTagLists: TableResolver = (current, incoming) => {
  const row = current ?? { id: incoming.rowId, fields: {} };
  const previous = Array.isArray(row.fields.tags?.value) ? (row.fields.tags.value as unknown[]) : [];
  const merged = [...previous];
  for (const tag of Array.isArray(incoming.fields.tags) ? (incoming.fields.tags as unknown[]) : []) {
    if (!merged.includes(tag)) merged.push(tag);
  }
  const sort = Array.isArray(incoming.fields.sort) ? (incoming.fields.sort as unknown[]) : []
  return { ...row, fields: { ...row.fields, tags: { value: merged, clock: incoming.hlc }, sort: { value: sort, clock: incoming.hlc } } };
};
```

## Deterministic beats clever

Whatever you choose, the resolver must be deterministic: given the same pair of mutations and the same input row, it must produce the same output on every device and on the server. The moment a resolution depends on arrival order, wall clock, or the mood of the process that runs it, your two devices will refuse to converge — not because they disagree, but because they disagree about how to disagree.

This is why the hybrid logical clock matters in deep ways. It gives a total order to otherwise concurrent mutations without requiring synchronized wall clocks. "Last" in *last-write-wins* is therefore well-defined, not approximate.

For the same reason, a resolver should not reach out to a remote service. Resolution must be a pure function of the data it is handed, so that both the client and the server can apply it identically. If a conflict needs a human decision, record it as a structured event and let the domain process it — with a deterministic default in the meantime.

## Losing data is a design choice

The honest framing is that every resolver throws away *something*. Last-write-wins throws away the losing edit. Field merge throws away nothing when it can combine fields, but still needs a rule for the same field in both mutations. No resolution rule is lossless in general, because two edits to the same field genuinely cannot both remain the visible truth.

The discipline, then, is to make the discard *visible and intentional*:

- Log every conflict, including the rejected mutation's id and the rule applied.
- Give the queue a distinct state for conflicted work, so nobody mistakes it for something that never happened.
- Prefer resolvers that preserve as much structure as the domain permits, and say why the rest is dropped.

The [conflict resolution guide](/docs/library/conflict-resolution) documents the built-in resolvers and how to write your own. The [offline queue guide](/docs/library/offline-queue) shows how the outbox surfaces rejected and conflicted mutations.

## The shape of a conflict

A conflict is not a "merge problem to be solved once". It is a recurring fact of distributed systems that your application answers repeatedly, per collection, per field, per decision. Give it a shape — the mutation, the other mutation, the rule, the outcome — and it stops being noise and starts being data your application and your logs can act on.

Timestamps break ties. They do not tell you what a user meant. Choose a policy that remembers the difference.