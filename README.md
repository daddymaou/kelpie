# Kelpie

Kelpie is a local-first sync engine for TypeScript applications. It is designed for software that should remain useful when a network is slow, unreliable, or unavailable: changes are made against local data first and synchronized when a connection returns.

This repository contains Kelpie's documentation website. The product and its documentation describe a fictional open-source project.

## Project

Kelpie keeps application data available at the edge, then coordinates updates across devices through a sync transport. The application stays responsive offline; synchronization and conflict handling happen as a separate part of the data lifecycle.

The project is built around a few principles:

- **Local first:** reads and writes do not depend on a live server round trip.
- **Explicit synchronization:** queued changes, acknowledgements, retries, and blocked operations have distinct states.
- **Intentional conflict handling:** choose resolution rules that reflect what the data means instead of applying one merge policy everywhere.
- **Typed boundaries:** schemas, migrations, storage, and transport are designed to work with TypeScript.
- **Application-owned authority:** authentication, authorization, and shared business rules remain the responsibility of the application and its server.

## Documentation

The site includes an introduction, installation and quick-start guides, feature and configuration references, a CLI reference, troubleshooting and FAQ pages, and field notes about local-first application design.

Documentation is organized into the **Library** and **CLI** sections. Each document is available as a rendered page and as raw Markdown. Search is generated from the prerendered site.

## Website

The documentation site uses SvelteKit, Svelte 5, TypeScript, and mdsvex. Pages are prerendered, syntax highlighting supports dark and light themes, and Pagefind builds the search index. The interface includes responsive documentation navigation, keyboard-accessible search, theme selection, and per-page SEO metadata.

Kelpie's visual identity is intentionally restrained: dark and warm-paper themes, steel-blue accents, self-hosted typography, and artwork kept to page edges. Brand assets and the five supplied artwork slots live in `static/`.

## Artwork

The five artwork slots are `hero.jpg`, `banner-a.jpg`, `banner-b.jpg`, `empty.jpg`, and `card.jpg` in `static/art/`. Their intended use, crop guidance, and recommended dimensions are documented in [`static/art/README.md`](./static/art/README.md). The typed registry is maintained in `src/lib/art.ts`.
