# Kelpie · Svelte notes

A runnable offline-first notes app built with `@kelpie/svelte` and Vite.

The engine uses a `MemoryStore`, so state is lost on reload by design — this
example shows the adapter surface without a server. To persist across reloads,
swap `MemoryStore` for `await openIndexedDbStore('svelte-notes')` in `src/kelpie.ts`.

## Run

```sh
pnpm install
pnpm --filter @kelpie/example-svelte-notes dev
```

## Test

```sh
pnpm --filter @kelpie/example-svelte-notes test
```

It uses `queryStore`, `createMutationHelpers`, and `kelpieStatusStore`.