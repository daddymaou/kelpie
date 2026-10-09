# @kelpie/sim

A deterministic in-memory simulation of Kelpie devices sharing one network. Used by the test suite and the site playground.

```ts
import { SyncSimulation } from '@kelpie/sim';

const sim = new SyncSimulation(['A', 'B']);
sim.replicas[0]!.setOnline(false);
await sim.replicas[0]!.engine.insert('notes', { id: 'n_1', body: 'offline edit' });
sim.replicas[0]!.setOnline(true);
await sim.converge();
const [a, b] = await sim.snapshot('notes');
```

`DeterministicNetwork` supports reordering (`reorder: true`), duplicate deliveries (`duplicateDelivery`), and seeded randomness (`seed`) so convergence properties are testable rather than handed to chance.

## Run

```sh
pnpm install
pnpm --filter @kelpie/sim test
```

## License

Apache-2.0.