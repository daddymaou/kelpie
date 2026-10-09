# Kelpie

Kelpie is a local-first sync engine for TypeScript applications. It is designed for software that should remain useful when a network is slow, unreliable, or unavailable: changes are made against local data first and synchronized when a connection returns.

This is a monorepo of the engine, the self-hosted sync server, the CLI, framework adapters, a simulator, and the documentation website (this repository's docs are **not** fictional — they describe the code in `packages/`).

## Repo layout

| Path | What it is |
| --- | --- |
| `packages/core` | The engine: durable writes, a typed outbox, queries, hybrid logical clocks, resolvers, and stores. |
| `packages/protocol` | The wire protocol: strict Zod schemas for mutations, push, pull, and error codes. |
| `packages/server` | A self-hosted Hono + Postgres server for reconciling devices. |
| `packages/cli` | A CLI that inspects sync state (`status`, `queue`, `inspect`, `doctor`, …). |
| `packages/react` | React hooks (`useQuery`, `useMutation`, `useSync`). |
| `packages/svelte` | Svelte stores for the same surface. |
| `packages/sim` | A synchronous simulation of multiple devices for tests and the playground. |
| `packages/vue-stub` | Documented API surface; no implementation yet. |
| `apps/site` | The documentation site (SvelteKit, freshly consolidated here). |
| `examples/react-todo`, `examples/svelte-notes` | Runnable reference apps. |

## Principles

- **Local first:** reads and writes do not depend on a live server round trip.
- **Explicit synchronization:** queued changes, acknowledgements, retries, and blocked operations have distinct states.
- **Intentional conflict handling:** a per-table resolver policy instead of a single merge applied everywhere.
- **Typed boundaries:** schemas, storage, and transport are designed to work with TypeScript.
- **Application-owned authority:** authN/authZ and shared business rules stay on the application's server.

## Quick start

```sh
# engine only — no server required
pnpm install
pnpm --filter @kelpie/core test
pnpm --filter @kelpie/core check

# self-hosted server
pnpm --filter @kelpie/server dev
```

The engine runs against an in-memory or IndexedDB store with no transport. Point a transport at a Kelpie server to reconcile devices; the CLI's `kelpie doctor` explains what a deployment is missing.

## Documentation

The rendered site lives at `apps/site` (SvelteKit, Svelte 5, TypeScript, mdsvex, shiki). It is organized into **Library**, **CLI**, and **Blog** sections in `apps/site/src/content`, and builds completely static pages with Pagefind search. Fresh content edits only touch Markdown.

```sh
pnpm --filter @kelpie/site dev
pnpm --filter @kelpie/site check
```

## Artwork

Brand artwork lives in `apps/site/static/art/` with a typed registry in `apps/site/src/lib/art.ts`. Prior to the consolidation, the site lived at the repo root; everything now ships from `apps/site`.

## License

Apache-2.0. See [`LICENSE`](./LICENSE).