<script lang="ts">
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';

	export let flow: OpenAPIV3_1.OAuth2Scopes;

	const addScope = () => {
		// Correctly adds a new key with a string value to the scopes object
		// @ts-expect-error - This is a valid operation
		flow.scopes['newScope'] = 'placeholder';
	};

	const removeScope = (key: string) => {
		// To remove a key from an object, use the delete operator instead of setting it to undefined
		//@ts-expect-error - This is a valid operation
		delete flow.scopes[key];
	};
</script>

<h4 class="h4">Scopes</h4>
<table class="table">
	<tbody>
		{#each Object.entries(flow.scopes) as scope, index}
			{#each scope as item, i}
				<tr>
					<td class="px-4">
						<input
							type="text"
							name="scope{index}-{i}"
							class="input"
							placeholder="scope"
							bind:value={item}
						/>
					</td>
					<td class="max-w-16 px-2">
						<button
							type="button"
							class="btn variant-ringed-error hover:variant-filled-error"
							on:click={() => {
								removeScope(item);
							}}
						>
							Remove Scope
						</button>
					</td>
				</tr>
			{/each}
		{/each}
	</tbody>
</table>
<span class="flex justify-center">
	<button type="button" class="btn variant-filled-primary" on:click={addScope}>Add Scope</button>
</span>
