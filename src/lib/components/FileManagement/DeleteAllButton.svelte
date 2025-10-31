<script lang="ts">
	import { newSpec } from '$lib/db';
	import { db, loadSpec, type APISpec } from '$lib/db';
	import type { CssClasses } from '@skeletonlabs/skeleton';

	export let width: CssClasses = "w-full"
</script>

<button
	class="btn variant-ghost-error {width}"
	on:click={async () => {
		if (confirm(`Are you sure you want to delete all saved specs?`)) {
			db.apiSpecs.clear();
			loadSpec(newSpec());
		}
	}}
>
	Delete All
</button>
