import { describe, expect, it } from 'vitest';
import { safeFilename } from './filename';

describe('safeFilename', () => {
	it('creates portable names without Node browser shims', () => {
		expect(safeFilename('Café / Pets: API?')).toBe('Cafe-Pets-API');
		expect(safeFilename('   ')).toBe('openapi');
		expect(safeFilename(undefined, 'spec')).toBe('spec');
	});
	it('prefixes Windows reserved device names', () => {
		expect(safeFilename('CON')).toBe('_CON');
		expect(safeFilename('con.txt')).toBe('_con.txt');
		expect(safeFilename('LPT9')).toBe('_LPT9');
		expect(safeFilename('nul.yaml')).toBe('_nul.yaml');
		expect(safeFilename('constant')).toBe('constant');
	});
});
