<script lang="ts">
	import PathOperationsEditor from '$lib/components/PathOperationsEditor.svelte';
	import { selectedSpec } from '$lib/db';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';

	let webhookName = '';
	$selectedSpec.spec.webhooks ??= {};

	$: webhooks = $selectedSpec.spec.webhooks ?? {};

	const addWebhook = () => {
		const name = webhookName.trim();
		if (!name || webhooks[name]) return;
		webhooks[name] = {
			summary: '',
			description: ''
		};
		webhookName = '';
		$selectedSpec = $selectedSpec;
	};

	const removeWebhook = (name: string) => {
		delete webhooks[name];
		$selectedSpec = $selectedSpec;
	};

	const isPathItem = (
		value: OpenAPIV3_1.PathItemObject | OpenAPIV3_1.ReferenceObject
	): value is OpenAPIV3_1.PathItemObject => !('$ref' in value);
</script>

<div class="mx-auto max-w-6xl space-y-4">
	<div>
		<h1 class="h2">Webhooks</h1>
		<p class="opacity-70">
			Define incoming, out-of-band requests using the same operation editor as API paths.
		</p>
	</div>

	{#each Object.entries(webhooks) as [name, webhook]}
		<div class="card p-4 space-y-4">
			<div class="flex justify-between items-center">
				<h2 class="h4">{name}</h2>
				<button
					type="button"
					class="btn btn-sm variant-ghost-error"
					on:click={() => removeWebhook(name)}>Remove webhook</button
				>
			</div>
			{#if isPathItem(webhook)}
				<div class="grid gap-3 sm:grid-cols-2">
					<label class="space-y-1">
						<span>Summary</span>
						<input class="input" bind:value={webhook.summary} />
					</label>
					<label class="space-y-1">
						<span>Description</span>
						<input class="input" bind:value={webhook.description} />
					</label>
				</div>
				<PathOperationsEditor
					path={webhook}
					components={$selectedSpec.spec.components ?? {}}
					onChange={() => ($selectedSpec = $selectedSpec)}
				/>
			{:else}
				<label class="space-y-1">
					<span>Reference</span>
					<input class="input" bind:value={webhook.$ref} />
				</label>
			{/if}
		</div>
	{/each}

	<div class="card p-4 flex gap-2">
		<input
			class="input"
			bind:value={webhookName}
			placeholder="Webhook name"
			on:keydown={(event) => {
				if (event.key === 'Enter') addWebhook();
			}}
		/>
		<button type="button" class="btn variant-filled-primary" on:click={addWebhook}>
			Add webhook
		</button>
	</div>
</div>
