<script lang="ts">
	import { page } from '$app/stores';
	import ParameterInput from '$lib/components/atoms/ParameterInput.svelte';
	import { selectedSpec } from '$lib/db';
	import { Accordion, AccordionItem, InputChip } from '@skeletonlabs/skeleton';

	$: console.log({ pathName: $page.params.pathName, method: $page.params.method, op: $selectedSpec.spec.paths[$page.params.pathName] });

	let newParam = 'query';
</script>

{#if $selectedSpec.spec.paths != undefined && $page.params.pathName != undefined && $selectedSpec.spec.paths[$page.params.pathName] != undefined}
	<div
		class="border-token border-surface-500 space-y-4 px-6 py-4 rounded-container-token variant-glass-surface"
	>
		<div class="font-mono">
			<p>
				Path: {$page.params.pathName}
			</p>
			<p>
				Method: {$page.params.method.toUpperCase()}
			</p>
		</div>
		<hr />

		<label for="tags" class="label flex flex-col">
			<span>Tags</span>
			{#if $selectedSpec.spec.paths[$page.params.pathName][$page.params.method].tags !== undefined}
				<InputChip
					id="tags"
					class="h-[92px] w-[214px] overflow-auto"
					bind:value={$selectedSpec.spec.paths[$page.params.pathName][$page.params.method].tags}
					name="tags"
					placeholder="Enter the operations tags..."
				/>
			{:else}
				<button
					class="btn bnt-sm variant-ghost-primary w-fit"
					on:click={() =>
						($selectedSpec.spec.paths[$page.params.pathName][$page.params.method].tags = [])}
				>
					Add Tags
				</button>
			{/if}
		</label>

		<label class="label flex flex-col">
			<span>Operation ID</span>
			{#if $selectedSpec.spec.paths[$page.params.pathName][$page.params.method].operationId !== undefined}
				<input
					type="text"
					class="input px-3 py-1"
					placeholder={`getThing`}
					bind:value={$selectedSpec.spec.paths[$page.params.pathName][$page.params.method]
						.operationId}
				/>
			{:else}
				<button
					class="btn bnt-sm variant-ghost-primary w-fit"
					on:click={() =>
						($selectedSpec.spec.paths[$page.params.pathName][$page.params.method].operationId = '')}
				>
					Add Operation ID
				</button>
			{/if}
		</label>

		<label class="label flex flex-col">
			<span>Summary</span>
			{#if $selectedSpec.spec.paths[$page.params.pathName][$page.params.method].summary !== undefined}
				<input
					type="text"
					class="input px-3 py-1"
					placeholder={`Get a thing`}
					bind:value={$selectedSpec.spec.paths[$page.params.pathName][$page.params.method].summary}
				/>
			{:else}
				<button
					class="btn bnt-sm variant-ghost-primary w-fit"
					on:click={() =>
						($selectedSpec.spec.paths[$page.params.pathName][$page.params.method].summary = '')}
				>
					Add Summary
				</button>
			{/if}
		</label>

		<label class="label flex flex-col">
			<span>Description</span>
			{#if $selectedSpec.spec.paths[$page.params.pathName][$page.params.method].description !== undefined}
				<textarea
					class="textarea px-2 py-1 h-[92px]"
					placeholder="This endpoint gets a thing"
					bind:value={$selectedSpec.spec.paths[$page.params.pathName][$page.params.method]
						.description}
				/>
			{:else}
				<button
					class="btn bnt-sm variant-ghost-primary w-fit"
					on:click={() =>
						($selectedSpec.spec.paths[$page.params.pathName][$page.params.method].description = '')}
				>
					Add Description
				</button>
			{/if}
		</label>

		<Accordion>
			<AccordionItem>
				<svelte:fragment slot="summary">
					<h4 class="h4">Parameters</h4>
				</svelte:fragment>
				<svelte:fragment slot="content">
					<label class="label flex flex-col">
						<span>Parameters</span>
						{#if $selectedSpec.spec.paths[$page.params.pathName][$page.params.method].parameters !== undefined}
							{#each $selectedSpec.spec.paths[$page.params.pathName][$page.params.method].parameters as param, i}
								<ParameterInput variableName={param.name} bind:value={param} />
							{/each}
						{:else}
							<button
								class="btn bnt-sm variant-ghost-primary w-fit"
								on:click={() =>
									($selectedSpec.spec.paths[$page.params.pathName][$page.params.method].parameters =
										[])}
							>
								Add Parameters
							</button>
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
					</label></svelte:fragment
				>
			</AccordionItem>
		</Accordion>
	</div>
{/if}
