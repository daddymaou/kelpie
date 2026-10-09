# @kelpie/react

React hooks for a Kelpie engine.

- `useSync(options)` — creates an engine and starts it (optionally), tearing it down on unmount.
- `useQuery(engine, query)` / `useTableQuery(engine, table, where?, select?)` — reactive rows + errors for a query.
- `useMutation(engine, table)` — `insert`, `update`, `delete` helpers.
- `useKelpieStatus(engine)` — the current `SyncStatus`.
- `useKelpieEvents(engine, onEvent)` — subscribe to engine events.

```tsx
import { useMutation, useTableQuery } from '@kelpie/react';

const { rows: todos } = useTableQuery(engine, 'todos');
const todosApi = useMutation(engine, 'todos');

<button onClick={() => todosApi.insert({ id: 't1', title: 'Buy oat milk', done: false })}>Add</button>
```

Peer dependency: React 18 or 19.

## Run

```sh
pnpm install
pnpm --filter @kelpie/react test
```

See `examples/react-todo` for a runnable app.

## License

Apache-2.0.