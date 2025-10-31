<script lang="ts">
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { CssClasses } from '@skeletonlabs/skeleton';

export let width: CssClasses = "w-full"

	const modalStore = getModalStore();

	const modal: ModalSettings = {
		type: 'component',
		component: 'uploadModal'
	};
</script>

<button class="btn variant-ghost-tertiary {width}" on:click={() => modalStore.trigger(modal)}>Upload</button>
