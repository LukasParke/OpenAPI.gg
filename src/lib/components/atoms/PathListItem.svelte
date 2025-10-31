<script lang="ts">
	import { addPath, deletePath, renamePath } from '$lib';
	import { getModalStore } from '@skeletonlabs/skeleton';
	const modalStore = getModalStore();

	/** The actual pathname */
	export let pathName: string;
	/** The index of the pathname in the paths object */
	export let id: number;
</script>

<div class="flex flex-wrap justify-between gap-1">
	<h3 class="truncate font-mono"><span class="md:hidden">Path: </span>{pathName}</h3>
	<div class="flex md:gap-2 flex-wrap gap-1">
		<a href="/paths/{pathName}" class="btn btn-sm variant-filled-primary grow md:w-fit w-full">Edit</a>
		<div class="grow flex flex-row gap-1">
			<button
				type="button"
				class="btn btn-sm variant-filled-warning grow"
				on:click={() => {
					renamePath(modalStore, pathName);
				}}
			>
				Change path
			</button>
			<button
				type="button"
				class="btn btn-sm variant-filled-secondary grow"
				on:click={() => {
					addPath(modalStore, pathName);
				}}
			>
				Add Sub-Route
			</button>
		</div>
		<button
			type="button"
			class="btn btn-sm variant-ringed-error hover:variant-filled-error grow"
			on:click={() => {
				deletePath(modalStore, pathName);
			}}
		>
			Remove
		</button>
	</div>
</div>
<hr />
