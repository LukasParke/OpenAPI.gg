import type { OpenAPIV3_1 } from './openAPITypes';

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

export class ImportError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ImportError';
	}
}

export const normalizeImportedDocument = (value: unknown): OpenAPIV3_1.Document => {
	if (!isRecord(value)) throw new ImportError('The file must contain an object.');
	if (typeof value.openapi !== 'string' || !/^3\.\d+(\.\d+)?/.test(value.openapi)) {
		throw new ImportError('The file must declare a supported OpenAPI 3.x version.');
	}
	if (!isRecord(value.info)) throw new ImportError('The file must contain an info object.');
	if (typeof value.info.title !== 'string') {
		throw new ImportError('info.title must be a string.');
	}
	if (typeof value.info.version !== 'string') {
		throw new ImportError('info.version must be a string.');
	}
	if (value.paths !== undefined && !isRecord(value.paths)) {
		throw new ImportError('paths must be an object.');
	}
	if (value.components !== undefined && !isRecord(value.components)) {
		throw new ImportError('components must be an object.');
	}
	if (value.webhooks !== undefined && !isRecord(value.webhooks)) {
		throw new ImportError('webhooks must be an object.');
	}

	const document = structuredClone(value) as unknown as OpenAPIV3_1.Document;
	document.paths ??= {};
	document.components ??= {};
	// webhooks exists in OpenAPI 3.1 only; never inject it into 3.0 documents.
	if (/^3\.1(\.|$)/.test(String(value.openapi))) {
		document.webhooks ??= {};
	}
	return document;
};
