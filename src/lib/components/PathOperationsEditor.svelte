<script lang="ts">
	import { HttpMethods } from '$lib';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import OperationEditor from './OperationEditor.svelte';

	export let path: OpenAPIV3_1.PathItemObject;
	export let components: OpenAPIV3_1.ComponentsObject = {};
	export let onChange: () => void = () => {};

	const toggleOperation = (method: HttpMethods, enabled: boolean) => {
		if (enabled) {
			path[method] ??= {
				parameters: [],
				responses: {
					'200': { description: 'Successful response' }
				}
			};
		} else {
			delete path[method];
		}
		onChange();
	};
</script>

<div class="space-y-4">
	<div class="flex flex-wrap gap-4">
		{#each Object.values(HttpMethods) as method}
			<label class="flex items-center gap-2 font-mono uppercase">
				<input
					type="checkbox"
					class="checkbox"
					checked={Boolean(path[method])}
					on:change={(event) => toggleOperation(method, event.currentTarget.checked)}
				/>
				{method}
			</label>
		{/each}
	</div>

	{#each Object.values(HttpMethods) as method}
		{@const operation = path[method]}
		{#if operation}
			<OperationEditor {method} {operation} {components} {onChange} />
		{/if}
	{/each}
</div>
