# Contributing to Kelpie

Thanks for considering a contribution. Kelpie is small on purpose; the bar for a new concept is that it earns its place in the code.

## What we optimize for

- **Small, typed seams.** Each package is a few hundred lines that reads like a contract. A feature that needs a new layer should justify it.
- **Honesty over shape.** No stubs that look done. A documented-only Vue adapter is labeled as such. A benchmark page without data says so.
- **Determinism.** Sync bugs are almost always ordering bugs. New behavior must be testable with `@kelpie/sim`, not just with mocked transport calls.

## Setup

```sh
pnpm install
pnpm test
pnpm lint
```

Tests run through Vitest, lint through Biome, and the site builds fully static pages (SvelteKit + mdsvex + Pagefind). The monorepo uses pnpm workspaces and Turborepo; `turbo run build` builds dependencies before dependents because workspace packages resolve their built `dist` output.

## Conventions

- TypeScript strict, ESM only, NodeNext resolution.
- 100-column formatting is handled by Biome (`.prettierrc` is deprecated in this repo).
- Tests live next to source: `*.test.ts`.
- Every mutation, schema, and protocol type has a Zod schema or a TS type as its single source of truth. Prefer fixing the source over syncing duplicated literals.
- Seams that replace a side effect (network, clock, storage) accept it as an option or parameter — make the real implementation and the test implementation interchangeable.

## What belongs in a PR

- A description of the behavior change, not just the diff.
- Tests that fail on the old behavior (for bugs) or exercise the new determinism (for features).
- Changelog entry in the `/changelog` page (`apps/site/src/routes/changelog`).

## Releases

Commits should be conventional (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). A release bumps the package version in its `package.json` and the site changelog together.

## License

By contributing you agree your contribution is licensed under Apache-2.0. There is no CLA or copyright reassignment.