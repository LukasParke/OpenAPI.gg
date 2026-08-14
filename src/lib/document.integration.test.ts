import { describe, expect, it } from 'vitest';
import { createNewSpec } from './db';
import { operationCount, pathCount } from './index';
import { isValidPath } from './pathHandling';
import { createReference, createSchema, isReference, setSchemaType } from './schema';

describe('OpenAPI document workflow', () => {
	it('builds reusable schemas, operations, and webhooks without sharing blank state', () => {
		const first = createNewSpec();
		const second = createNewSpec();

		first.spec.info.title = 'Pet API';
		first.spec.components = {
			schemas: {
				Pet: {
					type: 'object',
					required: ['id'],
					properties: {
						id: { type: 'string', format: 'uuid' },
						name: { type: 'string' }
					}
				}
			}
		};
		first.spec.paths ??= {};
		first.spec.paths['/pets/{petId}'] = {
			parameters: [
				{
					name: 'petId',
					in: 'path',
					required: true,
					schema: { type: 'string' }
				}
			],
			get: {
				operationId: 'getPet',
				responses: {
					'200': {
						description: 'A pet',
						content: {
							'application/json': {
								schema: createReference('schemas', 'Pet')
							}
						}
					}
				}
			}
		};
		first.spec.webhooks = {
			petUpdated: {
				post: {
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: createReference('schemas', 'Pet')
							}
						}
					},
					responses: {
						'204': { description: 'Accepted' }
					}
				}
			}
		};

		expect(first.spec.info.title).toBe('Pet API');
		expect(second.spec.info.title).toBe('');
		expect(pathCount(first.spec)).toBe(1);
		expect(operationCount(first.spec)).toBe(1);
		expect(first.spec.webhooks.petUpdated).toBeDefined();

		const roundTrip = JSON.parse(JSON.stringify(first.spec));
		expect(roundTrip.paths['/pets/{petId}'].get.responses['200']).toBeDefined();
	});

	it('creates recursive schema shapes and component references', () => {
		const array = createSchema('array');
		const object = setSchemaType(createSchema(), 'object');
		const reference = createReference('schemas', 'User');

		expect(array).toMatchObject({ type: 'array', items: { type: 'string' } });
		expect(object).toMatchObject({ type: 'object', properties: {} });
		expect(isReference(reference)).toBe(true);
		expect(reference.$ref).toBe('#/components/schemas/User');
	});

	it('accepts valid templated paths and rejects malformed or duplicate variables', () => {
		expect(isValidPath('/users/{userId}/posts/{postId}')).toBe(true);
		expect(isValidPath('/users/{id}/{id}')).toBe(false);
		expect(isValidPath('users')).toBe(false);
		expect(isValidPath('/users/{id')).toBe(false);
	});
});
