import { describe, expect, it } from 'vitest';
import { createNewSpec } from './db';
import { diagnosticCounts, validateDocument } from './validation';

describe('OpenAPI validation', () => {
	it('reports document, path, operation, reference, and security problems', () => {
		const { spec } = createNewSpec();
		spec.paths = {
			'/users/{userId}': {
				get: {
					operationId: 'getUser',
					responses: {}
				}
			},
			'/admins': {
				get: {
					operationId: 'getUser',
					responses: {
						'200': {
							description: 'OK',
							content: {
								'application/json': {
									schema: { $ref: '#/components/schemas/Missing' }
								}
							}
						}
					}
				}
			}
		};
		spec.security = [{ missingAuth: [] }];

		const diagnostics = validateDocument(spec);
		expect(diagnosticCounts(diagnostics)).toEqual({ errors: 7, warnings: 0 });
		expect(diagnostics.map((diagnostic) => diagnostic.message)).toContain(
			'Operation ID "getUser" is already used by GET /users/{userId}.'
		);
		expect(diagnostics.map((diagnostic) => diagnostic.message)).toContain(
			'Reference "#/components/schemas/Missing" does not resolve.'
		);
	});

	it('accepts a minimal healthy document', () => {
		const { spec } = createNewSpec();
		spec.info.title = 'Healthy API';
		spec.info.version = '1.0.0';
		spec.paths = {
			'/health': {
				get: {
					responses: {
						'200': { description: 'Healthy' }
					}
				}
			}
		};

		expect(validateDocument(spec)).toEqual([]);
	});

	it.each(['#/constructor', '#/toString'])(
		'rejects inherited object property reference %s',
		(reference) => {
			const { spec } = createNewSpec();
			spec.info.title = 'Reference API';
			spec.info.version = '1.0.0';
			spec.paths = {
				'/reference': {
					get: {
						responses: {
							'200': {
								description: 'OK',
								content: {
									'application/json': {
										schema: { $ref: reference }
									}
								}
							}
						}
					}
				}
			};

			expect(validateDocument(spec).map((diagnostic) => diagnostic.message)).toContain(
				`Reference "${reference}" does not resolve.`
			);
		}
	);
	it('flags security requirements that only match inherited property names', () => {
		const { spec } = createNewSpec();
		spec.info.title = 'Secure API';
		spec.info.version = '1.0.0';
		spec.security = [{ constructor: [] }];

		expect(validateDocument(spec).map((diagnostic) => diagnostic.message)).toContain(
			'Security requirement "constructor" has no matching security scheme.'
		);
	});

	it('accepts operation-level path parameters and tolerates missing info fields', () => {
		const { spec } = createNewSpec();
		spec.info.title = undefined as unknown as string;
		spec.info.version = undefined as unknown as string;
		spec.paths = {
			'/users/{userId}': {
				get: {
					parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
					responses: {
						'200': { description: 'OK' }
					}
				}
			}
		};

		const diagnostics = validateDocument(spec);
		expect(diagnosticCounts(diagnostics)).toEqual({ errors: 2, warnings: 0 });
		expect(diagnostics.map((diagnostic) => diagnostic.message)).toContain('API title is required.');
		expect(diagnostics.map((diagnostic) => diagnostic.message)).toContain(
			'API version is required.'
		);
	});
});
