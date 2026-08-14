<script lang="ts">
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import { createReference, createSchema, referenceName } from '$lib/schema';
	import JsonObjectEditor from './JsonObjectEditor.svelte';
	import SchemaEditor from './SchemaEditor.svelte';

	export let method: string;
	export let operation: OpenAPIV3_1.OperationObject;
	export let components: OpenAPIV3_1.ComponentsObject = {};
	export let onChange: () => void = () => {};

	let responseCode = '200';
	let mediaType = 'application/json';

	const ensureRequestBody = () => {
		if (!operation.requestBody) {
			operation.requestBody = {
				description: '',
				required: false,
				content: {
					'application/json': { schema: createSchema('object') }
				}
			};
			onChange();
		}
	};

	const addResponse = () => {
		const code = responseCode.trim();
		if (!code) return;
		operation.responses ??= {};
		operation.responses[code] ??= {
			description: code === 'default' ? 'Default response' : 'Response'
		};
		onChange();
	};

	const setResponseReference = (code: string, name: string) => {
		operation.responses ??= {};
		operation.responses[code] = createReference('responses', name);
		onChange();
	};

	const addResponseContent = (
		response: OpenAPIV3_1.ResponseObject,
		contentType = 'application/json'
	) => {
		response.content ??= {};
		response.content[contentType] ??= { schema: createSchema('object') };
		onChange();
	};

	const isResponse = (
		response: OpenAPIV3_1.ResponseObject | OpenAPIV3_1.ReferenceObject
	): response is OpenAPIV3_1.ResponseObject => !('$ref' in response);

	const isRequestBody = (
		body: OpenAPIV3_1.RequestBodyObject | OpenAPIV3_1.ReferenceObject
	): body is OpenAPIV3_1.RequestBodyObject => !('$ref' in body);

	const removeRequestMediaType = (contentType: string) => {
		const body = operation.requestBody;
		if (!body || !isRequestBody(body)) return;
		delete body.content[contentType];
		onChange();
	};

	const addRequestMediaType = () => {
		const body = operation.requestBody;
		if (!body || !isRequestBody(body) || !mediaType.trim()) return;
		body.content[mediaType.trim()] = { schema: createSchema('object') };
		onChange();
	};

	const applyAdvancedOperation = (next: Record<string, unknown>) => {
		for (const key of Object.keys(operation)) {
			delete operation[key as keyof OpenAPIV3_1.OperationObject];
		}
		Object.assign(operation, next);
		onChange();
	};

	const setOptionalText = (field: 'summary' | 'description' | 'operationId', text: string) => {
		const value = text.trim();
		if (value) operation[field] = text;
		else delete operation[field];
		onChange();
	};

	const setExternalDocs = (field: 'url' | 'description', text: string) => {
		if (text) {
			operation.externalDocs ??= { url: '' };
			operation.externalDocs[field] = text;
		} else if (operation.externalDocs) {
			delete operation.externalDocs[field];
			if (!operation.externalDocs.url && !operation.externalDocs.description) {
				delete operation.externalDocs;
			}
		}
		onChange();
	};
</script>

