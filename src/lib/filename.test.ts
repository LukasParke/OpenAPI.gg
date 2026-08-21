import { describe, expect, it } from 'vitest';
import { safeFilename } from './filename';

describe('safeFilename', () => {
	it('creates portable names without Node browser shims', () => {
		expect(safeFilename('Café / Pets: API?')).toBe('Cafe-Pets-API');
		expect(safeFilename('   ')).toBe('openapi');
		expect(safeFilename(undefined, 'spec')).toBe('spec');
	});
});
