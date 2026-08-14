<script lang="ts">
	import { page } from '$app/stores';
	import ParameterInput from '$lib/components/atoms/ParameterInput.svelte';
	import PathOperationsEditor from '$lib/components/PathOperationsEditor.svelte';
	import { selectedSpec } from '$lib/db';
	import { getPathVariables } from '$lib/pathHandling';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';

	type ParameterLocation = 'query' | 'header' | 'cookie';

	$: index = Number($page.params.index);
	$: paths = $selectedSpec.spec.paths ?? {};
	$: pathName = Object.keys(paths)[index];
	$: path = pathName ? paths[pathName] : undefined;
	let newParam: ParameterLocation = 'query';
	let newParamName = '';
	let parameterError = '';

	const updateDocument = () => {
		$selectedSpec = $selectedSpec;
	};

	const ensurePathParameters = () => {
		if (!path || !pathName) return;
		let added = false;
		path.parameters ??= [];
		const existing = new Set(
			path.parameters
				.filter(isParameter)
				.filter((parameter) => parameter.in === 'path')
				.map((parameter) => parameter.name)
		);

		for (const variable of getPathVariables(pathName)) {
			if (!existing.has(variable)) {
				path.parameters.push({
					name: variable,
					in: 'path',
					required: true,
					schema: { type: 'string' }
				});
				added = true;
			}
		}
		if (added) updateDocument();
	};

	$: if (path && pathName) ensurePathParameters();

	const isParameter = (
		parameter: OpenAPIV3_1.ParameterObject | OpenAPIV3_1.ReferenceObject
	): parameter is OpenAPIV3_1.ParameterObject => !('$ref' in parameter);

	const addServer = () => {
		if (!path) return;
		path.servers ??= [];
		path.servers.push({ url: '', description: '' });
		updateDocument();
	};

	const addParameter = () => {
		if (!path) return;
		const name = newParamName.trim();
		if (!name) return;
		path.parameters ??= [];
		const duplicate = path.parameters
			.filter(isParameter)
			.some((parameter) => parameter.name === name && parameter.in === newParam);
		if (duplicate) {
			parameterError = `A ${newParam} parameter named "${name}" already exists.`;
			return;
		}
		path.parameters.push({
			name,
			in: newParam,
			required: false,
			schema: { type: 'string' }
		});
		newParamName = '';
		parameterError = '';
		updateDocument();
	};

	const parameterLocation = (
		parameter: OpenAPIV3_1.ParameterObject
	): 'path' | ParameterLocation => {
		if (parameter.in === 'path' || parameter.in === 'header' || parameter.in === 'cookie') {
			return parameter.in;
		}
		return 'query';
	};
</script>

{#if path && pathName}
	<div
		class="border-token border-surface-500 space-y-4 px-6 py-4 rounded-container-token variant-glass-surface"
	>
		<div class="flex justify-between items-center gap-4">
			<h1 class="h3">{pathName}</h1>
			<a href="/paths" class="btn btn-sm variant-ghost-primary">Back to paths</a>
		</div>
		<hr />

		<Accordion>
			<AccordionItem open>
				<svelte:fragment slot="summary"><h2 class="h4">General</h2></svelte:fragment>
				<svelte:fragment slot="content">
					<div class="space-y-4">
						<label class="space-y-2">
							<span>Summary</span>
							<input
								type="text"
								class="input"
								bind:value={path.summary}
								on:input={updateDocument}
								placeholder="Summary of the path"
							/>
						</label>
						<label class="space-y-2">
							<span>Description</span>
							<textarea
								class="textarea"
								bind:value={path.description}
								on:input={updateDocument}
								placeholder="Description of the path. Supports Markdown."
							/>
						</label>
					</div>
				</svelte:fragment>
			</AccordionItem>

			<AccordionItem>
				<svelte:fragment slot="summary"><h2 class="h4">Custom servers</h2></svelte:fragment>
				<svelte:fragment slot="content">
					<div class="space-y-3">
						{#each path.servers ?? [] as server, serverIndex}
							<div class="card p-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
								<input
									type="url"
									class="input"
									bind:value={server.url}
									on:input={updateDocument}
									placeholder="https://api.example.com"
								/>
								<input
									type="text"
									class="input"
									bind:value={server.description}
									on:input={updateDocument}
									placeholder="Description"
								/>
								<button
									type="button"
									class="btn btn-sm variant-ghost-error"
									on:click={() => {
										path.servers?.splice(serverIndex, 1);
										updateDocument();
									}}>Remove</button
								>
							</div>
						{/each}
						<button type="button" class="btn variant-filled-primary" on:click={addServer}>
							Add server
						</button>
					</div>
				</svelte:fragment>
			</AccordionItem>

			<AccordionItem>
				<svelte:fragment slot="summary"><h2 class="h4">Parameters</h2></svelte:fragment>
				<svelte:fragment slot="content">
					<div class="space-y-3">
						{#each (path.parameters ?? []).filter(isParameter) as parameter}
							<div class="space-y-2">
								<ParameterInput
									variableName={parameter.name}
									value={parameter}
									location={parameterLocation(parameter)}
									onChange={updateDocument}
									schemas={$selectedSpec.spec.components?.schemas ?? {}}
								/>
								{#if parameter.in !== 'path'}
									<button
										type="button"
										class="btn btn-sm variant-ghost-error"
										on:click={() => {
											const index = path.parameters?.indexOf(parameter) ?? -1;
											if (index >= 0) path.parameters?.splice(index, 1);
											updateDocument();
										}}>Remove parameter</button
									>
								{/if}
							</div>
						{/each}
						<div class="flex items-center gap-2">
							<input
								class="input"
								bind:value={newParamName}
								placeholder={`${newParam} parameter name`}
							/>
							<select bind:value={newParam} class="select w-min">
								<option value="query">Query</option>
								<option value="header">Header</option>
								<option value="cookie">Cookie</option>
							</select>
							<button type="button" class="btn variant-filled-primary" on:click={addParameter}>
								Add parameter
							</button>
						</div>
						{#if parameterError}
							<p class="text-error-500 text-sm" role="alert">{parameterError}</p>
						{/if}
					</div>
				</svelte:fragment>
			</AccordionItem>

			<AccordionItem>
				<svelte:fragment slot="summary"><h2 class="h4">Operations</h2></svelte:fragment>
				<svelte:fragment slot="content">
					<PathOperationsEditor
						{path}
						components={$selectedSpec.spec.components ?? {}}
						onChange={updateDocument}
					/>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
	</div>
{:else}
	<div class="grid place-content-center h-full gap-3 text-center">
		<h1 class="h3">Path not found</h1>
		<a href="/paths" class="btn variant-filled-primary">Back to paths</a>
	</div>
{/if}
