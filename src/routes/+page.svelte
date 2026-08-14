<script lang="ts">
	import { pathCount, operationCount } from '$lib';
	import CreateNewButton from '$lib/components/FileManagement/CreateNewButton.svelte';
	import DeleteAllButton from '$lib/components/FileManagement/DeleteAllButton.svelte';
	import DeleteButton from '$lib/components/FileManagement/DeleteButton.svelte';
	import LoadButton from '$lib/components/FileManagement/LoadButton.svelte';
	import SaveButton from '$lib/components/FileManagement/SaveButton.svelte';
	import SaveNewButton from '$lib/components/FileManagement/SaveNewButton.svelte';
	import UploadButton from '$lib/components/FileManagement/UploadButton.svelte';
	import { db, loadSpec, selectedSpec, selectedSpecId } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	let apiSpecs = liveQuery(() => db.apiSpecs.toArray());
	let specLoaded = false;
	let pageLoaded = false;

	apiSpecs.subscribe((specs) => {
		if (specLoaded) return;

		if ($selectedSpecId !== $selectedSpec.id) {
			const found = specs.find((spec) => spec.id === $selectedSpecId);

			if (found) {
				loadSpec(found);
				specLoaded = true;
			}
		} else if (!$selectedSpec.id && specs.length > 0) {
			loadSpec(specs[0]);
			specLoaded = true;
		} else {
			specLoaded = true;
		}
	});

	$: stats = [
		{
			title: 'Paths',
			value: pathCount($selectedSpec.spec)
		},
		{
			title: 'Operation IDs',
			value: operationCount($selectedSpec.spec)
		}
	];

	onMount(() => {
		pageLoaded = true;
	});
</script>

<div class="grid place-content-center h-full gap-2 px-1">
	{#if !specLoaded && !pageLoaded}
		<ProgressRadial />
	{:else}
		<div class="card flex flex-col gap-4 p-4">
			<p class="text-lg font-bold">Selected Spec</p>
			<label class="text-lg">
				<span class="font-semibold">Name:</span>
				<input type="text" bind:value={$selectedSpec.name} class="input w-full" />
			</label>
			<div>
				<p><span class="font-semibold text-lg">Id:</span> {$selectedSpec.id || 'Not Saved'}</p>
			</div>
			<div>
				<p class="font-semibold text-lg">Stats:</p>
				{#each stats as stat}
					<p class="">
						{stat.title}: {stat.value}
					</p>
				{/each}
			</div>
			<div class="flex flex-row justify-center gap-2">
				{#if $selectedSpec.id}
					<CreateNewButton />
				{/if}
				<SaveButton />
				{#if $selectedSpec.id}
					<SaveNewButton />
					<DeleteButton spec={$selectedSpec} />
				{/if}
			</div>
		</div>
		{#if $apiSpecs && $apiSpecs.length > 0}
			<table class="table">
				<thead>
					<tr>
						<th class="text-left">Name</th>
						<th class="text-center">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if $apiSpecs}
						{#each $apiSpecs as spec (spec.id)}
							<tr>
								<td class="!align-middle">
									<span class="font-bold">{spec.name}</span>
								</td>
								<td class="flex flex-row justify-center gap-2">
									<LoadButton {spec} />
									<DeleteButton {spec} />
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
			<div class="flex flex-row justify-center w-full gap-4">
				<DeleteAllButton />
				<UploadButton />
			</div>
		{:else}
			<UploadButton />
		{/if}
	{/if}
</div>
