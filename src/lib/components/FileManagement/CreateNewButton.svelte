<script lang="ts">
	import { createNewSpec, loadSpec } from '$lib/db';
	import { getModalStore } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();
	const createSpec = () => {
		modalStore.trigger({
			type: 'confirm',
			title: 'Create a new specification?',
			body: 'Unsaved changes in the current specification will be lost.',
			response: (confirmed: boolean) => {
				if (confirmed) loadSpec(createNewSpec());
			}
		});
	};
</script>

<button type="button" class="btn variant-ghost-success" on:click={createSpec}> Create New </button>
