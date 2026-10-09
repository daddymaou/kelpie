import { describe, expect, it } from 'vitest';
import { compareClocks, HybridLogicalClock } from './hlc.js';

describe('HybridLogicalClock', () => {
	it('increments the logical counter when the wall clock stalls or moves backwards', () => {
		const clock = new HybridLogicalClock('device-a', undefined, { now: () => 100 });
		expect(clock.tick()).toEqual({ wallTime: 100, counter: 0, deviceId: 'device-a' });
		expect(clock.tick()).toEqual({ wallTime: 100, counter: 1, deviceId: 'device-a' });
	});

	it('merges remote clocks without trusting the local wall clock', () => {
		const clock = new HybridLogicalClock('device-a', undefined, { now: () => 10 });
		clock.receive({ wallTime: 500, counter: 4, deviceId: 'device-b' });
		expect(clock.tick()).toEqual({ wallTime: 500, counter: 6, deviceId: 'device-a' });
	});

	it('provides a deterministic device tie-break for equal physical and logical values', () => {
		expect(compareClocks(
			{ wallTime: 10, counter: 2, deviceId: 'a' },
			{ wallTime: 10, counter: 2, deviceId: 'b' }
		)).toBeLessThan(0);
	});
});
