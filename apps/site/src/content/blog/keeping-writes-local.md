---
title: A write should not wait for the weather
description: Why local-first interaction changes the shape of a dependable application.
date: 2026-09-18
order: 1
---

Most interfaces still ask a distant server for permission to feel responsive. The form validates against a schema the server owns, the save button disables while a request is in flight, and every optimistic update is a careful lie we tell to make the network look faster than it is. That architecture works until the train enters a tunnel, a laptop wakes without Wi-Fi, or an API has a bad afternoon.

Local-first is not the same as offline-first with extra steps. The difference is which side of the system is allowed to decide.

## The round trip is the unnecessary part

Consider the phrase "save". For most of the history of the web it described an act of faith: you send bytes to a machine you cannot see, and you wait for its opinion. The local machine was a dumb terminal wearing a browser costume. Every keystroke was a request, every request was a small negotiation with a remote authority.

Local-first inverts that relationship. The device is the place where work happens, and the server is a collaborator that reconciles work between devices. That sounds like a change in engineering priority. Really it is a change in responsibility: who gets to decide that a change is real?

In a local-first system, the answer is *the user's device*. A write that satisfies the local schema is real. It lands in a durable queue before the network is consulted, and synchronization is a separate, inspectable process that happens afterward.

## What durability buys you

Durability here is not a slogan. It means the write survives the tab closing, the browser crashing, the phone sliding under the car seat for a week. Kelpie does this by keeping every mutation in the same store that holds the materialized rows: an append-only log with an ordering stamp from the hybrid logical clock.

```ts
import { Kelpie, openIndexedDbStore } from '@kelpie/core';

const kelpie = new Kelpie({
  deviceId: 'browser_a1b2',
  schemaVersion: 1,
  store: await openIndexedDbStore('field-notes')
});

await kelpie.insert('notes', {
  id: 'n_01H8Z',
  body: 'Find the tide tables before leaving.'
});
```

At this point the write is *done*. Not "pending", not "as soon as the server answers" — done. The UI can redraw immediately, the user can move on, and the queue holds the change until a transport appears.

The property that matters is not speed, though speed follows. The property is that the dependency has a direction. The interface depends on the local store, and the local store does not depend on the network.

## The failure that forces the design

The hardest test for any sync design is not the request that fails. It is the request that never happens because the user is offline — and the application quietly stops permitting work at all. Greyed-out buttons and "no connection" screens are not error states; they are the default weather in a lot of the world.

A local-first application spends its offline time the way a well-built application spends any time: doing useful, bounded work. When the connection returns, the queue drains and the server reconciles.

That is why depth alone is not the interesting number. The interesting design is one where *the queue, the offline window, and the reconciliation are first-class states a developer can inspect* — not an edge case bolted on after the happy path.

## The shape it produces

Designing this way changes code, and it changes it in predictable directions:

- **Writes return mutations, not confirmations.** The caller learns *what changed locally*, and acknowledges it, rather than waiting for the server's receipt.
- **The queue is inspectable.** Blocked work is not thrown away, and it is not hidden. You can count it, log it, and rebuild the UI around it.
- **Conflicts are a domain decision.** Two devices that edited the same row are a fact about the domain, not an exception in the plumbing.
- **The transport is a seam.** Tests replace the network with a deterministic one; the application chooses where and when to sync.

The [offline queue](/docs/library/offline-queue) guide covers how the durable outbox works, and [adapter boundaries](/docs/library/adapters) show where storage and transport can be swapped without the engine noticing.

## The weather is the point

Networks are not an anomaly. They are the environment. Tunnels, dead zones, throttled planes, hotel Wi-Fi, countries where a dropped call is a daily event — this is what "mostly connected" looks like at scale.

Local-first is the humble reaction to that: assume the connection is a condition, not a prerequisite, and design the software that people can actually get their work done with.