import { get } from 'svelte/store';
import type { ModalSettings, ModalStore } from '@skeletonlabs/skeleton';
import { pathTemplate } from './pathTemplate';
import type { OpenAPIV3_1 } from './openAPITypes';
import { selectedSpec } from './db';

export const pathVariables = /\{([^}]+)\}/gm;

export const pathRegex = /\/([/]*[{]?[a-zA-Z]+[}]?)*/gm;

/// Adds a new path to the OpenAPI document
export const addPath = (modalStore: ModalStore, startingPoint: string = '/') => {
	let userPath: string = startingPoint.trim();

	const modal: ModalSettings = {
		type: 'prompt',
		// Data
		title: 'Enter Pathname',
		body: 'Wrap path parameters in curly braces. Example: /users/{userId}',
		// Populates the input value and attributes
		value: userPath,
		valueAttr: { type: 'text', minlength: 1, required: true },
		// Returns the updated response value
		response: (r: string | boolean | undefined) => {
			if (r === false) return;
			if (typeof r !== 'string') return;

			userPath = r.trim();

			// Check if path already exists
			if (!pathExists(userPath)) {
				modalStore.trigger({
					type: 'alert',
					title: 'Path already exists',
					body: `The path "${userPath}" is already in this document.`
				});
				return;
			}
			// Check if path is valid
			if (!isValidPath(userPath)) {
				modalStore.trigger({
					type: 'alert',
					title: 'Invalid path',
					body: 'Paths must start with / and use unique variables wrapped in curly braces.'
				});
				return;
			}

			// create path object
			const store = get(selectedSpec);
			if (!store.spec.paths) store.spec.paths = {};
			store.spec.paths[userPath] = structuredClone(pathTemplate);
			selectedSpec.set(store);

			// sort paths alphabetically
			sortPathsAlphabetically();
		}
	};

	modalStore.trigger(modal);
};

export const renamePath = (modalStore: ModalStore, oldPath: string) => {
	let userPath: string = oldPath;
	const modal: ModalSettings = {
		type: 'prompt',
		// Data
		title: 'Rename path',
		body: 'Wrap path parameters in curly braces. Example: /users/{userId}',
		// Populates the input value and attributes
		value: userPath,
		valueAttr: { type: 'text', minlength: 1, required: true },
		// Returns the updated response value
		response: (r: string | boolean | undefined) => {
			if (r === false) return;
			if (typeof r !== 'string') return;

			userPath = r.trim();
			if (userPath === oldPath) return;

			// Check if path already exists
			if (!pathExists(userPath)) {
				modalStore.trigger({
					type: 'alert',
					title: 'Path already exists',
					body: `The path "${userPath}" is already in this document.`
				});
				return;
			}
			// Check if path is valid
			if (!isValidPath(userPath)) {
				modalStore.trigger({
					type: 'alert',
					title: 'Invalid path',
					body: 'Paths must start with / and use unique variables wrapped in curly braces.'
				});
				return;
			}

			// create path object
			const store = get(selectedSpec);
			if (!store.spec.paths) store.spec.paths = {};

			// copy old path object to new path object
			store.spec.paths[userPath] = store.spec.paths[oldPath];
			// delete old path object
			delete store.spec.paths[oldPath];

			// add path to store
			selectedSpec.set(store);

			// sort paths alphabetically
			sortPathsAlphabetically();
		}
	};

	modalStore.trigger(modal);
};

/// Removes a path from the OpenAPI document
export const deletePath = (modalStore: ModalStore, path: string) => {
	const modal: ModalSettings = {
		type: 'confirm',
		// Data
		title: `Delete ${path}?`,
		body: 'Are you sure you wish to delete the path?',
		// TRUE if confirm pressed, FALSE if cancel pressed
		response: (r: boolean) => {
			if (r === false) return;
			const store = get(selectedSpec);
			// check if path exists
			if (!store.spec.paths) return;
			if (!(path in store.spec.paths)) return;
			delete store.spec.paths[path];
			selectedSpec.set(store);
		}
	};
	modalStore.trigger(modal);
};

/// checks if a given path already exists
export const pathExists = (path: string) => {
	const store = get(selectedSpec);
	return !(path in (store.spec.paths ?? {}));
};

/// checks if a given path is valid
export const isValidPath = (path: string) => {
	// check if path variables aren't duplicated
	const variableRegex = /\{([^}]+)\}/gm;
	const variables = path.match(variableRegex);
	if (variables) {
		const uniqueVariables = new Set(variables);
		if (variables.length !== uniqueVariables.size) return false;
	}

	// check if path is a valid path
	return /^\/(?:[^/{}]+|\{[^/{}]+\})(?:\/(?:[^/{}]+|\{[^/{}]+\}))*$|^\/$/.test(path);
};

/// sorts the paths in the OpenAPI document alphabetically
export const sortPathsAlphabetically = () => {
	const tempPathObject = {};
	const store = get(selectedSpec);
	// @ts-expect-error - we are working with an initially empty object
	Object.keys(store.spec.paths)
		.sort()
		.forEach((key) => {
			// @ts-expect-error - we are working with initially empty objects
			tempPathObject[key] = store.spec.paths[key];
		});

	// update path object
	selectedSpec.update((data) => {
		data.spec.paths = tempPathObject;
		return data;
	});
};

export const getPathVariables = (path: string) => {
	const variables = path.match(pathVariables);
	if (!variables) return [];

	return variables.map((variable) => variable.replace('{', '').replace('}', ''));
};

export const sortPathParameters = (parameters: OpenAPIV3_1.ParameterObject[]) => {
	const tempParameters = [...parameters];
	tempParameters.sort((a, b) => {
		if (a.in < b.in) return -1;
		if (a.in > b.in) return 1;
		return 0;
	});
	return tempParameters;
};
