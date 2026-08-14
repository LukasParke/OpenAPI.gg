<script lang="ts">
	import LicenseAtom from '../atoms/LicenseAtom.svelte';
	import { selectedSpec } from '$lib/db';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';

	$selectedSpec.spec.externalDocs ??= { url: '' };
	let tagName = '';
	let extensionSource = JSON.stringify(
		Object.fromEntries(Object.entries($selectedSpec.spec).filter(([key]) => key.startsWith('x-'))),
		null,
		2
	);
	let extensionError = '';

	const addTag = () => {
		const name = tagName.trim();
		if (!name || $selectedSpec.spec.tags?.some((tag: OpenAPIV3_1.TagObject) => tag.name === name))
			return;
		$selectedSpec.spec.tags ??= [];
		$selectedSpec.spec.tags.push({ name, description: '' });
		tagName = '';
		$selectedSpec = $selectedSpec;
	};

	const applyExtensions = () => {
		try {
			const extensions = JSON.parse(extensionSource);
			if (!extensions || Array.isArray(extensions) || typeof extensions !== 'object') {
				throw new Error('Extensions must be a JSON object.');
			}
			for (const key of Object.keys($selectedSpec.spec)) {
				if (key.startsWith('x-')) delete $selectedSpec.spec[key];
			}
			for (const [key, value] of Object.entries(extensions)) {
				if (!key.startsWith('x-')) throw new Error(`"${key}" must start with "x-".`);
				$selectedSpec.spec[key] = value;
			}
			extensionError = '';
			$selectedSpec = $selectedSpec;
		} catch (error) {
			extensionError = error instanceof Error ? error.message : 'Invalid extension JSON.';
		}
	};
</script>

<form class="space-y-2">
	<div class="border-token rounded-container-token bg-surface-backdrop-token space-y-1 p-4">
		<label class="space-y-1">
			<span class="text-sm">Title (required)</span>
			<input
				class="input text-sm"
				name="title"
				placeholder="Sample API"
				type="text"
				bind:value={$selectedSpec.spec.info.title}
				required
			/>
		</label>
		<label class="space-y-1">
			<span class="text-sm"> Description (optional) </span>
			<textarea
				class="textarea"
				name="description"
				placeholder="Optional multiline or single-line description. Supports Markdown."
				bind:value={$selectedSpec.spec.info.description}
			/>
		</label>
		<label class="space-y-1">
			<span class="text-sm">Version (required)</span>
			<input
				class="input text-sm"
				name="version"
				placeholder="0.1.0"
				type="text"
				bind:value={$selectedSpec.spec.info.version}
				required
			/>
		</label>
		<label class="space-y-1">
			<span class="text-sm">Terms of Service (optional)</span>
			<input
				class="input text-sm"
				name="termsOfService"
				placeholder="https://example.com/terms"
				type="url"
				bind:value={$selectedSpec.spec.info.termsOfService}
			/>
		</label>
	</div>
	<div class="border-token rounded-container-token bg-surface-backdrop-token space-y-1 p-4">
		<h4 class="h4">Contact Information</h4>
		{#if $selectedSpec.spec.info.contact}
			<label class="space-y-1">
				<span class="text-sm">Name (optional)</span>
				<input
					class="input text-sm"
					name="contactName"
					placeholder="John Doe"
					type="text"
					bind:value={$selectedSpec.spec.info.contact.name}
				/>
			</label>
			<label class="space-y-1">
				<span class="text-sm">Email (optional)</span>
				<input
					class="input text-sm"
					name="contactEmail"
					placeholder="email@example.com"
					type="email"
					bind:value={$selectedSpec.spec.info.contact.email}
				/>
			</label>
			<label class="space-y-1">
				<span class="text-sm">URL (optional)</span>
				<input
					class="input text-sm"
					name="contactUrl"
					placeholder="https://example.com"
					type="url"
					bind:value={$selectedSpec.spec.info.contact.url}
				/>
			</label>
		{:else}
			<button
				type="button"
				class="btn variant-filled-primary"
				on:click={() => {
					$selectedSpec.spec.info.contact = {
						name: '',
						email: '',
						url: ''
					};
				}}
			>
				Add Contact
			</button>
		{/if}
	</div>

	<LicenseAtom />

	<div class="border-token rounded-container-token bg-surface-backdrop-token space-y-3 p-4">
		<h4 class="h4">External documentation</h4>
		<label class="space-y-1">
			<span class="text-sm">URL</span>
			<input
				class="input"
				type="url"
				bind:value={$selectedSpec.spec.externalDocs.url}
				placeholder="https://docs.example.com"
			/>
		</label>
		<label class="space-y-1">
			<span class="text-sm">Description</span>
			<input class="input" bind:value={$selectedSpec.spec.externalDocs.description} />
		</label>
	</div>

	<div class="border-token rounded-container-token bg-surface-backdrop-token space-y-3 p-4">
		<h4 class="h4">Tags</h4>
		{#each $selectedSpec.spec.tags ?? [] as tag, index}
			<div class="card grid gap-2 p-3 sm:grid-cols-[1fr_2fr_auto]">
				<input class="input" bind:value={tag.name} placeholder="Tag name" />
				<input class="input" bind:value={tag.description} placeholder="Description" />
				<button
					type="button"
					class="btn btn-sm variant-ghost-error"
					on:click={() => {
						$selectedSpec.spec.tags?.splice(index, 1);
						$selectedSpec = $selectedSpec;
					}}>Remove</button
				>
			</div>
		{/each}
		<div class="flex gap-2">
			<input class="input" bind:value={tagName} placeholder="New tag name" />
			<button type="button" class="btn variant-filled-primary" on:click={addTag}>Add tag</button>
		</div>
	</div>

	<div class="border-token rounded-container-token bg-surface-backdrop-token space-y-3 p-4">
		<h4 class="h4">Specification extensions</h4>
		<p class="text-sm opacity-70">Extension keys must start with <code>x-</code>.</p>
		<textarea class="textarea min-h-40 font-mono" bind:value={extensionSource} />
		{#if extensionError}
			<p class="text-error-500 text-sm" role="alert">{extensionError}</p>
		{/if}
		<button type="button" class="btn variant-filled-primary" on:click={applyExtensions}>
			Apply extensions
		</button>
	</div>
</form>
