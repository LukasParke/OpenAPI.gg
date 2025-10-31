<script lang="ts">
	import {  loadSpec, saveSpec, selectedSpec } from '$lib/db';
	import type { CssClasses } from '@skeletonlabs/skeleton';
	
	export let width: CssClasses = "w-full"
	export let padding: CssClasses = "px-3 py-1"

	async function onSave(e: Event): Promise<void> {
		console.log('Save button clicked');
		const spec = await saveSpec($selectedSpec);
		if(spec) loadSpec(spec);
	}

</script>

<button class="btn variant-ghost-success {width} {padding}" on:click={onSave}> Save </button>
