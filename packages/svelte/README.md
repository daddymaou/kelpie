# @kelpie/svelte

Svelte 5 stores for a Kelpie engine.

- `queryStore(engine, query)` — a readable store of `{ rows, error }` backed by `engine.subscribe`.
- `createMutationHelpers(engine, table)` — `insert`, `update`, `delete` helpers.
- `kelpieStatusStore(engine)` — a readable store of the current `SyncStatus`.

```svelte
<script lang="ts">
  import { createMutationHelpers, queryStore } from '@kelpie/svelte';
  import { engine } from './kelpie';

  const todos = queryStore(engine, { table: 'todos' });
  const todosApi = createMutationHelpers(engine, 'todos');
</script>

{#each $todos.rows as todo (todo.id)}
  <button onclick={() => todosApi.delete(todo.id)}>Delete</button>
{/each}
```

Peer dependency: Svelte 5.

## Run

```sh
pnpm install
pnpm --filter @kelpie/svelte test
```

See `examples/svelte-notes` for a runnable app.

## License

Apache-2.0.