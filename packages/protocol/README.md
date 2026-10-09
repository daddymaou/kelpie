# @kelpie/protocol

The Kelpie wire protocol, expressed as strict Zod schemas. A few hundred lines define the entire vocabulary of a sync server: the mutation, the push request/response, the pull request/response, and protocol error codes.

```ts
import { mutationSchema, protocolVersion } from '@kelpie/protocol';

const mutation = mutationSchema.parse({
  id: '01H8Z...',          // ULID, client-generated
  table: 'notes',
  rowId: 'n_01',
  op: 'insert',            // insert | update | delete
  fields: { body: '...' },
  hlc: { wall: 1730000000, counter: 3, device: 'device-A' },
  schemaVersion: 1,
  deviceId: 'device-A'
});

export const protocolVersion = 1;
```

Every schema enforces the same shape shippers, the CLI renderers, the server store, and the client engine all agree on. Error codes are typed: `FORBIDDEN`, `UNAUTHENTICATED`, `SCHEMA_VERSION_TOO_NEW`, `RATE_LIMITED`, `INVALID_REQUEST`, and `INTERNAL` each carry a `retryable` flag.

## Run

```sh
pnpm install
pnpm --filter @kelpie/protocol test
```

## License

Apache-2.0.