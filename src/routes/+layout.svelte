<script lang="ts">
	import FancyAppRail from './FancyAppRail.svelte';
	import { page } from '$app/stores';

	import { AppShell, type ModalComponent } from '@skeletonlabs/skeleton';
	import '../app.postcss';
	// Modal
	import { initializeStores, Modal } from '@skeletonlabs/skeleton';
	import UploadModal from '$lib/components/FileManagement/UploadModal.svelte';
	initializeStores();

	const components: Record<string, ModalComponent> = {
		uploadModal: { ref: UploadModal }
	};
	$: breadcrumbs = $page.url.pathname
		.split('/')
		.filter(Boolean)
		.map((segment, index, segments) => ({
			label: decodeURIComponent(segment).replace(/-/g, ' '),
			href: `/${segments.slice(0, index + 1).join('/')}`
		}));
</script>

<Modal {components} />

<AppShell slotPageContent="px-6 py-4">
	<svelte:fragment slot="sidebarLeft">
		<FancyAppRail />
	</svelte:fragment>
	<div class="space-y-4">
		{#if breadcrumbs.length > 0}
			<nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm capitalize">
				<a class="anchor" href="/">Home</a>
				{#each breadcrumbs as breadcrumb, index}
					<span aria-hidden="true">/</span>
					{#if index === breadcrumbs.length - 1}
						<span aria-current="page">{breadcrumb.label}</span>
					{:else}
						<a class="anchor" href={breadcrumb.href}>{breadcrumb.label}</a>
					{/if}
				{/each}
			</nav>
		{/if}
		<slot />
	</div>
</AppShell>
