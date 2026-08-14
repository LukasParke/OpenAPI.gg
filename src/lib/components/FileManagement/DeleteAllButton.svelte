<script lang="ts">
	import { db, loadSpec, newSpec } from '$lib/db';
	import { getModalStore, type CssClasses } from '@skeletonlabs/skeleton';

	export let width: CssClasses = 'w-full';
	const modalStore = getModalStore();

	const deleteAll = () => {
		modalStore.trigger({
			type: 'confirm',
			title: 'Delete all saved specifications?',
			body: 'This permanently removes every locally saved specification.',
			response: async (confirmed: boolean) => {
				if (!confirmed) return;
				await db.apiSpecs.clear();
				loadSpec(structuredClone(newSpec));
			}
		});
	};
</script>

<button type="button" class="btn variant-ghost-error {width}" on:click={deleteAll}>
	Delete All
</button>
