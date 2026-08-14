<script lang="ts">
	import { page } from '$app/stores';
	import { HttpMethods } from '$lib';
	import ParameterInput from '$lib/components/atoms/ParameterInput.svelte';
	import { selectedSpec } from '$lib/db';
	import { getPathVariables } from '$lib/pathHandling';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';

	type ParameterLocation = 'query' | 'header' | 'cookie';

	const index = Number($page.params.index);
	$: paths = $selectedSpec.spec.paths ?? {};
	$: pathName = Object.keys(paths)[index];
	$: path = pathName ? paths[pathName] : undefined;
	let newParam: ParameterLocation = 'query';

	const updateDocument = () => {
		$selectedSpec = $selectedSpec;
	};

	const ensurePathParameters = () => {
		if (!path || !pathName) return;
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
			}
		}
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
		const name = prompt(`Enter the ${newParam} parameter name`);
		if (!name?.trim()) return;
		path.parameters ??= [];
		path.parameters.push({
			name: name.trim(),
			in: newParam,
			required: false,
			schema: { type: 'string' }
		});
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

	const toggleOperation = (method: HttpMethods, enabled: boolean) => {
		if (!path) return;
		if (enabled) {
			path[method] ??= {
				summary: '',
				description: '',
				operationId: '',
				parameters: [],
				responses: {
					'200': { description: 'Successful response' }
				}
			};
		} else {
			delete path[method];
		}
		updateDocument();
	};

	const updateOperation = (
		method: HttpMethods,
		field: 'summary' | 'description' | 'operationId',
		value: string
	) => {
		const operation = path?.[method];
		if (!operation) return;
		operation[field] = value;
		updateDocument();
	};

	const setOperationDeprecated = (method: HttpMethods, deprecated: boolean) => {
		const operation = path?.[method];
		if (!operation) return;
		operation.deprecated = deprecated;
		updateDocument();
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
						{#each (path.parameters ?? []).filter(isParameter) as parameter, parameterIndex}
							<div class="space-y-2">
								<ParameterInput
									variableName={parameter.name}
									value={parameter}
									location={parameterLocation(parameter)}
								/>
								{#if parameter.in !== 'path'}
									<button
										type="button"
										class="btn btn-sm variant-ghost-error"
										on:click={() => {
											path.parameters?.splice(parameterIndex, 1);
											updateDocument();
										}}>Remove parameter</button
									>
								{/if}
							</div>
						{/each}
						<div class="flex items-center gap-2">
							<select bind:value={newParam} class="select w-min">
								<option value="query">Query</option>
								<option value="header">Header</option>
								<option value="cookie">Cookie</option>
							</select>
							<button type="button" class="btn variant-filled-primary" on:click={addParameter}>
								Add parameter
							</button>
						</div>
					</div>
				</svelte:fragment>
			</AccordionItem>

			<AccordionItem>
				<svelte:fragment slot="summary"><h2 class="h4">Operations</h2></svelte:fragment>
				<svelte:fragment slot="content">
					<div class="space-y-4">
						<div class="flex flex-wrap gap-4">
							{#each Object.values(HttpMethods) as method}
								<label class="flex items-center gap-2 font-mono uppercase">
									<input
										type="checkbox"
										class="checkbox"
										checked={Boolean(path[method])}
										on:change={(event) => toggleOperation(method, event.currentTarget.checked)}
									/>
									{method}
								</label>
							{/each}
						</div>

						{#each Object.values(HttpMethods) as method}
							{@const operation = path[method]}
							{#if operation}
								<div class="card p-4 space-y-3">
									<h3 class="h4 font-mono uppercase">{method}</h3>
									<div class="grid gap-3 sm:grid-cols-2">
										<label class="space-y-1">
											<span>Summary</span>
											<input
												class="input"
												value={operation.summary}
												on:input={(event) =>
													updateOperation(method, 'summary', event.currentTarget.value)}
											/>
										</label>
										<label class="space-y-1">
											<span>Operation ID</span>
											<input
												class="input"
												value={operation.operationId}
												on:input={(event) =>
													updateOperation(method, 'operationId', event.currentTarget.value)}
											/>
										</label>
									</div>
									<label class="space-y-1">
										<span>Description</span>
										<textarea
											class="textarea"
											value={operation.description}
											on:input={(event) =>
												updateOperation(method, 'description', event.currentTarget.value)}
										/>
									</label>
									<label class="flex items-center gap-2">
										<input
											type="checkbox"
											class="checkbox"
											checked={operation.deprecated}
											on:change={(event) =>
												setOperationDeprecated(method, event.currentTarget.checked)}
										/>
										Deprecated
									</label>
								</div>
							{/if}
						{/each}
					</div>
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
