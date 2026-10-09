---
title: Schema & migrations
description: Evolve local data safely with versioned schemas and restartable migrations.
group: CUSTOMIZE
order: 6
---

Schemas describe the shape of the records Kelpie stores locally. Keep the schema version with your application release so the data model and the migration path can be reviewed together.

## Describing the shape

A schema is a versioned registry of table definitions. Field types are `string`, `number`, `boolean`, or `json`; every row's key is `id`.

```ts
import type { KelpieSchema } from '@kelpie/core';

const schema: KelpieSchema = {
  version: 2,
  tables: {
    notes: {
      fields: {
        body: 'string',
        updatedAt: 'number',
        pinned: 'boolean'
      }
    }
  }
};
```

The engine receives a `schemaVersion` (a single number) so it can stamp each mutation and negotiate with the server. The richer `KelpieSchema` definition lives next to it as the source of truth for tests, the CLI, and code generation.

## The migration contract

Migrations run in order, one version at a time, via `runMigrations`. Each step transforms a `MigrationContext`, and a step must exist for every boundary between the stored version and the target:

```ts
import { runMigrations, type MigrationStep } from '@kelpie/core';

const steps: MigrationStep[] = [
  {
    from: 1,
    to: 2,
    async migrate(context) {
      await context.renameField('notes', 'text', 'body');
      await context.transformRows('notes', (row) => ({ ...row, pinned: false }));
    }
  }
];

await runMigrations(1, 2, steps, context);
```

`MigrationContext` offers `renameField`, `dropField`, and `transformRows`. The context is provided by your application so migrations stay within whichever store is in use.

## A migration must be restartable

If a migration fails halfway, the next run starts again from the recorded version. Make every step idempotent in practice: renaming a field that was renamed already, or transforming rows that were already transformed, should be harmless. Never mutate the version counter before the data changes succeed.

## Version behavior with the server

Every push request carries each mutation's `schemaVersion`; every pull carries the client's current version. The server:

- **Rejects mutations** whose `schemaVersion` exceeds its configured `KELPIE_SCHEMA_VERSION`, with `SCHEMA_VERSION_TOO_NEW`.
- **Rejects pulls** from clients newer than the server, with the same error.
- **Filters** materialized rows the server cannot interpret.

This is why the cutoff must be deliberate: raise the server's schema version only after every deployed client has migrated, or purpose-built for a coexistence window.

## Review the change with the release

Because clock stamps, tombstones, and resolved rows all depend on interpretation, changing field meaning under the same field name is the riskiest migration. Prefer adding a field with a new name (so old resolvers keep working) over reusing one with different semantics. The [troubleshooting guide](/docs/library/troubleshooting) covers diagnosing a migration failure.