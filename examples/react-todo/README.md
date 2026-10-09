# Kelpie · React todo

A runnable offline-first todo app built with `@kelpie/react` and Vite.

The engine uses a `MemoryStore`, so state is lost on reload by design — this
example shows the adapter surface without a server. To persist across reloads,
swap `MemoryStore` for `await openIndexedDbStore('react-todo')` in `src/kelpie.ts`.

## Run

```sh
pnpm install
pnpm --filter @kelpie/example-react-todo dev
```

## Test

```sh
pnpm --filter @kelpie/example-react-todo test
```

It uses `useSync`-friendly hooks: `useTableQuery` for subscriptions and
`useMutation` for writes.