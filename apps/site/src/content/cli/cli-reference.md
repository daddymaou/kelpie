---
title: CLI reference
description: Inspect, validate, and migrate a Kelpie project from the command line.
group: CLI REFERENCE
order: 1
---

The `kelpie` CLI works with a project's `.kelpie/config.json` and never uploads local data. Run commands from the application root.

## Setup

```sh
pnpm --filter @kelpie/cli dev -- init
# or, from a monorepo root:
pnpm --filter @kelpie/cli dev
```

Bind the binary into your project with the workspace dependency on `@kelpie/cli`, which exports the `kelpie` bin. Initialize a project to create the config:

```sh
kelpie init --device-id device-A
```

This writes `.kelpie/config.json` with a `protocolVersion`, your `deviceId`, a `schemaVersion`, and `storage`. Without it, most commands fail with a message pointing here — they do not invent a project.

## Commands

| Command | Purpose |
| --- | --- |
| `kelpie init` | Create a starter `.kelpie/config.json` with a generated device id. |
| `kelpie dev` | Open the Ink dashboard for live sync status, log, conflicts, and queue depth. |
| `kelpie status` | Print resolved config, queue depth, and last cursor as JSON. |
| `kelpie inspect --table <name>` | Print the materialized rows of a local table. |
| `kelpie queue` | Show pending mutations that have not been acknowledged. |
| `kelpie conflicts` | Explain the conflict guidance configured for this project. |
| `kelpie logs --limit <n>` | Show the most recent local mutations. |
| `kelpie doctor` | Run local setup checks and report what is missing. |
| `kelpie migrate` | Print the Postgres schema migration guidance for self-hosting. |

## Relevant flags

| Flag | Applies to | Description |
| --- | --- | --- |
| `--device-id <id>` | `init` | Explicit device identifier stored in config. |
| `--table <name>` | `inspect` | Restrict output to one local table. |
| `--limit <n>` | `logs` | Maximum number of entries to print. |

## Status, without the fiction

`kelpie status` reads the real project state and prints it as JSON — no hard-coded summary:

```json
{
  "status": "idle",
  "deviceId": "device-A",
  "schemaVersion": 1,
  "storage": "memory",
  "serverUrl": null,
  "queueDepth": 0,
  "lastCursor": null
}
```

If the project is not configured, the command exits non-zero and explains what is missing. `kelpie dev` uses an Ink dashboard whose rendering sits behind a `CliRenderer` interface, so the plain renderer and the dashboard share one source of truth.

## Postgres migrations

`kelpie migrate` does not run DDL. It reads the reference schema from `packages/server/sql/001_init.sql`, prints the path and line count, and reminds you where `DATABASE_URL` must be set. The server applies its own schema on startup; the CLI's job is to point at the same SQL you reviewed.