<script lang="ts">
	import { addPath, deletePath, renamePath } from '$lib';
	import { getModalStore } from '@skeletonlabs/skeleton';
	const modalStore = getModalStore();

	/** The actual pathname */
	export let pathName: string;
	/** The index of the pathname in the paths object */
	export let id: number;
</script>

<div class="flex justify-between">
	<h3 class="">{pathName}</h3>
	<div class="flex gap-2">
		<a href="/paths/{id}" class="btn btn-sm variant-filled-primary">Edit</a>
		<button
			type="button"
			class="btn btn-sm variant-filled-warning"
			on:click={() => {
				renamePath(modalStore, pathName);
			}}
		>
			Change path
		</button>
		<button
			type="button"
			class="btn btn-sm variant-filled-secondary"
			on:click={() => {
				addPath(modalStore, pathName);
			}}
		>
			Add Sub-Route
		</button>
		<button
			type="button"
			class="btn btn-sm variant-ringed-error hover:variant-filled-error"
			on:click={() => {
				deletePath(modalStore, pathName);
			}}
		>
			Remove
		</button>
	</div>
</div>
<hr />
