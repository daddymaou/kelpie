---
title: Install
description: Add Kelpie to an existing TypeScript application and choose a local store.
group: GETTING STARTED
order: 2
---

Kelpie targets modern TypeScript runtimes. Install the core package with your package manager:

```sh
pnpm add @kelpie/sync
```

Kelpie itself does not require a UI framework. Add one storage adapter for your runtime; browser applications commonly start with IndexedDB.

```sh
pnpm add @kelpie/adapter-indexeddb
```

## Runtime support

The core package expects `Promise`, `AbortController`, and standard typed-array support. Browser persistence is provided by an adapter rather than by the sync engine.

## Verify the setup

Keep the TypeScript compiler in strict mode so schema and adapter types remain useful:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

Import the entry point from application code only. Server-rendered apps should create browser-backed instances after the browser runtime is available; see the [adapter guide](/docs/library/adapters) for lifecycle notes.
