<script lang="ts">
	import { HttpMethods } from '$lib';
	import ParameterInput from '$lib/components/atoms/ParameterInput.svelte';
	import { getPathVariables } from '$lib/pathHandling';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import { Accordion, AccordionItem, filter } from '@skeletonlabs/skeleton';
	import { selectedSpec } from '$lib/db';
	import { page } from '$app/stores';

	$: console.log($page.params.pathName);

	const filterParams = (
		param: OpenAPIV3_1.ParameterObject | OpenAPIV3_1.ReferenceObject
	): param is OpenAPIV3_1.ParameterObject => {
		return !('$ref' in param);
	};

	let newParam: 'query' | 'header' | 'cookie' = 'query';
	let tempPath: OpenAPIV3_1.PathItemObject = {
		parameters: []
	};

	const pathVariables = getPathVariables($page.params.pathName ?? '');

	pathVariables.forEach((variable) => {
		// push path variables to the parameters array
		// @ts-expect-error - working with a array thats loosely defined
		tempPath.parameters.push({
			name: variable,
			in: 'path',
			required: true
		});
	});

	const newMethod = () =>
		structuredClone({
			tags: [],
			summary: '',
			description: '',
			externalDocs: {
				description: '',
				url: ''
			},
			operationId: '',
			parameters: [],
			requestBody: {
				content: {},
				description: '',
				required: false
			},
			responses: {},
			callbacks: {},
			deprecated: false,
			security: [],
			servers: []
		});
</script>

<div
	class="border-token border-surface-500 space-y-4 px-6 py-4 rounded-container-token variant-glass-surface"
>
	<h3 class="h3 font-mono">
		Path: {$page.params.pathName}
	</h3>
	<hr />

	{#if $selectedSpec.spec.paths != undefined && $page.params.pathName != undefined && $selectedSpec.spec.paths[$page.params.pathName] != undefined}
		<Accordion>
			<AccordionItem open>
				<svelte:fragment slot="summary">
					<h4 class="h4">General</h4>
				</svelte:fragment>
				<svelte:fragment slot="content">
					<label class="space-y-2">
						<p>Summary</p>
						{#if $selectedSpec.spec.paths[$page.params.pathName]?.summary != undefined}
							<input
								type="text"
								class="input"
								bind:value={$selectedSpec.spec.paths[$page.params.pathName].summary}
								placeholder="Summary of the path"
							/>
						{:else}
							<button
								class="btn variant-ghost-tertiary"
								on:click={() => {
									// @ts-expect-error - already inside a nullcheck
									$selectedSpec.spec.paths[$page.params.pathName].summary = '';
								}}
							>
								Add Summary
							</button>
						{/if}
					</label>
					<label class="space-y-2">
						<p>Description</p>
						{#if $selectedSpec.spec.paths[$page.params.pathName]?.description != undefined}
							<textarea
								class="textarea"
								bind:value={$selectedSpec.spec.paths[$page.params.pathName].description}
								placeholder="Description of the path. Supports markdown."
							/>
						{:else}
							<button
								class="btn variant-ghost-tertiary"
								on:click={() => {
									// @ts-expect-error - already inside a nullcheck
									$selectedSpec.spec.paths[$page.params.pathName].description = '';
								}}
							>
								Add Description
							</button>
						{/if}
					</label>
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem open>
				<svelte:fragment slot="summary">
					<h4 class="h4">Custom Servers</h4>
				</svelte:fragment>
				<svelte:fragment slot="content">
					<p>Here you can add custom servers for this specific call.</p>
					{#if tempPath.servers && tempPath.servers.length > 0}
						{#each tempPath.servers as server, index}
							<label class="space-y-2">
								<p>Server {index + 1}</p>
								<input
									type="text"
									class="input"
									bind:value={server.url}
									placeholder="URL of the server"
								/>
							</label>
						{/each}
					{/if}

					<button type="button" class="btn variant-filled-primary"> Add Server </button>
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem>
				<svelte:fragment slot="summary">
					<h4 class="h4">Parameters</h4>
				</svelte:fragment>
				<svelte:fragment slot="content">
					{#if tempPath.parameters}
						{#each tempPath.parameters.filter(filterParams) as param}
							<ParameterInput variableName={param.name} bind:value={param} location="path" />
						{/each}
					{/if}

					<span class="flex items-center gap-2">
						<select name="newParameter" bind:value={newParam} class="select w-min">
							<option value="query">Query</option>
							<option value="header">Header</option>
							<option value="cookie">Cookie</option>
						</select>
						<button type="button" class="btn variant-filled-primary">
							Add {newParam} Parameter
						</button>
					</span>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
		<h4 class="h4">Operations</h4>

		<p>Here you can add operations for this path. Select only the operations you want to support</p>

		{#if $selectedSpec.spec.paths[$page.params.pathName]}
			<div class="flex flex-col gap-2">
				{#each Object.values(HttpMethods) as method}
				<div class="flex flex-row gap-2 justify-between max-w-xs">
					<label class="flex items-center gap-2">
						<input
						type="checkbox"
						class="checkbox"
						checked={$selectedSpec.spec.paths[$page.params.pathName]?.hasOwnProperty(method)}
						on:change={(event) => {
							// @ts-expect-error - this is a valid access
							switch (event.target.checked) {
								case true:
									// @ts-expect-error - already inside a nullcheck
									$selectedSpec.spec.paths[$page.params.pathName][method] = newMethod();
									break;
									
									case false:
										if (confirm('Are you sure you want to remove this operation?')) {
											// @ts-expect-error - already inside a nullcheck
											$selectedSpec.spec.paths[$page.params.pathName][method] = undefined;
										} else {
											event.target.checked = true;
										}
										break;
									}
							}}
						/>
						{method.toUpperCase()}
					</label>
					<a href={`/paths/${$page.params.pathName}/z/${method}`} class="btn btn-sm variant-ghost-success">
						Edit
					</a>
				</div>
				{/each}
			</div>
		{/if}
		{/if}
	</div>
