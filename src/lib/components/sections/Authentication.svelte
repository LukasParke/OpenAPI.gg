<script lang="ts">
	import {
		apiKeyAuthTemplate,
		basicAuthTemplate,
		bearerAuthTemplate,
		oauth2AuthTemplate,
		openIdAuthTemplate
	} from '$lib/authTemplates';
	import { selectedSpec } from '$lib/db';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import AuthenticationItem from '../atoms/AuthenticationItem.svelte';

	type SchemeType = 'basicAuth' | 'bearerAuth' | 'apiKeyAuth' | 'openId' | 'oauth2';

	const templates: Record<SchemeType, OpenAPIV3_1.SecuritySchemeObject> = {
		basicAuth: basicAuthTemplate,
		bearerAuth: bearerAuthTemplate,
		apiKeyAuth: apiKeyAuthTemplate,
		openId: openIdAuthTemplate,
		oauth2: oauth2AuthTemplate
	};

	let selectedSchema: SchemeType = 'basicAuth';
	let schemeName = 'basicAuth';
	let errorMessage = '';

	$: securitySchemes = $selectedSpec.spec.components?.securitySchemes ?? {};

	const addSecurityScheme = () => {
		const name = schemeName.trim();
		if (!name) return;
		if (securitySchemes[name]) {
			errorMessage = `A security scheme named "${name}" already exists.`;
			return;
		}

		$selectedSpec.spec.components ??= {};
		$selectedSpec.spec.components.securitySchemes ??= {};
		$selectedSpec.spec.components.securitySchemes[name] = structuredClone(
			templates[selectedSchema]
		);
		errorMessage = '';
		$selectedSpec = $selectedSpec;
	};

	const removeSecurityScheme = (name: string) => {
		if (!$selectedSpec.spec.components?.securitySchemes) return;
		delete $selectedSpec.spec.components.securitySchemes[name];
		$selectedSpec.spec.security = ($selectedSpec.spec.security ?? [])
			.map((requirement) => {
				const copy = { ...requirement };
				delete copy[name];
				return copy;
			})
			.filter((requirement) => Object.keys(requirement).length > 0);
		$selectedSpec = $selectedSpec;
	};

	const isSecurityScheme = (
		schema: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SecuritySchemeObject
	): schema is OpenAPIV3_1.SecuritySchemeObject => !('$ref' in schema);
</script>

<div class="space-y-4">
	<div class="border-token rounded-container-token bg-surface-backdrop-token px-6 py-4 space-y-4">
		<h2 class="h3">Security schemes</h2>
		<p class="text-sm">
			Define reusable authentication schemes under <code>components.securitySchemes</code>.
		</p>

		{#each Object.entries(securitySchemes) as [name, schema]}
			<div class="card w-full p-4 space-y-3">
				<div class="flex justify-between items-center gap-4">
					<h3 class="h4">{name}</h3>
					<button
						type="button"
						class="btn btn-sm variant-ringed-error hover:variant-filled-error"
						on:click={() => removeSecurityScheme(name)}
					>
						Remove scheme
					</button>
				</div>
				{#if isSecurityScheme(schema)}
					<AuthenticationItem {schema} onChange={() => ($selectedSpec = $selectedSpec)} />
				{:else}
					<label class="space-y-2">
						<span>Reference</span>
						<input class="input" bind:value={schema.$ref} />
					</label>
				{/if}
			</div>
		{/each}

		<div class="grid gap-2 sm:grid-cols-[1fr_1fr_auto] items-end">
			<label class="space-y-1">
				<span class="text-sm">Scheme name</span>
				<input class="input" bind:value={schemeName} placeholder="bearerAuth" />
			</label>
			<label class="space-y-1">
				<span class="text-sm">Scheme type</span>
				<select bind:value={selectedSchema} class="select">
					<option value="basicAuth">Basic Auth</option>
					<option value="bearerAuth">Bearer Auth</option>
					<option value="apiKeyAuth">API Key Auth</option>
					<option value="openId">OpenID Connect</option>
					<option value="oauth2">OAuth 2.0</option>
				</select>
			</label>
			<button type="button" class="btn variant-filled-primary" on:click={addSecurityScheme}>
				Add scheme
			</button>
		</div>
		{#if errorMessage}
			<p class="text-error-500 text-sm" role="alert">{errorMessage}</p>
		{/if}
	</div>

	<div class="border-token rounded-container-token bg-surface-backdrop-token px-6 py-4 space-y-3">
		<h2 class="h3">Global security requirements</h2>
		<p class="text-sm">
			Choose which schemes apply globally. Individual operations may override these requirements.
		</p>
		{#if Object.keys(securitySchemes).length === 0}
			<p class="text-sm opacity-70">Add a security scheme first.</p>
		{:else}
			{#each Object.keys(securitySchemes) as name}
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						class="checkbox"
						checked={($selectedSpec.spec.security ?? []).some((requirement) => name in requirement)}
						on:change={(event) => {
							const checked = event.currentTarget.checked;
							const requirements = ($selectedSpec.spec.security ?? []).filter(
								(requirement) => !(name in requirement)
							);
							if (checked) requirements.push({ [name]: [] });
							$selectedSpec.spec.security = requirements;
							$selectedSpec = $selectedSpec;
						}}
					/>
					{name}
				</label>
			{/each}
		{/if}
	</div>
</div>
