# @kelpie/server

A self-hosted Kelpie sync server. A Hono application that appends mutations to Postgres (or memory in development), pages the change stream with stable cursors, applies idempotent mutation ids, and enforces your authorization model per row.

```ts
import { createKelpieApp } from '@kelpie/server';
import { serve } from '@hono/node-server';

const app = createKelpieApp({ config, store, logger });
serve({ fetch: app.fetch, port: config.port });
```

## Endpoints

| Route | Purpose |
| --- | --- |
| `POST /push` | Append a batch of mutations; returns `accepted`, `rejected`, and the new cursor. |
| `POST /pull` | Fetch a cursor-bounded page of mutations, filtered by the permission hook. |
| `GET /status` | Store stats, auth mode, cursor, and schema version. |
| `GET /health` | Liveness + protocol version. |
| `GET /metrics` | Prometheus (`text/plain`) or JSON counters for pushes, pulls, and rate limits. |

Configuration is read from the environment (`KELPIE_PORT`, `KELPIE_AUTH`, `KELPIE_STORE`, `DATABASE_URL`, `KELPIE_SCHEMA_VERSION`, …). See `packages/server/src/config.ts` for the full list. Postgres schema lives in `packages/server/sql/001_init.sql` and a ready `Dockerfile` + `docker-compose.yml` are included.

## Run

```sh
pnpm install
pnpm --filter @kelpie/server dev
```

## License

Apache-2.0.