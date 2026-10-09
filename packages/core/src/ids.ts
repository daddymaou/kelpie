const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function createUlid(now = Date.now()): string {
	if (!Number.isSafeInteger(now) || now < 0 || now > 281_474_976_710_655) {
		throw new RangeError('ULID timestamp must fit in 48 non-negative bits.');
	}
	let timestamp = now;
	let timePart = '';
	for (let index = 0; index < 10; index += 1) {
		timePart = alphabet[timestamp % 32]! + timePart;
		timestamp = Math.floor(timestamp / 32);
	}
	const random = new Uint8Array(10);
	globalThis.crypto.getRandomValues(random);
	let value = 0n;
	for (const byte of random) value = (value << 8n) | BigInt(byte);
	let randomPart = '';
	for (let index = 0; index < 16; index += 1) {
		randomPart = alphabet[Number(value & 31n)]! + randomPart;
		value >>= 5n;
	}
	return timePart + randomPart;
}
