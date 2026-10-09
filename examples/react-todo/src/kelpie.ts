import { Kelpie, MemoryStore } from '@kelpie/core';

// One engine per page. MemoryStore keeps this example stateless across
// reloads; swap it for `await openIndexedDbStore('react-todo')` to persist.
export const engine = new Kelpie({
	deviceId: 'react-todo-example',
	schemaVersion: 1,
	store: new MemoryStore()
});