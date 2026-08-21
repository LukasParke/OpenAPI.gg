<script lang="ts">
	import { selectedSpec } from '$lib/db';
	import { onMount } from 'svelte';
	import '@scalar/api-reference/style.css';

	let container: HTMLDivElement;
	let loading = true;
	let loadError = '';

	onMount(() => {
		let destroyed = false;
		let destroyReference: (() => void) | undefined;
		let updateReference: ((content: string) => void) | undefined;

		const unsubscribe = selectedSpec.subscribe((spec) => {
			updateReference?.(JSON.stringify(spec.spec));
		});

		import('@scalar/api-reference')
			.then(({ createApiReference }) => {
				if (destroyed) return;
				const reference = createApiReference(container, {
					content: JSON.stringify($selectedSpec.spec),
					layout: 'modern',
					theme: 'default',
					hideModels: false,
					hideClientButton: false,
					persistAuth: true,
					showDeveloperTools: 'localhost'
				});
				destroyReference = reference.destroy;
				updateReference = (content) => reference.updateConfiguration({ content });
				loading = false;
			})
			.catch((error: unknown) => {
				loadError = error instanceof Error ? error.message : 'Unable to load the API reference.';
				loading = false;
			});

		return () => {
			destroyed = true;
			unsubscribe();
			destroyReference?.();
		};
	});
</script>

<svelte:head>
	<title>API Preview · OpenAPI Generator</title>
</svelte:head>

<div class="-mx-6 -mb-4">
	<div
		class="flex flex-wrap items-center justify-between gap-3 border-y border-surface-300-600-token p-4"
	>
		<div>
			<h1 class="h3">Interactive API documentation</h1>
			<p class="text-sm opacity-70">
				Live preview powered by Scalar. Changes appear automatically.
			</p>
		</div>
		<div class="flex gap-2">
			<a href="/review" class="btn btn-sm variant-ghost-primary">Review source</a>
			<a href="/paths" class="btn btn-sm variant-filled-primary">Edit operations</a>
		</div>
	</div>

	{#if loading}
		<div class="grid min-h-[70vh] place-content-center text-center">
			<p class="font-semibold">Loading interactive documentation…</p>
		</div>
	{:else if loadError}
		<div class="grid min-h-[70vh] place-content-center p-6 text-center">
			<p class="font-semibold text-error-500">Could not render the API reference</p>
			<p class="mt-1 max-w-xl text-sm opacity-70">{loadError}</p>
		</div>
	{/if}

	<div bind:this={container} class:hidden={loading || Boolean(loadError)} />
</div>
