---
title: FAQ
description: Answers to common questions about Kelpie, data ownership, and offline behavior.
group: HELP
order: 12
---

## Does Kelpie require a Kelpie server?

No. Without a transport, `@kelpie/core` is a fully functional offline store: durable writes, a typed queue, and queries. The server exists only to reconcile *between* devices. One device, no server, no problem.

## Is it really self-hosted?

Yes. The server in `packages/server` is a Hono application that needs only a Postgres database you control. There is no hosted Kelpie service, no cloud control plane, and no telemetry endpoint. If that changes, it will be announced — nothing in the codebase phones home today.

## Where does my data live?

On the device, in your chosen store (IndexedDB in browsers, memory in tests), and — when you configure a transport — in your own server's Postgres. Choose per-field what to synchronize. The mutation log is append-only; tombstones and compaction are configurable.

## How is it licensed?

Apache-2.0. Commercial use is allowed. There is no contributor agreement that reassigns your copyright, and no "open core" edition withholding features.

## Can I use it with my framework?

The engine is framework-agnostic. `@kelpie/react` provides hooks (`useQuery`, `useMutation`, `useSync`) and `@kelpie/svelte` provides stores. Vue is documented only — no adapter is shipped yet.

## What happens when two devices edit the same record?

The record keeps both operation histories, and the table's resolver decides what materializes — `lastWriteWins` by default, or a deterministic per-table policy you write. The engine emits rejected and remote mutations so your application can inspect every decision.

## Does it work with AI features or cloud AI providers?

No. Kelpie has no AI features, and nothing in the code will call an inference provider. Sync is a transport and resolution problem, not a model problem.

## How big is the initial commit footprint?

The core engine, the server, and the simulator are each small, typed packages with tests. The protocol you depend on is a few hundred lines of schema. That is deliberate: small seams are easy to audit, version, and trust.

## What is a hybrid logical clock (HLC)?

An HLC assigns each event a counter and a wall-clock component so that (a) two events can be totally ordered without synchronized clocks, and (b) the ordering is cheap. It is why "last write wins" is *deterministic* on this system rather than "the machine with the wrong clock wins."

More: [quick start](/docs/library/quick-start) to run the engine, [rules](/docs/library/rules) for the authorization boundary, and [configuration](/docs/library/configuration) for server settings.