<script lang="ts">
	import FancyAppRail from './FancyAppRail.svelte';
	import { page } from '$app/stores';

	import { AppShell, type ModalComponent } from '@skeletonlabs/skeleton';
	import '../app.postcss';
	// Modal
	import { initializeStores, Modal } from '@skeletonlabs/skeleton';
	import UploadModal from '$lib/components/FileManagement/UploadModal.svelte';
	import QuickSwitcher from '$lib/components/QuickSwitcher.svelte';
	import { selectedSpec } from '$lib/db';
	import {
		canRedo,
		canUndo,
		notifyDocumentChanged,
		redoDocument,
		recoverDraft,
		saveDocumentNow,
		saveStatus,
		syncEditorSession,
		undoDocument
	} from '$lib/editorSession';
	import { diagnosticCounts, validateDocument } from '$lib/validation';
	import { onMount } from 'svelte';
	initializeStores();

	let quickSwitcherOpen = false;
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
	$: syncEditorSession($selectedSpec);
	$: health = diagnosticCounts(validateDocument($selectedSpec.spec));

	onMount(() => {
		recoverDraft();
		const onKeydown = (event: KeyboardEvent) => {
			const modifier = event.metaKey || event.ctrlKey;
			if (modifier && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				quickSwitcherOpen = true;
			}
			if (modifier && event.key.toLowerCase() === 's') {
				event.preventDefault();
				saveDocumentNow();
			}
			if (modifier && event.key.toLowerCase() === 'z') {
				event.preventDefault();
				if (event.shiftKey) redoDocument();
				else undoDocument();
			}
		};
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});
</script>

<Modal {components} />
<QuickSwitcher bind:open={quickSwitcherOpen} />

<AppShell slotPageContent="px-6 py-4">
	<svelte:fragment slot="sidebarLeft">
		<FancyAppRail />
	</svelte:fragment>
	<div class="space-y-4" on:input={notifyDocumentChanged} on:change={notifyDocumentChanged}>
		<div class="flex flex-wrap items-center justify-between gap-2">
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
			<div class="ml-auto flex items-center gap-1">
				<button
					type="button"
					class="btn btn-sm variant-ghost-surface"
					disabled={!$canUndo}
					on:click={undoDocument}
					aria-label="Undo"
				>
					Undo
				</button>
				<button
					type="button"
					class="btn btn-sm variant-ghost-surface"
					disabled={!$canRedo}
					on:click={redoDocument}
					aria-label="Redo"
				>
					Redo
				</button>
				<button
					type="button"
					class="btn btn-sm variant-ghost-primary"
					on:click={() => (quickSwitcherOpen = true)}
				>
					Search <kbd class="ml-1 opacity-60">⌘K</kbd>
				</button>
				<a
					href="/review"
					class="btn btn-sm"
					class:variant-soft-success={health.errors === 0}
					class:variant-soft-error={health.errors > 0}
				>
					{health.errors === 0 ? 'Healthy' : `${health.errors} errors`}
				</a>
				<span class="min-w-16 text-right text-xs capitalize opacity-60">{$saveStatus}</span>
			</div>
		</div>
		<slot />
	</div>
</AppShell>
