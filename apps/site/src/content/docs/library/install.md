---
title: Install
description: Add Kelpie to an existing TypeScript application and choose a local store.
group: GETTING STARTED
order: 2
---

Kelpie targets modern TypeScript runtimes (Node 20+, current browsers, Bun). Install the core package with your package manager:

```sh
pnpm add @kelpie/core
```

The protocol and simulator are separate packages, used only when you need them:

```sh
pnpm add @kelpie/protocol @kelpie/sim
```

Kelpie itself does not require a UI framework. For a browser application you will also want the IndexedDB adapter, which ships inside `@kelpie/core`:

```ts
import { openIndexedDbStore } from '@kelpie/core';
```

## Runtime support

The core package expects `Promise`, `AbortController`, `structuredClone`-compatible values in mutation fields, and standard typed-array support. Browser persistence is a store, not part of the engine.

- Browser: `openIndexedDbStore(name)` for durable persistence.
- Tests and servers: `MemoryStore` for deterministic, in-process use.
- Anything else: implement the small `LocalStore` contract from `@kelpie/core`.

## Server (optional)

To sync between devices you need the server that backs your transport. The easiest local setup is Docker Compose from `packages/server`:

```sh
docker compose up
```

That runs the Hono server against Postgres with an append-only mutation log. See [configuration](/docs/library/configuration) for the server's environment variables.

## Verify the setup

Keep the TypeScript compiler in strict mode so schema, store, and transport types stay useful:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

Import the IndexedDB adapter only where the browser runtime is available. Server-rendered or test code should use `MemoryStore`; see the [adapter guide](/docs/library/adapters) for lifecycle notes.