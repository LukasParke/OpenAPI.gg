import { describe, expect, it } from 'vitest';
import { ImportError, normalizeImportedDocument } from './importSpec';

describe('normalizeImportedDocument', () => {
	it('normalizes valid OpenAPI 3 documents for the editor', () => {
		const document = normalizeImportedDocument({
			openapi: '3.1.0',
			info: { title: 'Pets', version: '1.0.0' }
		});

		expect(document.paths).toEqual({});
		expect(document.components).toEqual({});
		expect(document.webhooks).toEqual({});
	});
	it('accepts two-segment versions and only defaults webhooks for 3.1', () => {
		const threeDotZero = normalizeImportedDocument({
			openapi: '3.0',
			info: { title: 'Pets', version: '1.0.0' }
		});
		expect(threeDotZero.webhooks).toBeUndefined();

		const threeDotOne = normalizeImportedDocument({
			openapi: '3.1',
			info: { title: 'Pets', version: '1.0.0' }
		});
		expect(threeDotOne.webhooks).toEqual({});
	});

	it('rejects malformed and unsupported documents with actionable errors', () => {
		expect(() => normalizeImportedDocument([])).toThrow(ImportError);
		expect(() =>
			normalizeImportedDocument({
				openapi: '2.0',
				info: { title: 'Pets', version: '1.0.0' }
			})
		).toThrow('supported OpenAPI 3.x version');
		expect(() =>
			normalizeImportedDocument({
				openapi: '3.1.0',
				info: { title: 'Pets' }
			})
		).toThrow('info.version must be a string');
	});
});
