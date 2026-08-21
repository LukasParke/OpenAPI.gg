import type { OpenAPIV3_1 } from './openAPITypes';

export type EditableSchema = OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;

export const schemaTypes = [
	'string',
	'number',
	'integer',
	'boolean',
	'array',
	'object',
	'null'
] as const;
export type SchemaType = (typeof schemaTypes)[number];

export const createSchema = (type: SchemaType = 'string'): OpenAPIV3_1.SchemaObject => {
	if (type === 'array') {
		return { type: 'array', items: { type: 'string' } };
	}
	if (type === 'object') {
		return { type: 'object', properties: {} };
	}
	return { type };
};

export const createReference = (section: string, name: string): OpenAPIV3_1.ReferenceObject => ({
	$ref: `#/components/${section}/${name}`
});

export const referenceName = (reference: string) => reference.split('/').at(-1) ?? reference;

export const isReference = (value: unknown): value is OpenAPIV3_1.ReferenceObject =>
	typeof value === 'object' && value !== null && '$ref' in value;

export const setSchemaType = (
	schema: OpenAPIV3_1.SchemaObject,
	type: SchemaType
): OpenAPIV3_1.SchemaObject => {
	const next = { ...schema, type } as OpenAPIV3_1.SchemaObject;
	if (type === 'array' && !('items' in next)) {
		return { ...next, type: 'array', items: createSchema() };
	}
	if (type === 'object') {
		next.properties ??= {};
	}
	return next;
};
