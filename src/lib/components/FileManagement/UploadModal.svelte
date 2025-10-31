<script lang="ts">
	import { pathCount, operationCount } from '$lib';
	import { newSpec, saveSpec } from '$lib/db';
	import { loadSpec, type APISpec } from '$lib/db';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import { FileDropzone, ProgressRadial } from '@skeletonlabs/skeleton';
	import { onMount, SvelteComponent } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import { parse } from 'yaml';

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	let files: FileList | undefined;
	let uploadSpec: Writable<APISpec> = writable(newSpec());
	let saving = false;
	const extensionRegex = /\.(json|yml|yaml)$/;

	$: stats = [
		{
			title: 'Paths',
			value: pathCount($uploadSpec.spec)
		},
		{
			title: 'Operation IDs',
			value: operationCount($uploadSpec.spec)
		}
	];

	function onFileUpload(e: Event): void {
		console.log('onFileUpload');
		if (!files) return;
		const file = files[0];
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			const isJson = file.name.endsWith('.json');
			let content: OpenAPIV3_1.Document;
			try {
				if (isJson) {
					content = JSON.parse(result);
				} else {
					content = parse(result);
				}
				uploadSpec.set({ name: file.name.replace(extensionRegex, ''), spec: content });
			} catch (error) {
				console.error(`Error parsing ${isJson ? 'json' : 'yaml'} file`, error);
			}
		};
		reader.readAsText(file);
	}
</script>

<div class="flex flex-col gap-4 card p-4">
	<label for="specName">
		<span class="text-md font-bold">API Spec Name</span>

		<input
			class="input"
			id="specName"
			bind:value={$uploadSpec.name}
			type="text"
			placeholder="Enter the name for the API Spec"
		/>
	</label>

	<div class="flex flex-col gap-1 justify-center">
		{#each stats as stat}
			<p class="">
				{stat.title}: {stat.value}
			</p>
		{/each}
	</div>

	<label for="upload" class="block text-sm font-semibold text-token">
		<span>Upload single file OpenAPI Specifications</span>
		<FileDropzone
			bind:files
			label="upload"
			accept=".yml,.yaml,.json"
			on:dragover|once={() => {
				files = undefined;
			}}
			on:change={onFileUpload}
			single
			type="file"
			name="openapispec"
		>
			<svelte:fragment slot="lead">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6 mx-auto text-token"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
					/>
				</svg>
			</svelte:fragment>
			<svelte:fragment slot="message">
				<p class="mb-2 text-sm text-token">
					<span class="font-semibold">Click to upload</span> or drag and drop
				</p>
			</svelte:fragment>
			<svelte:fragment slot="meta">
				<p class="text-token">JSON, YAML</p></svelte:fragment
			>
		</FileDropzone>
	</label>

	<div class="flex flex-row gap-2">
		<button
			class="btn variant-ghost-success w-full"
			on:click={async () => {
				saving = true;
				loadSpec($uploadSpec);
				await saveSpec($uploadSpec);
				parent.onClose();
			}}
		>
			Save
		</button>
		<button class="btn variant-ghost-warning w-full" on:click={parent.onClose}
			>{parent.buttonTextCancel}</button
		>
	</div>
	<div class="size-6">
		{#if saving}
			<ProgressRadial width="size-6" />
		{/if}
	</div>
</div>
