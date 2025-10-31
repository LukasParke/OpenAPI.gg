<script lang="ts">
	import Info from '../icons/Info.svelte';
	import LicenseAtom from '../atoms/LicenseAtom.svelte';
	import { selectedSpec } from '$lib/db';
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
	<div class="flex flex-row flex-wrap w-full gap-2">

	
	<div class="border-token grow rounded-container-token bg-surface-backdrop-token space-y-1 p-4">
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
</div>
</form>
