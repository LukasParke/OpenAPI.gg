import type { OpenAPIV3_1 } from './openAPITypes';
import { HttpMethods } from './index';
import { getPathVariables } from './pathHandling';

export type DiagnosticSeverity = 'error' | 'warning';

export interface Diagnostic {
	severity: DiagnosticSeverity;
	path: string;
	message: string;
}

const isParameter = (
	parameter: OpenAPIV3_1.ParameterObject | OpenAPIV3_1.ReferenceObject
): parameter is OpenAPIV3_1.ParameterObject => !('$ref' in parameter);

const collectReferences = (
	value: unknown,
	location = '$'
): { reference: string; location: string }[] => {
	if (!value || typeof value !== 'object') return [];
	if ('$ref' in value && typeof value.$ref === 'string') {
		return [{ reference: value.$ref, location }];
	}

	return Object.entries(value).flatMap(([key, child]) =>
		collectReferences(child, `${location}.${key}`)
	);
};

const resolvesLocalReference = (document: OpenAPIV3_1.Document, reference: string) => {
	if (!reference.startsWith('#/')) return true;
	let current: unknown = document;
	for (const segment of reference
		.slice(2)
		.split('/')
		.map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))) {
		if (
			!current ||
			typeof current !== 'object' ||
			!Object.prototype.hasOwnProperty.call(current, segment)
		) {
			return false;
		}
		current = (current as Record<string, unknown>)[segment];
	}
	return true;
};

export const validateDocument = (document: OpenAPIV3_1.Document): Diagnostic[] => {
	const diagnostics: Diagnostic[] = [];
	const operationIds = new Map<string, string>();

	if (!document.info.title.trim()) {
		diagnostics.push({ severity: 'error', path: 'info.title', message: 'API title is required.' });
	}
	if (!document.info.version.trim()) {
		diagnostics.push({
			severity: 'error',
			path: 'info.version',
			message: 'API version is required.'
		});
	}

	for (const [pathName, path] of Object.entries(document.paths ?? {})) {
		if (!path || pathName.startsWith('x-')) continue;
		const location = `paths.${pathName}`;
		if (!pathName.startsWith('/')) {
			diagnostics.push({
				severity: 'error',
				path: location,
				message: 'Path names must start with "/".'
			});
		}

		const pathParameters = (path.parameters ?? []).filter(isParameter);
		const declaredPathParameters = new Set(
			pathParameters
				.filter((parameter) => parameter.in === 'path')
				.map((parameter) => parameter.name)
		);
		for (const variable of getPathVariables(pathName)) {
			if (!declaredPathParameters.has(variable)) {
				diagnostics.push({
					severity: 'error',
					path: `${location}.parameters`,
					message: `Path variable "${variable}" needs a required path parameter.`
				});
			}
		}
		for (const parameter of pathParameters.filter((item) => item.in === 'path')) {
			if (!parameter.required) {
				diagnostics.push({
					severity: 'error',
					path: `${location}.parameters.${parameter.name}`,
					message: 'Path parameters must be required.'
				});
			}
			if (!getPathVariables(pathName).includes(parameter.name)) {
				diagnostics.push({
					severity: 'warning',
					path: `${location}.parameters.${parameter.name}`,
					message: 'This path parameter does not appear in the path template.'
				});
			}
		}

		for (const method of Object.values(HttpMethods)) {
			const operation = path[method];
			if (!operation) continue;
			const operationLocation = `${location}.${method}`;
			if (!operation.responses || Object.keys(operation.responses).length === 0) {
				diagnostics.push({
					severity: 'error',
					path: `${operationLocation}.responses`,
					message: 'Every operation needs at least one response.'
				});
			}
			if (operation.operationId) {
				const previous = operationIds.get(operation.operationId);
				if (previous) {
					diagnostics.push({
						severity: 'error',
						path: `${operationLocation}.operationId`,
						message: `Operation ID "${operation.operationId}" is already used by ${previous}.`
					});
				} else {
					operationIds.set(operation.operationId, `${method.toUpperCase()} ${pathName}`);
				}
			}
		}
	}

	const securitySchemes = document.components?.securitySchemes ?? {};
	for (const [index, requirement] of (document.security ?? []).entries()) {
		for (const name of Object.keys(requirement)) {
			if (!(name in securitySchemes)) {
				diagnostics.push({
					severity: 'error',
					path: `security.${index}.${name}`,
					message: `Security requirement "${name}" has no matching security scheme.`
				});
			}
		}
	}

	for (const { reference, location } of collectReferences(document)) {
		if (!resolvesLocalReference(document, reference)) {
			diagnostics.push({
				severity: 'error',
				path: location,
				message: `Reference "${reference}" does not resolve.`
			});
		}
	}

	return diagnostics;
};

export const diagnosticCounts = (diagnostics: Diagnostic[]) => ({
	errors: diagnostics.filter((diagnostic) => diagnostic.severity === 'error').length,
	warnings: diagnostics.filter((diagnostic) => diagnostic.severity === 'warning').length
});
