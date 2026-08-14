<script lang="ts">
	import { oauth2FlowTemplates } from '$lib/authTemplates';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import OAuthFlow from '$lib/components/atoms/OAuthFlow.svelte';

	export let schema: OpenAPIV3_1.SecuritySchemeObject;

	type FlowType = 'implicit' | 'password' | 'clientCredentials' | 'authorizationCode';
	const flowTypes: FlowType[] = ['implicit', 'password', 'clientCredentials', 'authorizationCode'];

	$: oauthFlows = schema.type === 'oauth2' ? schema.flows : {};
	$: configuredFlows = Object.keys(oauthFlows) as FlowType[];
	$: availableFlows = flowTypes.filter((flow) => !configuredFlows.includes(flow));

	let flowType: FlowType = 'implicit';
	const addOauthFlow = () => {
		if (schema.type !== 'oauth2' || !flowType) return;
		if (flowType === 'implicit') {
			schema.flows.implicit = structuredClone(oauth2FlowTemplates.implicit);
		} else if (flowType === 'password') {
			schema.flows.password = structuredClone(oauth2FlowTemplates.password);
		} else if (flowType === 'clientCredentials') {
			schema.flows.clientCredentials = structuredClone(oauth2FlowTemplates.clientCredentials);
		} else {
			schema.flows.authorizationCode = structuredClone(oauth2FlowTemplates.authorizationCode);
		}
		schema = schema;
		flowType = availableFlows.find((flow) => flow !== flowType) ?? 'implicit';
	};

	const removeOauthFlow = (flow: FlowType) => {
		if (schema.type !== 'oauth2') return;
		delete schema.flows[flow];
		schema = schema;
	};
</script>

<div class="space-y-2">
	{#if schema.type === 'http' && schema.scheme === 'basic'}
		<h3 class="h3">Basic Authentication</h3>
		<p>
			Basic authentication is a simple authentication scheme built into the HTTP protocol. No
			configuration required.
		</p>
	{:else if schema.type === 'http' && schema.scheme === 'bearer'}
		<h3 class="h3">Bearer Authentication</h3>
		<p>
			Bearer authentication (also called token authentication) is an HTTP authentication scheme that
			involves security tokens called bearer tokens.
		</p>
		<label>
			<h5 class="h5">Description</h5>
			<p class="text-sm">Human-readable information. May contain Markdown.</p>
			<textarea class="textarea" placeholder="Description" bind:value={schema.description} />
		</label>
		<label>
			<h5 class="h5">Bearer format</h5>
			<p class="text-sm">A hint to the client to identify how the bearer token is formatted.</p>
			<input type="text" class="input" placeholder="JWT" bind:value={schema.bearerFormat} />
		</label>
	{:else if schema.type === 'apiKey'}
		<h3 class="h3">API Key Authentication</h3>
		<label>
			<h5 class="h5">Location</h5>
			<select class="input" bind:value={schema.in}>
				<option value="header">header</option>
				<option value="query">query</option>
				<option value="cookie">cookie</option>
			</select>
		</label>
		<label>
			<h5 class="h5">Name</h5>
			<p class="text-sm">The name of the key parameter in the location.</p>
			<input type="text" class="input" placeholder="api_key" bind:value={schema.name} />
		</label>
		<label>
			<h5 class="h5">Description</h5>
			<p class="text-sm">Human-readable information. May contain Markdown.</p>
			<textarea class="textarea" placeholder="Description" bind:value={schema.description} />
		</label>
	{:else if schema.type === 'openIdConnect'}
		<h3 class="h3">OpenID Connect Authentication</h3>
		<label>
			<h5 class="h5">OpenID Connect URL</h5>
			<p class="text-sm">The URL must point to a JSON OpenID Connect Discovery document.</p>
			<input
				type="url"
				class="input"
				placeholder="https://example.com/.well-known/openid-configuration"
				bind:value={schema.openIdConnectUrl}
			/>
		</label>
		<label>
			<h5 class="h5">Description</h5>
			<p class="text-sm">Human-readable information. May contain Markdown.</p>
			<textarea class="textarea" placeholder="Description" bind:value={schema.description} />
		</label>
	{:else if schema.type === 'oauth2'}
		<h3 class="h3">Oauth2 Authentication</h3>
		<label>
			<h5 class="h5">Description</h5>
			<p class="text-sm">Human-readable information. May contain Markdown.</p>
			<textarea class="textarea" placeholder="Description" bind:value={schema.description} />
		</label>

		<h5 class="h5">Flows</h5>
		{#each configuredFlows as flow}
			{@const configuredFlow = schema.flows[flow]}
			<div class="flex w-full justify-between items-center">
				<h6 class="h6">{flow.charAt(0).toLocaleUpperCase() + flow.slice(1)}</h6>

				<button
					type="button"
					class="btn btn-sm variant-ringed-error hover:variant-filled-error"
					on:click={() => removeOauthFlow(flow)}
				>
					Remove {flow}
				</button>
			</div>
			{#if configuredFlow}
				<OAuthFlow type={flow} flow={configuredFlow} />
			{/if}
		{/each}

		{#if availableFlows.length > 0}
			<span class="w-full flex justify-center gap-2">
				<select class="input w-min" bind:value={flowType}>
					{#each availableFlows as flow}
						<option value={flow}>{flow}</option>
					{/each}
				</select>
				<button type="button" class="btn btn-sm variant-filled-primary" on:click={addOauthFlow}>
					Add Flow
				</button>
			</span>
		{/if}
	{/if}
</div>
