<script lang="ts">
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import SchemaEditor from './SchemaEditor.svelte';

	export let keyword: string;
	export let items: (OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject)[];
	export let schemas: Record<string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject> = {};
	export let depth = 0;
	export let onChange: () => void = () => {};
</script>

{#each items as item, index}
	<div class="space-y-2" data-schema-kind={'$ref' in item ? 'reference' : 'inline'}>
		<div class="flex justify-between">
			<span class="text-xs font-semibold">{keyword} #{index + 1}</span>
			<button
				type="button"
				class="btn btn-sm variant-ghost-error"
				on:click={() => {
					items.splice(index, 1);
					items = items;
					onChange();
				}}>Remove</button
			>
		</div>
		<SchemaEditor bind:value={items[index]} {schemas} depth={depth + 1} />
	</div>
{/each}
