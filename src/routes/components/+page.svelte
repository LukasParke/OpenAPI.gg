<script lang="ts">
	import JsonObjectEditor from '$lib/components/JsonObjectEditor.svelte';
	import { selectedSpec } from '$lib/db';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';

	let components: Record<string, unknown> = $selectedSpec.spec.components ?? {};

	$: {
		$selectedSpec.spec.components = components as OpenAPIV3_1.ComponentsObject;
		$selectedSpec = $selectedSpec;
	}
</script>

<JsonObjectEditor
	title="Reusable components"
	description="Edit schemas, responses, parameters, examples, request bodies, headers, links, callbacks, and path items."
	bind:value={components}
/>
