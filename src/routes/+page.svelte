<script lang="ts">
	import { operationCount, pathCount } from '$lib';
	import CreateNewButton from '$lib/components/FileManagement/CreateNewButton.svelte';
	import DeleteAllButton from '$lib/components/FileManagement/DeleteAllButton.svelte';
	import DeleteButton from '$lib/components/FileManagement/DeleteButton.svelte';
	import LoadButton from '$lib/components/FileManagement/LoadButton.svelte';
	import SaveButton from '$lib/components/FileManagement/SaveButton.svelte';
	import SaveNewButton from '$lib/components/FileManagement/SaveNewButton.svelte';
	import UploadButton from '$lib/components/FileManagement/UploadButton.svelte';
	import { db, selectedSpec, type APISpec } from '$lib/db';
	import { diagnosticCounts, validateDocument } from '$lib/validation';
	import { liveQuery } from 'dexie';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const apiSpecs = writable<APISpec[] | undefined>(undefined);
	let loadError = '';

	onMount(() => {
		const subscription = liveQuery(() => db.apiSpecs.toArray()).subscribe({
			next: (specs) => apiSpecs.set(specs),
			error: (error: unknown) => {
				loadError =
					error instanceof Error
						? `Could not load saved specifications: ${error.message}`
						: 'Could not load saved specifications.';
			}
		});
		return () => subscription.unsubscribe();
	});

	$: componentCount = Object.values($selectedSpec.spec.components ?? {}).reduce(
		(total, section) => total + Object.keys(section ?? {}).length,
		0
	);
	$: webhookCount = Object.keys($selectedSpec.spec.webhooks ?? {}).length;
	$: health = diagnosticCounts(validateDocument($selectedSpec.spec));
	$: stats = [
		{ title: 'Paths', value: pathCount($selectedSpec.spec), href: '/paths' },
		{ title: 'Operations', value: operationCount($selectedSpec.spec), href: '/paths' },
		{ title: 'Components', value: componentCount, href: '/components' },
		{ title: 'Webhooks', value: webhookCount, href: '/webhooks' }
	];
</script>

<svelte:head>
	<title>OpenAPI Generator</title>
</svelte:head>

{#if loadError}
	<div class="mx-auto max-w-7xl">
		<div class="card variant-soft-error p-6" role="alert">
			<p class="font-semibold">Saved specifications are unavailable.</p>
			<p class="mt-1 text-sm opacity-80">{loadError}</p>
		</div>
	</div>
{:else if $apiSpecs === undefined}
	<div class="grid min-h-[60vh] place-content-center">
		<ProgressRadial />
	</div>
{:else}
	<div class="mx-auto max-w-7xl space-y-6">
		<header class="flex flex-wrap items-end justify-between gap-4">
			<div>
				<p class="text-sm font-semibold uppercase tracking-wider text-primary-500">OpenAPI 3.1</p>
				<h1 class="h1">Design your API contract</h1>
				<p class="max-w-2xl opacity-70">
					Build, validate, and export production-ready specifications entirely in your browser.
				</p>
			</div>
			<div class="flex flex-wrap gap-2">
				{#if $selectedSpec.id}
					<CreateNewButton />
				{/if}
				<UploadButton width="w-auto" />
				<SaveButton width="w-auto" />
			</div>
		</header>

		<section class="card overflow-hidden">
			<div class="grid gap-6 p-6 lg:grid-cols-[minmax(18rem,1fr)_minmax(24rem,1.5fr)]">
				<div class="space-y-4">
					<div>
						<p class="text-xs font-semibold uppercase tracking-wider opacity-60">
							Current specification
						</p>
						<input
							type="text"
							bind:value={$selectedSpec.name}
							class="input mt-2 text-xl font-bold"
							aria-label="Specification name"
						/>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						<span class="chip variant-soft-surface">
							{$selectedSpec.id ? 'Saved locally' : 'Unsaved draft'}
						</span>
						<a
							href="/review"
							class="chip"
							class:variant-soft-success={health.errors === 0}
							class:variant-soft-error={health.errors > 0}
						>
							{health.errors === 0
								? `${health.warnings} warnings`
								: `${health.errors} errors · ${health.warnings} warnings`}
						</a>
					</div>
					<div class="flex flex-wrap gap-2">
						<a href="/info" class="btn variant-filled-primary">Continue editing</a>
						<a href="/review" class="btn variant-ghost-primary">Review source</a>
						<a href="/preview" class="btn variant-ghost-primary">Preview docs</a>
						{#if $selectedSpec.id}
							<SaveNewButton />
							<DeleteButton spec={$selectedSpec} width="w-auto" />
						{/if}
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					{#each stats as stat}
						<a
							href={stat.href}
							class="rounded-container-token border border-surface-300-600-token p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
						>
							<p class="text-3xl font-bold">{stat.value}</p>
							<p class="text-sm opacity-60">{stat.title}</p>
						</a>
					{/each}
				</div>
			</div>
		</section>

		<section class="grid gap-4 md:grid-cols-3">
			<a href="/info" class="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
				<p class="text-sm font-semibold text-primary-500">01</p>
				<h2 class="h4 mt-2">Describe the API</h2>
				<p class="mt-1 text-sm opacity-70">Set metadata, documentation, tags, and extensions.</p>
			</a>
			<a href="/paths" class="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
				<p class="text-sm font-semibold text-primary-500">02</p>
				<h2 class="h4 mt-2">Design operations</h2>
				<p class="mt-1 text-sm opacity-70">
					Model paths, parameters, request bodies, and responses.
				</p>
			</a>
			<a href="/review" class="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
				<p class="text-sm font-semibold text-primary-500">03</p>
				<h2 class="h4 mt-2">Review and export</h2>
				<p class="mt-1 text-sm opacity-70">Resolve diagnostics and inspect exact JSON or YAML.</p>
			</a>
		</section>

		<section class="card p-5 space-y-4">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div>
					<h2 class="h3">Saved specifications</h2>
					<p class="text-sm opacity-60">Stored locally in this browser.</p>
				</div>
				{#if $apiSpecs && $apiSpecs.length > 0}
					<DeleteAllButton width="w-auto" />
				{/if}
			</div>

			{#if $apiSpecs && $apiSpecs.length > 0}
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>Name</th>
								<th class="text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each $apiSpecs as spec (spec.id)}
								<tr class={spec.id === $selectedSpec.id ? 'bg-primary-500/10' : ''}>
									<td>
										<p class="font-semibold">{spec.name}</p>
										<p class="text-xs opacity-60">{spec.spec.info.title || 'Untitled API'}</p>
									</td>
									<td>
										<div class="flex justify-end gap-2">
											<LoadButton {spec} width="w-auto" />
											<DeleteButton {spec} width="w-auto" />
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="rounded-container-token border border-dashed p-8 text-center">
					<p class="font-semibold">No saved specifications yet</p>
					<p class="text-sm opacity-60">Save this draft or import an existing JSON or YAML file.</p>
				</div>
			{/if}
		</section>
	</div>
{/if}
