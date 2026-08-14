import type { OpenAPIV3_1 } from './openAPITypes';

export const basicAuthTemplate: OpenAPIV3_1.HttpSecurityScheme = {
	type: 'http',
	scheme: 'basic',
	description: undefined
};

export const bearerAuthTemplate: OpenAPIV3_1.HttpSecurityScheme = {
	type: 'http',
	scheme: 'bearer',
	bearerFormat: undefined,
	description: undefined
};

export const apiKeyAuthTemplate: OpenAPIV3_1.ApiKeySecurityScheme = {
	type: 'apiKey',
	in: 'header', // or 'query' or 'cookie'
	name: '',
	description: undefined
};

export const openIdAuthTemplate: OpenAPIV3_1.OpenIdSecurityScheme = {
	type: 'openIdConnect',
	openIdConnectUrl: '',
	description: undefined
};

export const oauth2AuthTemplate: OpenAPIV3_1.OAuth2SecurityScheme = {
	type: 'oauth2',
	flows: {},
	description: undefined
};

const baseOauth2Flow = {
	authorizationUrl: '',
	scopes: {},
	refreshUrl: undefined
};

export const oauth2FlowTemplates: Oauth2.Oauth2FlowTemplates = {
	implicit: baseOauth2Flow,
	password: {
		tokenUrl: '',
		scopes: {},
		refreshUrl: undefined
	},
	clientCredentials: {
		tokenUrl: '',
		scopes: {},
		refreshUrl: undefined
	},
	authorizationCode: {
		...baseOauth2Flow,
		tokenUrl: ''
	}
};
