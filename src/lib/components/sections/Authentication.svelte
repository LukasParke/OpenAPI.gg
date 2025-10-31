<script lang="ts">
	import {
		apiKeyAuthTemplate,
		basicAuthTemplate,
		bearerAuthTemplate,
		oauth2AuthTemplate,
		openIdAuthTemplate
	} from '$lib/authTemplates';
	import { selectedSpec } from '$lib/db';
	import AuthenticationItem from '../atoms/AuthenticationItem.svelte';

	let selectedSchema: string;
	const addSecuritySchema = () => {
		let tempSchemaList = $selectedSpec.spec.components?.securitySchemes || [];
		let newSchema;
		switch (selectedSchema) {
			case 'basicAuth':
				newSchema = basicAuthTemplate;
				break;
			case 'bearerAuth':
				newSchema = bearerAuthTemplate;
				break;
			case 'ApiKeyAuth':
				newSchema = apiKeyAuthTemplate;
				break;
			case 'openId':
				newSchema = openIdAuthTemplate;
				break;
			case 'oAuthSample':
				newSchema = oauth2AuthTemplate;
				break;
			default:
				newSchema = undefined;
				break;
		}

		if (newSchema) {
			tempSchemaList = [...tempSchemaList, newSchema];
			$selectedSpec.spec.components.securitySchemes = tempSchemaList;
		}
	};
	const removeSecuritySchema = (index: number) => {
		let tempSchemaList = $selectedSpec.spec.components.securitySchemes;
		tempSchemaList.splice(index, 1);
		$selectedSpec.spec.components.securitySchemes = tempSchemaList;
	};
</script>

{#if $selectedSpec.spec.components?.securitySchemes}
	<form
		class="border-token rounded-container-token bg-surface-backdrop-token px-6 py-4 min-h-20 space-y-4"
	>
		{#each Object.entries($selectedSpec.spec.components.securitySchemes) as schema, index}
			<div class="card w-full p-4">
				<div class="flex flex-row-reverse w-full">
					<button
						type="button"
						class="btn btn-sm variant-ringed-error hover:variant-filled-error"
						on:click={() => {
							removeSecuritySchema(index);
						}}
					>
						Remove schema
					</button>
				</div>
				<AuthenticationItem bind:schema />
			</div>
			<hr />
		{/each}

		<span class="flex flex-wrap justify-center items-center gap-2 max-w-sm mx-auto">
			<select name="security-schema" bind:value={selectedSchema} class="input w-fit text-sm grow">
				<option value="basicAuth" selected>Basic Auth</option>
				<option value="bearerAuth">Bearer Auth</option>
				<option value="ApiKeyAuth">API Key Auth</option>
				<option value="openId">OpenID</option>
				<option value="oAuthSample">OAuth2</option>
			</select>
			<button type="button" class="btn text-sm variant-filled-primary grow" on:click={addSecuritySchema}>
				Add Security Schema
			</button>
		</span>
	</form>
{:else}
	<div class="grid place-content-center h-full">
		<p class="p-4">No security schema defined</p>
		<button
			class="btn variant-ghost-success"
			on:click={() => {
				addSecuritySchema();
			}}
		>
			Add security schema
		</button>
	</div>
{/if}
