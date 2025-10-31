<script lang="ts">
	import { newSpec } from '$lib/db';
	import { db, loadSpec, type APISpec } from '$lib/db';
	import type { CssClasses } from '@skeletonlabs/skeleton';

	export let spec: APISpec;

	export let width: CssClasses = "w-full"
</script>

<button
	class="btn variant-ghost-error {width}"
	on:click={async () => {
		if (confirm(`Are you sure you want to delete '${spec.name}'?`)) {
			await db.apiSpecs.delete(spec.id);
			const specs = await db.apiSpecs.toArray()
			if (specs.length > 0){
				loadSpec(specs[0]);
			} else {
				loadSpec(newSpec());
			}
		}
	}}
>
	Delete
</button>
