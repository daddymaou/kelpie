import { Kelpie, MemoryStore } from '@kelpie/core';

// One engine per page. MemoryStore keeps this example stateless across
// reloads; swap it for `await openIndexedDbStore('svelte-notes')` to persist.
export const engine = new Kelpie({
	deviceId: 'svelte-notes-example',
	schemaVersion: 1,
	store: new MemoryStore()
});