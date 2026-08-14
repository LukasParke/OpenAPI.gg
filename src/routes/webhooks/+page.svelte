<script lang="ts">
	import JsonObjectEditor from '$lib/components/JsonObjectEditor.svelte';
	import { selectedSpec } from '$lib/db';
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';

	let webhooks: Record<string, unknown> = $selectedSpec.spec.webhooks ?? {};

	$: {
		$selectedSpec.spec.webhooks = webhooks as Record<
			string,
			OpenAPIV3_1.PathItemObject | OpenAPIV3_1.ReferenceObject
		>;
		$selectedSpec = $selectedSpec;
	}
</script>

<JsonObjectEditor
	title="Webhooks"
	description="Define incoming, out-of-band requests as OpenAPI Path Item Objects."
	bind:value={webhooks}
/>
