<script lang="ts">
	import type { OAuthFlowValue } from '$lib/authTemplates';

	export let type: 'implicit' | 'authorizationCode' | 'password' | 'clientCredentials';
	export let flow: OAuthFlowValue;
	export let onChange: () => void = () => {};
	let scopeName = '';

	const addScope = () => {
		const name = scopeName.trim();
		if (!name || name in flow.scopes) return;
		flow.scopes[name] = '';
		scopeName = '';
		flow = flow;
		onChange();
	};

	const removeScope = (scope: string) => {
		delete flow.scopes[scope];
		flow = flow;
		onChange();
	};
</script>

<div class="border-token rounded-container-token p-4" on:input={onChange}>
	<div class="ml-4 flex flex-col gap-4">
		{#if type === 'implicit' || type === 'authorizationCode'}
			<label>
				<h5 class="h5">Authorization URL</h5>
				<p class="text-sm">The authorization URL to be used for this flow.</p>
				<input
					type="url"
					name="authorizationURL"
					class="input"
					placeholder="https://api.example.com/oauth2/authorize"
					bind:value={flow.authorizationUrl}
				/>
			</label>
		{/if}
		{#if type !== 'implicit'}
			<label>
				<h5 class="h5">Token URL</h5>
				<p class="text-sm">The token URL to be used for this flow.</p>
				<input
					type="url"
					name="tokenURL"
					class="input"
					placeholder="https://api.example.com/oauth2/token"
					bind:value={flow.tokenUrl}
				/>
			</label>
		{/if}
		<label>
			<h5 class="h5">Refresh URL</h5>
			<p class="text-sm">The refresh URL to be used for this flow. (optional)</p>
			<input
				type="url"
				name="refreshURL"
				class="input"
				placeholder="https://api.example.com/oauth2/refresh"
				bind:value={flow.refreshUrl}
			/>
		</label>
		<div>
			<h5 class="h5">Scopes</h5>
			<p class="text-sm">The available scopes for this flow.</p>
			<table class="table">
				<tbody>
					{#each Object.keys(flow.scopes) as scope (scope)}
						<tr>
							<td class="!text-lg">{scope}</td>
							<td class="w-full">
								<input
									type="text"
									name="scope"
									class="input"
									placeholder="Description of the scope"
									bind:value={flow.scopes[scope]}
								/>
							</td>
							<td>
								<button
									type="button"
									class="btn variant-ringed-error hover:variant-filled-error"
									on:click={() => removeScope(scope)}
								>
									Remove
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<span class="w-full flex justify-center">
				<input class="input" bind:value={scopeName} placeholder="Scope name" />
				<button
					type="button"
					class="btn btn-sm variant-filled-primary"
					class:mt-2={Object.keys(flow.scopes).length !== 0}
					on:click={addScope}
				>
					Add Scope
				</button>
			</span>
		</div>
	</div>
</div>
