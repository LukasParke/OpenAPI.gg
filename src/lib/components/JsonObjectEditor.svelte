<script lang="ts">
	export let title: string;
	export let description: string;
	export let value: unknown;
	export let onApply: (value: Record<string, unknown>) => void = () => {};

	let source = '';
	let previousValue = '';
	let errorMessage = '';

	$: serialized = JSON.stringify(value ?? {}, null, 2);
	$: if (serialized !== previousValue) {
		source = serialized;
		previousValue = serialized;
	}

	const applyChanges = () => {
		try {
			const parsed = JSON.parse(source);
			if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
				throw new Error('The value must be a JSON object.');
			}
			value = parsed;
			onApply(parsed);
			previousValue = JSON.stringify(parsed, null, 2);
			source = previousValue;
			errorMessage = '';
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Invalid JSON.';
		}
	};
</script>

<div class="max-w-5xl mx-auto space-y-4">
	<div>
		<h1 class="h2">{title}</h1>
		<p class="opacity-70">{description}</p>
	</div>
	<label class="block space-y-2">
		<span class="font-semibold">JSON object</span>
		<textarea
			class="textarea font-mono min-h-[60vh]"
			bind:value={source}
			spellcheck="false"
			aria-invalid={Boolean(errorMessage)}
		/>
	</label>
	{#if errorMessage}
		<p class="text-error-500 text-sm" role="alert">{errorMessage}</p>
	{/if}
	<button type="button" class="btn variant-filled-primary" on:click={applyChanges}>
		Apply changes
	</button>
</div>
