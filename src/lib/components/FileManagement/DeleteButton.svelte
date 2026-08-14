<script lang="ts">
	import { db, loadSpec, newSpec, type APISpec } from '$lib/db';
	import { getModalStore, type CssClasses } from '@skeletonlabs/skeleton';

	export let spec: APISpec;
	export let width: CssClasses = 'w-full';

	const modalStore = getModalStore();
	const deleteSpec = () => {
		modalStore.trigger({
			type: 'confirm',
			title: `Delete "${spec.name}"?`,
			body: 'This permanently removes the locally saved specification.',
			response: async (confirmed: boolean) => {
				if (!confirmed || !spec.id) return;
				await db.apiSpecs.delete(spec.id);
				const specs = await db.apiSpecs.toArray();
				loadSpec(specs[0] ?? structuredClone(newSpec));
			}
		});
	};
</script>

<button type="button" class="btn variant-ghost-error {width}" on:click={deleteSpec}>
	Delete
</button>
