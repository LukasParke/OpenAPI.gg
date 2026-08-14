<script lang="ts">
	import { loadSpec, saveSpec, selectedSpec } from '$lib/db';
	import type { CssClasses } from '@skeletonlabs/skeleton';

	export let width: CssClasses = 'w-full';

	async function onSave(): Promise<void> {
		const spec = await saveSpec($selectedSpec);
		if (spec) loadSpec(spec);
	}
</script>

<button class="btn variant-ghost-success {width}" on:click={onSave}> Save </button>
