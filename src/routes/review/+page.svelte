<script lang="ts">
	import { selectedSpec } from '$lib/db';
	import { diagnosticCounts, validateDocument, type DiagnosticSeverity } from '$lib/validation';
	import { stringify } from 'yaml';

	let format: 'json' | 'yaml' = 'yaml';
	let severity: DiagnosticSeverity | 'all' = 'all';
	let copied = false;
	const severityFilters: (DiagnosticSeverity | 'all')[] = ['all', 'error', 'warning'];

	$: diagnostics = validateDocument($selectedSpec.spec);
	$: counts = diagnosticCounts(diagnostics);
	$: visibleDiagnostics =
		severity === 'all'
			? diagnostics
			: diagnostics.filter((diagnostic) => diagnostic.severity === severity);
	$: source =
		format === 'json'
			? JSON.stringify($selectedSpec.spec, null, 2)
			: stringify($selectedSpec.spec, { indent: 2, aliasDuplicateObjects: false });

	const copySource = async () => {
		await navigator.clipboard.writeText(source);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	};

	const diagnosticHref = (path: string) => {
		if (path.startsWith('info.')) return '/info';
		if (path.startsWith('security.')) return '/authentication';
		if (path.startsWith('components.')) return '/components';
		if (path.startsWith('paths.')) return '/paths';
		return '/';
	};
</script>

<svelte:head>
	<title>Review · OpenAPI Generator</title>
</svelte:head>

<div class="mx-auto max-w-7xl space-y-6">
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="h2">Review specification</h1>
			<p class="opacity-70">Inspect document health and the exact source that will be exported.</p>
		</div>
		<div class="flex gap-2">
			<span class="chip variant-soft-error">{counts.errors} errors</span>
			<span class="chip variant-soft-warning">{counts.warnings} warnings</span>
			<a href="/preview" class="btn btn-sm variant-filled-primary">Preview docs</a>
		</div>
	</header>

	<div class="grid gap-6 xl:grid-cols-[minmax(20rem,0.8fr)_minmax(28rem,1.2fr)]">
		<section class="card p-4 space-y-4">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<h2 class="h3">Diagnostics</h2>
				<div class="flex gap-1">
					{#each severityFilters as filter}
						<button
							type="button"
							class="btn btn-sm"
							class:variant-filled-primary={severity === filter}
							class:variant-ghost-primary={severity !== filter}
							on:click={() => (severity = filter)}
						>
							{filter}
						</button>
					{/each}
				</div>
			</div>

			{#if visibleDiagnostics.length === 0}
				<div class="rounded-container-token variant-soft-success p-4 text-center">
					<p class="font-semibold">No {severity === 'all' ? '' : severity} issues found</p>
					<p class="text-sm opacity-70">This document passes all built-in health checks.</p>
				</div>
			{:else}
				<div class="space-y-2">
					{#each visibleDiagnostics as diagnostic}
						<a
							href={diagnosticHref(diagnostic.path)}
							class="block rounded-container-token border p-3 hover:variant-soft-surface"
							class:border-error-500={diagnostic.severity === 'error'}
							class:border-warning-500={diagnostic.severity === 'warning'}
						>
							<div class="flex items-center justify-between gap-2">
								<strong class="capitalize">{diagnostic.severity}</strong>
								<code class="text-xs">{diagnostic.path}</code>
							</div>
							<p class="mt-1 text-sm">{diagnostic.message}</p>
						</a>
					{/each}
				</div>
			{/if}
		</section>

		<section class="card min-w-0 p-4 space-y-3">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div class="flex gap-1">
					<button
						type="button"
						class="btn btn-sm"
						class:variant-filled-primary={format === 'yaml'}
						class:variant-ghost-primary={format !== 'yaml'}
						on:click={() => (format = 'yaml')}>YAML</button
					>
					<button
						type="button"
						class="btn btn-sm"
						class:variant-filled-primary={format === 'json'}
						class:variant-ghost-primary={format !== 'json'}
						on:click={() => (format = 'json')}>JSON</button
					>
				</div>
				<button type="button" class="btn btn-sm variant-ghost-primary" on:click={copySource}>
					{copied ? 'Copied' : 'Copy source'}
				</button>
			</div>
			<pre
				class="max-h-[70vh] overflow-auto rounded-container-token bg-surface-900 p-4 text-sm text-surface-50"><code
					>{source}</code
				></pre>
		</section>
	</div>
</div>
