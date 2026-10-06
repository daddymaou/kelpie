---
title: CLI reference
description: Inspect, validate, and migrate a Kelpie project from the command line.
group: CLI REFERENCE
order: 1
---

The fictional `kelpie` CLI works with a project configuration file and never uploads local data. Run commands from the application root.

## Commands

| Command | Purpose |
| --- | --- |
| `kelpie init` | Create a starter `kelpie.config.ts` |
| `kelpie inspect` | Print resolved schema and adapter information |
| `kelpie validate` | Check config and migration chain |
| `kelpie migrate --dry-run` | Report planned local schema changes |
| `kelpie migrate` | Apply pending local migrations |
| `kelpie help [command]` | Show command usage |

## Common flags

| Flag | Description |
| --- | --- |
| `--config <path>` | Use an explicit config file |
| `--format json` | Emit machine-readable output |
| `--verbose` | Include diagnostic event IDs |
| `--dry-run` | Describe changes without applying them |

## Validate before migrating

```sh
pnpm kelpie validate --config kelpie.config.ts
pnpm kelpie migrate --dry-run
```

A dry run does not mutate local storage. Review the proposed version transitions and take an application-level backup before applying a migration to valuable user data.
