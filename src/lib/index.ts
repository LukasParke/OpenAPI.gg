import type { OpenAPIV3_1 } from './openAPITypes';
export const operationCount = (openApiDoc: OpenAPIV3_1.Document) => {
	const methods = new Set(Object.values(HttpMethods));
	return Object.values(openApiDoc.paths ?? {}).reduce((count, path) => {
		if (!path) return count;
		return count + Object.keys(path).filter((key) => methods.has(key as HttpMethods)).length;
	}, 0);
};

export const pathCount = (openApiDoc: OpenAPIV3_1.Document) => {
	return Object.keys(openApiDoc.paths ?? {}).filter((path) => !path.startsWith('x-')).length;
};

export enum HttpMethods {
	GET = 'get',
	PUT = 'put',
	POST = 'post',
	DELETE = 'delete',
	OPTIONS = 'options',
	HEAD = 'head',
	PATCH = 'patch',
	TRACE = 'trace'
}

// export path handling functions
export * from './pathHandling';
