<script lang="ts">
	import { db, selectedSpec } from '$lib/db';

	function onSave(): void {
		const newSpec = structuredClone($selectedSpec);
		newSpec.id = undefined;
		db.apiSpecs.put(newSpec);
	}
</script>

<button class="btn variant-ghost-success" on:click={onSave}> Save As </button>
