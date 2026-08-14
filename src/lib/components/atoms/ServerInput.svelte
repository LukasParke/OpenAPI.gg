<script lang="ts">
	import { Accordion, AccordionItem, InputChip } from '@skeletonlabs/skeleton';
	import Info from '../icons/Info.svelte';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import { pathVariables } from '$lib';

	export let id: number;
	export let server: OpenAPIV3_1.ServerObject;
	let errorMessage = '';

	const addVariables = () => {
		if (!server.url) return;

		const matches = server.url.match(pathVariables);

		if (!matches) {
			server.variables = undefined;
			errorMessage = '';
			return;
		}

		// If there are variables in the URL, create an object to store them
		if (!server.variables) server.variables = {};

		// check if matches contains duplicates
		const uniqueMatches = [...new Set(matches)];
		if (uniqueMatches.length !== matches.length) {
			errorMessage = 'Server URL variables must be unique.';
			return;
		}
		errorMessage = '';

		// we now know that the matches are unique
		// so we can create the variables object
		server.variables = uniqueMatches.reduce((acc, match) => {
			// @ts-expect-error - we want to dynamically create the object keys
			acc[match.replace('{', '').replace('}', '')] = {
				default: '',
				description: '',
				enum: []
			};
			return acc;
		}, {});
	};
</script>

<div class="space-y-4">
	<label class="space-y-2">
		<span>URL (required)</span>
		<input
			class="input"
			name="url{id}"
			placeholder="https://&lbrace;id&rbrace;.api.example.com/v1"
			type="url"
			bind:value={server.url}
			on:input={addVariables}
		/>
		{#if errorMessage}
			<span class="text-error-500 text-sm" role="alert">{errorMessage}</span>
		{/if}
	</label>

	<label class="space-y-2">
		<span class="flex flex-row gap-2">
			Description
			<div class="my-auto">
				<Info />
			</div>
		</span>
		<textarea
			class="textarea text-sm"
			name="description {id}"
			placeholder="Optional multiline or single-line description. Supports Markdown."
			bind:value={server.description}
		/>
	</label>
	<div class="border-token rounded-container-token space-y-4">
		{#if server.variables}
			<Accordion>
				<AccordionItem>
					<svelte:fragment slot="summary">
						<div>
							<h4 class="h4">Variables</h4>
							<p class="text-sm">
								Define variables by adding them to the server URL using curly-braces like so: <code>
									&lbrace;id&rbrace;
								</code>.
							</p>
						</div>
					</svelte:fragment>
					<svelte:fragment slot="content">
						<table class="table my-2">
							<tbody>
								{#each Object.keys(server.variables) as variable}
									<tr>
										<td class="text-center">
											<div class="flex justify-center items-center">
												<p class="text-lg">{variable}</p>
											</div>
										</td>
										<td>
											<label>
												<span>Default</span>
												<input
													class="input"
													placeholder="default"
													type="text"
													bind:value={server.variables[variable].default}
												/>
											</label>
										</td>
										<td>
											<label>
												<span>Description</span>
												<textarea
													class="textarea"
													placeholder="description"
													bind:value={server.variables[variable].description}
												/>
											</label>
										</td>
										<td class="!w-1/3">
											<div>
												<label for="Enum">
													<span>Enum</span>
													<InputChip
														label="Enum"
														bind:value={server.variables[variable].enum}
														name="enum"
														placeholder="enum (optional) - press enter to add more items"
													/>
												</label>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</svelte:fragment>
				</AccordionItem>
			</Accordion>
		{/if}
	</div>
</div>
