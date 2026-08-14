<script lang="ts">
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import {
		createReference,
		createSchema,
		isReference,
		referenceName,
		schemaTypes,
		setSchemaType,
		type SchemaType
	} from '$lib/schema';
	import SchemaCompositionEditor from './SchemaCompositionEditor.svelte';

	export let value: unknown = createSchema();
	export let schemas: Record<string, OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject> = {};
	export let depth = 0;

	let composition: 'oneOf' | 'allOf' | 'anyOf' = 'oneOf';
	let enumValue = '';
	let propertyName = '';

	$: schema = isReference(value) ? undefined : (value as OpenAPIV3_1.SchemaObject);
	$: selectedType = schemaType(schema);
	$: properties = schema?.properties ?? {};

	const schemaType = (current: OpenAPIV3_1.SchemaObject | undefined): SchemaType => {
		const type = current?.type;
		if (Array.isArray(type)) return (type[0] as SchemaType) ?? 'string';
		return (type as SchemaType) ?? 'string';
	};

	const updateType = (type: SchemaType) => {
		value = setSchemaType(schema ?? createSchema(), type);
	};

	const updateTypeFromValue = (type: string) => updateType(type as SchemaType);

	const getComposition = (keyword: string) => {
		if (!schema) return [];
		if (keyword === 'allOf') return schema.allOf ?? [];
		if (keyword === 'anyOf') return schema.anyOf ?? [];
		return schema.oneOf ?? [];
	};

	const addProperty = () => {
		const name = propertyName.trim();
		if (!name || !schema) return;
		schema.properties ??= {};
		if (schema.properties[name]) return;
		schema.properties[name] = createSchema();
		propertyName = '';
		value = value;
	};

	const removeProperty = (name: string) => {
		if (!schema?.properties) return;
		delete schema.properties[name];
		schema.required = schema.required?.filter((item) => item !== name);
		value = value;
	};

	const setRequired = (name: string, required: boolean) => {
		if (!schema) return;
		const names = new Set(schema.required ?? []);
		if (required) names.add(name);
		else names.delete(name);
		schema.required = [...names];
		value = value;
	};

	const addEnum = () => {
		if (!enumValue.trim() || !schema) return;
		schema.enum = [...(schema.enum ?? []), enumValue.trim()];
		enumValue = '';
		value = value;
	};

	const addComposition = () => {
		if (!schema) return;
		schema[composition] = [...(schema[composition] ?? []), createSchema()];
		value = value;
	};
</script>

