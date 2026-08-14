<script lang="ts">
	import { loadSpec, type APISpec } from '$lib/db';
	import type { CssClasses } from '@skeletonlabs/skeleton';

	export let spec: APISpec;

	export let width: CssClasses = 'w-full';

	function onLoad(): void {
		loadSpec(spec);
	}
</script>

<button class="btn variant-ghost-warning {width}" on:click={onLoad}> Load </button>
