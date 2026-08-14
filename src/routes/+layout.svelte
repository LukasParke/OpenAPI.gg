<script lang="ts">
	import FancyAppRail from './FancyAppRail.svelte';

	import { AppShell, type ModalComponent } from '@skeletonlabs/skeleton';
	import '../app.postcss';
	// Modal
	import { initializeStores, Modal } from '@skeletonlabs/skeleton';
	import UploadModal from '$lib/components/FileManagement/UploadModal.svelte';
	initializeStores();

	const components: Record<string, ModalComponent> = {
		uploadModal: { ref: UploadModal }
	};
</script>

<Modal {components} />

<AppShell slotPageContent="px-6 py-4">
	<svelte:fragment slot="sidebarLeft">
		<FancyAppRail />
	</svelte:fragment>
	<slot />
</AppShell>