<div class="space-y-3 rounded-container-token border border-surface-300-600-token p-3">
	<div class="flex flex-wrap items-end gap-2">
		<label class="space-y-1">
			<span class="text-xs font-semibold">Source</span>
			<select
				class="select"
				value={isReference(value) ? 'reference' : 'inline'}
				on:change={(event) => {
					value =
						event.currentTarget.value === 'reference'
							? createReference('schemas', Object.keys(schemas)[0] ?? '')
							: createSchema();
				}}
			>
				<option value="inline">Inline schema</option>
				<option value="reference">Schema reference</option>
			</select>
		</label>

		{#if isReference(value)}
			<label class="min-w-48 flex-1 space-y-1">
				<span class="text-xs font-semibold">Component schema</span>
				<select
					class="select"
					value={referenceName(value.$ref)}
					on:change={(event) => {
						value = createReference('schemas', event.currentTarget.value);
					}}
				>
					<option value="">Select a schema</option>
					{#each Object.keys(schemas) as name}
						<option value={name}>{name}</option>
					{/each}
				</select>
			</label>
		{:else if schema}
			<label class="space-y-1">
				<span class="text-xs font-semibold">Type</span>
				<select
					class="select"
					value={selectedType}
					on:change={(event) => updateTypeFromValue(event.currentTarget.value)}
				>
					{#each schemaTypes as type}
						<option value={type}>{type}</option>
					{/each}
				</select>
			</label>
			<label class="min-w-48 flex-1 space-y-1">
				<span class="text-xs font-semibold">Description</span>
				<input class="input" bind:value={schema.description} placeholder="Description" />
			</label>
		{/if}
	</div>

	{#if schema}
		<div class="grid gap-2 sm:grid-cols-2">
			<label class="space-y-1">
				<span class="text-xs font-semibold">Format</span>
				<input class="input" bind:value={schema.format} placeholder="date-time, uuid, int64…" />
			</label>
			<label class="space-y-1">
				<span class="text-xs font-semibold">Default</span>
				<input class="input" bind:value={schema.default} placeholder="Default value" />
			</label>
		</div>

		{#if selectedType === 'string'}
			<div class="grid gap-2 sm:grid-cols-3">
				<label class="space-y-1">
					<span class="text-xs">Minimum length</span>
					<input class="input" type="number" min="0" bind:value={schema.minLength} />
				</label>
				<label class="space-y-1">
					<span class="text-xs">Maximum length</span>
					<input class="input" type="number" min="0" bind:value={schema.maxLength} />
				</label>
				<label class="space-y-1">
					<span class="text-xs">Pattern</span>
					<input class="input" bind:value={schema.pattern} />
				</label>
			</div>
		{:else if selectedType === 'number' || selectedType === 'integer'}
			<div class="grid gap-2 sm:grid-cols-2">
				<label class="space-y-1">
					<span class="text-xs">Minimum</span>
					<input class="input" type="number" bind:value={schema.minimum} />
				</label>
				<label class="space-y-1">
					<span class="text-xs">Maximum</span>
					<input class="input" type="number" bind:value={schema.maximum} />
				</label>
			</div>
		{:else if selectedType === 'array' && 'items' in schema}
			<div class="space-y-2">
				<p class="text-sm font-semibold">Items</p>
				<svelte:self bind:value={schema.items} {schemas} depth={depth + 1} />
			</div>
		{:else if selectedType === 'object'}
			<div class="space-y-2">
				<p class="text-sm font-semibold">Properties</p>
				{#each Object.keys(properties) as name}
					<div class="card p-3 space-y-2">
						<div class="flex items-center justify-between gap-2">
							<strong>{name}</strong>
							<div class="flex items-center gap-2">
								<label class="flex items-center gap-1 text-xs">
									<input
										type="checkbox"
										class="checkbox"
										checked={schema.required?.includes(name)}
										on:change={(event) => setRequired(name, event.currentTarget.checked)}
									/>
									Required
								</label>
								<button
									type="button"
									class="btn btn-sm variant-ghost-error"
									on:click={() => removeProperty(name)}>Remove</button
								>
							</div>
						</div>
						<svelte:self bind:value={properties[name]} {schemas} depth={depth + 1} />
					</div>
				{/each}
				<div class="flex gap-2">
					<input class="input" bind:value={propertyName} placeholder="Property name" />
					<button type="button" class="btn variant-filled-primary" on:click={addProperty}>
						Add property
					</button>
				</div>
			</div>
		{/if}

		<div class="space-y-2">
			<p class="text-sm font-semibold">Enum values</p>
			<div class="flex flex-wrap gap-2">
				{#each schema.enum ?? [] as item, index}
					<button
						type="button"
						class="chip variant-soft-secondary"
						on:click={() => {
							schema.enum?.splice(index, 1);
							value = value;
						}}>{String(item)} ×</button
					>
				{/each}
			</div>
			<div class="flex gap-2">
				<input class="input" bind:value={enumValue} placeholder="Enum value" />
				<button type="button" class="btn variant-ghost-primary" on:click={addEnum}>Add enum</button>
			</div>
		</div>

		{#if depth < 4}
			<div class="space-y-2">
				<p class="text-sm font-semibold">Composition</p>
				{#each ['oneOf', 'allOf', 'anyOf'] as keyword}
					<SchemaCompositionEditor
						{keyword}
						items={getComposition(keyword)}
						{schemas}
						{depth}
						onChange={() => (value = value)}
					/>
				{/each}
				<div class="flex gap-2">
					<select class="select w-min" bind:value={composition}>
						<option value="oneOf">oneOf</option>
						<option value="allOf">allOf</option>
						<option value="anyOf">anyOf</option>
					</select>
					<button type="button" class="btn variant-ghost-primary" on:click={addComposition}>
						Add composition
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
