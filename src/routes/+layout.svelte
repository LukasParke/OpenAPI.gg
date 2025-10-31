<script lang="ts">
	import FancyAppRail from './FancyAppRail.svelte';

	import { AppBar, AppShell, type ModalComponent } from '@skeletonlabs/skeleton';
	import '../app.postcss';
	// Floating UI for Popups
	import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	// Modal
	import { initializeStores, Modal } from '@skeletonlabs/skeleton';
	import UploadModal from '$lib/components/FileManagement/UploadModal.svelte';
	import {
		db,
		loadSpec,
		pageLoaded,
		saveSpec,
		selectedSpec,
		selectedSpecId,
		specLoaded
	} from '$lib/db';
	import { pathCount } from '$lib';
	import { onMount } from 'svelte';
	import { liveQuery } from 'dexie';
	import SaveButton from '$lib/components/FileManagement/SaveButton.svelte';
	import DownloadButtons from '$lib/components/FileManagement/DownloadButtons.svelte';
	initializeStores();

	const components: Record<string, ModalComponent> = {
		// Set a unique modal ID, then pass the component reference
		uploadModal: { ref: UploadModal }
		// ...
	};

	const apiSpecs = liveQuery(() => db.apiSpecs.toArray());

	apiSpecs.subscribe((specs) => {
		if ($specLoaded) return;

		if ($selectedSpecId !== $selectedSpec.id) {
			const found = specs.find((spec) => spec.id === $selectedSpecId);

			if (found) {
				loadSpec(found);
				specLoaded.set(true);
			}
		} else if (specs.length > 0) {
			loadSpec(specs[0]);
			specLoaded.set(true);
		}

		console.log('apiSpecs load', $selectedSpecId, $selectedSpec);
	});

	onMount(() => {
		if ($selectedSpec) {
			pageLoaded.set(true);
		}
	});

	//window keydown event listener for ctrl+s for saving
	const saveListener = (e: KeyboardEvent) => {
		if (e.ctrlKey && e.key === 's') {
			e.preventDefault();
			console.log('ctrl+s');
			saveSpec($selectedSpec);
		}
	};
</script>

<Modal {components} />

<svelte:window on:keydown={saveListener} />

<AppShell slotPageContent="md:p-4 p-2">
	<svelte:fragment slot="header">
		<AppBar padding="px-2 py-1 ">
			<svelte:fragment slot="lead">
				<h1 class="h1 md:text-2xl text-lg">
					<span
						class="bg-gradient-to-br from-primary-500 to-tertiary-400 bg-clip-text text-transparent box-decoration-clone"
					>
						OpenAPI.gg
					</span>
				</h1>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<div class="p-1 flex flex-row md:gap-3 gap-1">
					<DownloadButtons />
					<SaveButton />
				</div>
			</svelte:fragment>
			<!-- <svelte:fragment slot="headline">(headline)</svelte:fragment> -->
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<FancyAppRail />
	</svelte:fragment>
	<slot />
</AppShell>
