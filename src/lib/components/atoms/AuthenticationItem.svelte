<script lang="ts">
	import { oauth2FlowTemplates } from '$lib/authTemplates';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import OAuthFlow from '$lib/components/atoms/OAuthFlow.svelte';

	export let schema: [String, OpenAPIV3_1.SecuritySchemeObject | OpenAPIV3_1.ReferenceObject];

	let availableFlows: ('implicit' | 'password' | 'clientCredentials' | 'authorizationCode')[] = [
		'implicit',
		'password',
		'clientCredentials',
		'authorizationCode'
	];

	// remove flows that are already in Object.keys(schema.flows)
	availableFlows = availableFlows.filter((flow) => {
		// if flows is not defined: skip
		// @ts-expect-error - security schema definition is lacking a bit
		if (!schema.flows) return;

		// if schema.flows check if flow already is a key
		// @ts-expect-error - security schema definition is lacking a bit
		return !Object.keys(schema.flows).includes(flow);
	});

	let flowType: 'implicit' | 'password' | 'clientCredentials' | 'authorizationCode';
	const addOauthFlow = () => {
		if (!flowType) return;
		// @ts-expect-error - security schema definition is lacking a bit
		schema.flows[flowType] = oauth2FlowTemplates[flowType];
		// remove used flow from availableFlows
		availableFlows = availableFlows.filter((flow) => flow !== flowType);
	};

	const removeOauthFlow = (flow: 'implicit' | 'password' | 'clientCredentials' | 'authorizationCode') => {
		// @ts-expect-error - security schema definition is lacking a bit
		let tempFlows = schema.flows;
		delete tempFlows[flow];
		// @ts-expect-error - security schema definition is lacking a bit
		schema.flows = tempFlows;

		// add flow back to availableFlows
		availableFlows = [...availableFlows, flow];
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
			<textarea class="textarea" placeholder="Description" />
		</label>
		<label>
			<h5 class="h5">Bearer format</h5>
			<p class="text-sm">A hint to the client to identify how the bearer token is formatted.</p>
			<input type="text" class="input" placeholder="JWT" />
		</label>
	{:else if schema.type === 'apiKey'}
		<h3 class="h3">API Key Authentication</h3>
		<label>
			<h5 class="h5">Location</h5>
			<select class="input">
				<option value="header">header</option>
				<option value="query">query</option>
				<option value="cookie">cookie</option>
			</select>
		</label>
		<label>
			<h5 class="h5">Name</h5>
			<p class="text-sm">The name of the key parameter in the location.</p>
			<input type="text" class="input" placeholder="api_key" />
		</label>
		<label>
			<h5 class="h5">Description</h5>
			<p class="text-sm">Human-readable information. May contain Markdown.</p>
			<textarea class="textarea" placeholder="Description" />
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
			/>
		</label>
		<label>
			<h5 class="h5">Description</h5>
			<p class="text-sm">Human-readable information. May contain Markdown.</p>
			<textarea class="textarea" placeholder="Description" />
		</label>
	{:else if schema.type === 'oauth2'}
		<h3 class="h3">Oauth2 Authentication</h3>
		<label>
			<h5 class="h5">Description</h5>
			<p class="text-sm">Human-readable information. May contain Markdown.</p>
			<textarea class="textarea" placeholder="Description" />
		</label>

		<h5 class="h5">Flows</h5>
		{#each Object.keys(schema.flows) as flow}
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
			<OAuthFlow type={flow} flow={schema.flows[flow]} />
		{/each}

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
</div>
