<script lang="ts">
	import { goto } from '$app/navigation';
	import { selectedSpec } from '$lib/db';
	import { tick } from 'svelte';

	export let open = false;

	interface SwitcherItem {
		label: string;
		detail: string;
		href: string;
	}

	let query = '';
	let input: HTMLInputElement;
	let lastFocused: HTMLElement | null = null;

	const sections: SwitcherItem[] = [
		{ label: 'Dashboard', detail: 'Section', href: '/' },
		{ label: 'Information', detail: 'Section', href: '/info' },
		{ label: 'Servers', detail: 'Section', href: '/servers' },
		{ label: 'Security', detail: 'Section', href: '/authentication' },
		{ label: 'Paths', detail: 'Section', href: '/paths' },
		{ label: 'Webhooks', detail: 'Section', href: '/webhooks' },
		{ label: 'Components', detail: 'Section', href: '/components' },
		{ label: 'Review', detail: 'Section', href: '/review' },
		{ label: 'API Preview', detail: 'Interactive documentation', href: '/preview' }
	];

	$: pathItems = Object.keys($selectedSpec.spec.paths ?? {}).map((path, index) => ({
		label: path,
		detail: 'API path',
		href: `/paths/${index}`
	}));
	$: componentItems = Object.entries($selectedSpec.spec.components ?? {}).flatMap(
		([section, values]) =>
			Object.keys(values ?? {}).map((name) => ({
				label: name,
				detail: `Component · ${section}`,
				href: '/components'
			}))
	);
	$: items = [...sections, ...pathItems, ...componentItems];
	$: normalizedQuery = query.trim().toLowerCase();
	$: filteredItems = normalizedQuery
		? items
				.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(normalizedQuery))
				.slice(0, 12)
		: items.slice(0, 12);

	$: if (open) {
		lastFocused =
			typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
		tick().then(() => input?.focus());
	} else {
		lastFocused?.focus();
	}

	const select = async (item: SwitcherItem) => {
		open = false;
		query = '';
		await goto(item.href);
	};
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex justify-center bg-surface-900/60 p-4 pt-[12vh] backdrop-blur-sm"
		role="presentation"
		on:click={(event) => {
			if (event.currentTarget === event.target) open = false;
		}}
		on:keydown={(event) => {
			if (event.key === 'Escape') open = false;
		}}
	>
		<div
			class="card h-fit w-full max-w-2xl overflow-hidden shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-label="Quick switcher"
		>
			<div class="border-b border-surface-300-600-token p-3">
				<input
					bind:this={input}
					bind:value={query}
					class="input border-0 text-lg focus:ring-0"
					placeholder="Search sections, paths, and components…"
					on:keydown={(event) => {
						if (event.key === 'Enter' && filteredItems[0]) select(filteredItems[0]);
						if (event.key === 'Escape') open = false;
					}}
				/>
			</div>
			<div class="max-h-[55vh] overflow-auto p-2">
				{#if filteredItems.length === 0}
					<p class="p-6 text-center opacity-70">No matching destination</p>
				{:else}
					{#each filteredItems as item, index}
						<button
							type="button"
							class="flex w-full items-center justify-between rounded-container-token p-3 text-left hover:variant-soft-primary"
							class:variant-soft-primary={index === 0}
							on:click={() => select(item)}
						>
							<span class="font-semibold">{item.label}</span>
							<span class="text-xs opacity-60">{item.detail}</span>
						</button>
					{/each}
				{/if}
			</div>
			<div
				class="flex justify-between border-t border-surface-300-600-token p-2 text-xs opacity-60"
			>
				<span>Enter to open</span>
				<span>Esc to close</span>
			</div>
		</div>
	</div>
{/if}