<div class="card p-4 space-y-4">
	<h3 class="h4 font-mono uppercase">{method}</h3>
	<div class="grid gap-3 sm:grid-cols-2">
		<label class="space-y-1">
			<span>Summary</span>
			<input
				class="input"
				value={operation.summary}
				on:input={(event) => setOptionalText('summary', event.currentTarget.value)}
			/>
		</label>
		<label class="space-y-1">
			<span>Operation ID</span>
			<input
				class="input"
				value={operation.operationId}
				on:input={(event) => setOptionalText('operationId', event.currentTarget.value)}
			/>
		</label>
	</div>
	<label class="space-y-1">
		<span>Description</span>
		<textarea
			class="textarea"
			value={operation.description}
			on:input={(event) => setOptionalText('description', event.currentTarget.value)}
		/>
	</label>
	<label class="space-y-1">
		<span>Tags</span>
		<input
			class="input"
			value={(operation.tags ?? []).join(', ')}
			on:change={(event) => {
				operation.tags = event.currentTarget.value
					.split(',')
					.map((tag) => tag.trim())
					.filter(Boolean);
				onChange();
			}}
			placeholder="users, public"
		/>
	</label>
	<div class="grid gap-3 sm:grid-cols-2">
		<label class="space-y-1">
			<span>External documentation URL</span>
			<input
				type="url"
				class="input"
				value={operation.externalDocs?.url}
				on:input={(event) => setExternalDocs('url', event.currentTarget.value)}
			/>
		</label>
		<label class="space-y-1">
			<span>External documentation description</span>
			<input
				class="input"
				value={operation.externalDocs?.description}
				on:input={(event) => setExternalDocs('description', event.currentTarget.value)}
			/>
		</label>
	</div>
	<label class="flex items-center gap-2">
		<input
			type="checkbox"
			class="checkbox"
			bind:checked={operation.deprecated}
			on:change={onChange}
		/>
		Deprecated
	</label>

	<div class="space-y-3 border-t border-surface-300-600-token pt-4">
		<div class="flex items-center justify-between gap-2">
			<h4 class="h5">Request body</h4>
			{#if !operation.requestBody}
				<button type="button" class="btn btn-sm variant-ghost-primary" on:click={ensureRequestBody}>
					Add request body
				</button>
			{:else}
				<button
					type="button"
					class="btn btn-sm variant-ghost-error"
					on:click={() => {
						delete operation.requestBody;
						onChange();
					}}>Remove request body</button
				>
			{/if}
		</div>
		{#if operation.requestBody}
			<div class="flex gap-2">
				<select
					class="select"
					value={'$ref' in operation.requestBody ? 'reference' : 'inline'}
					on:change={(event) => {
						operation.requestBody =
							event.currentTarget.value === 'reference'
								? createReference(
										'requestBodies',
										Object.keys(components.requestBodies ?? {})[0] ?? ''
									)
								: {
										content: {
											'application/json': { schema: createSchema('object') }
										}
									};
						onChange();
					}}
				>
					<option value="inline">Inline</option>
					<option value="reference">Component reference</option>
				</select>
				{#if '$ref' in operation.requestBody}
					<select
						class="select"
						value={referenceName(operation.requestBody.$ref)}
						on:change={(event) => {
							operation.requestBody = createReference('requestBodies', event.currentTarget.value);
							onChange();
						}}
					>
						<option value="">Select request body</option>
						{#each Object.keys(components.requestBodies ?? {}) as name}
							<option value={name}>{name}</option>
						{/each}
					</select>
				{/if}
			</div>
			{#if isRequestBody(operation.requestBody)}
				<label class="space-y-1">
					<span>Description</span>
					<input class="input" bind:value={operation.requestBody.description} on:input={onChange} />
				</label>
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						class="checkbox"
						bind:checked={operation.requestBody.required}
						on:change={onChange}
					/>
					Required
				</label>
				{#each Object.entries(operation.requestBody.content) as [contentType, media]}
					<div class="space-y-2">
						<div class="flex justify-between">
							<strong>{contentType}</strong>
							<button
								type="button"
								class="btn btn-sm variant-ghost-error"
								on:click={() => removeRequestMediaType(contentType)}>Remove</button
							>
						</div>
						<SchemaEditor bind:value={media.schema} schemas={components.schemas ?? {}} />
					</div>
				{/each}
				<div class="flex gap-2">
					<input class="input" bind:value={mediaType} placeholder="application/json" />
					<button
						type="button"
						class="btn btn-sm variant-ghost-primary"
						on:click={addRequestMediaType}>Add media type</button
					>
				</div>
			{/if}
		{/if}
	</div>

	<div class="space-y-3 border-t border-surface-300-600-token pt-4">
		<h4 class="h5">Responses</h4>
		{#each Object.entries(operation.responses ?? {}) as [code, response]}
			<div class="card p-3 space-y-3">
				<div class="flex justify-between">
					<strong>{code}</strong>
					<button
						type="button"
						class="btn btn-sm variant-ghost-error"
						on:click={() => {
							delete operation.responses?.[code];
							onChange();
						}}>Remove</button
					>
				</div>
				{#if isResponse(response)}
					<input
						class="input"
						bind:value={response.description}
						on:input={onChange}
						placeholder="Response description"
					/>
					{#each Object.entries(response.content ?? {}) as [contentType, media]}
						<div class="space-y-2">
							<div class="flex justify-between">
								<span>{contentType}</span>
								<button
									type="button"
									class="btn btn-sm variant-ghost-error"
									on:click={() => {
										delete response.content?.[contentType];
										onChange();
									}}>Remove content</button
								>
							</div>
							<SchemaEditor bind:value={media.schema} schemas={components.schemas ?? {}} />
						</div>
					{/each}
					<button
						type="button"
						class="btn btn-sm variant-ghost-primary"
						on:click={() => addResponseContent(response)}>Add JSON content</button
					>
				{:else}
					<select
						class="select"
						value={referenceName(response.$ref)}
						on:change={(event) => setResponseReference(code, event.currentTarget.value)}
					>
						<option value="">Select response</option>
						{#each Object.keys(components.responses ?? {}) as name}
							<option value={name}>{name}</option>
						{/each}
					</select>
				{/if}
			</div>
		{/each}
		<div class="flex gap-2">
			<input class="input" bind:value={responseCode} placeholder="200 or default" />
			<button type="button" class="btn variant-filled-primary" on:click={addResponse}>
				Add response
			</button>
		</div>
	</div>

	<details class="border-t border-surface-300-600-token pt-4">
		<summary class="cursor-pointer font-semibold">Advanced operation JSON</summary>
		<div class="mt-3">
			<JsonObjectEditor
				title="Advanced operation"
				description="Edit callbacks, links, headers, security overrides, extensions, and any other OpenAPI operation fields."
				value={operation}
				onApply={applyAdvancedOperation}
			/>
		</div>
	</details>
</div>
