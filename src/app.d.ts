// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}

declare namespace Oauth2 {
	interface Oauth2Flow {
		authorizationUrl?: string;
		tokenUrl?: string;
		scopes: Record<string, string>;
		refreshUrl?: string;
	}

	interface Oauth2FlowTemplates {
		implicit: Oauth2Flow & { authorizationUrl: string };
		password: Oauth2Flow & { tokenUrl: string };
		clientCredentials: Oauth2Flow & { tokenUrl: string };
		authorizationCode: Oauth2Flow & { authorizationUrl: string; tokenUrl: string };
	}
}
