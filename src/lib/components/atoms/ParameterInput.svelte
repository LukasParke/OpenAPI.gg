<script lang="ts">
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import ExampleInput from '$lib/components/atoms/ExampleInput.svelte';

	export let value: OpenAPIV3_1.ParameterObject;

	if (value.in === 'path') {
		value.required = true;
	}

	let multipleExamples = value.examples && Object.keys(value.examples).length > 1;

	const addParameterExample = () => {
		const exampleName = prompt('Enter a name for the example');
		if (!exampleName) return;
		// @ts-expect-error - working we are setting a new key
		value.examples[exampleName] = {
			$ref: '',
			summary: '',
			description: '',
			value: '',
			externalValue: ''
		};
	};

	function addNullable(
		type:
			| (OpenAPIV3_1.ArraySchemaObjectType | OpenAPIV3_1.NonArraySchemaObjectType)[]
			| (OpenAPIV3_1.ArraySchemaObjectType | OpenAPIV3_1.NonArraySchemaObjectType)
	) {
		if (Array.isArray(type) && !type.includes('null')) {
			type.push('null');
		} else if (typeof type === 'string' && type !== 'null') {
			return [type, 'null'];
		}
	}

	function removeNullable(
		type:
			| (OpenAPIV3_1.ArraySchemaObjectType | OpenAPIV3_1.NonArraySchemaObjectType)[]
			| (OpenAPIV3_1.ArraySchemaObjectType | OpenAPIV3_1.NonArraySchemaObjectType)
	) {
		if (Array.isArray(type) && type.includes('null')) {
			type = type.filter((t) => t !== 'null');
			if (type.length === 1) {
				return type[0];
			} else {
				return type;
			}
		}
	}

	function typeIsNullable(
		type:
			| (OpenAPIV3_1.ArraySchemaObjectType | OpenAPIV3_1.NonArraySchemaObjectType)[]
			| (OpenAPIV3_1.ArraySchemaObjectType | OpenAPIV3_1.NonArraySchemaObjectType)
	) {
		if (Array.isArray(type) && type.includes('null')) {
			return true;
		} else if (typeof type === 'string' && type === 'null') {
			return true;
		} else {
			return false;
		}
	}
</script>

<div class="card py-6 px-4 flex flex-col gap-4 text-sm">
	<h4 class="h4">
		{#if value.in === 'path'}
			&lbrace;{value.name}&rbrace;
		{:else}
			{value.name}
		{/if}
	</h4>

	<span class="flex items-center gap-2">
		<p>Location:</p>
		<select
			name="location"
			class="select w-min"
			disabled={value.in === 'path'}
			bind:value={value.in}
		>
			<option value="path">Path</option>
			<option value="query">Query</option>
			<option value="header">Header</option>
			<option value="cookie">Cookie</option>
		</select>
	</span>

	<label class="space-y-2">
		<p>Description</p>
		<textarea
			class="textarea"
			bind:value={value.description}
			placeholder="Description of the parameter. Supports markdown."
		/>
	</label>
	<div class="flex flex-row gap-16">
		{#if value.required}
			<SlideToggle name="required" disabled={value.in === 'path'} bind:checked={value.required}>
				Required
			</SlideToggle>
		{/if}
		{#if value.deprecated}
			<SlideToggle name="deprecated" bind:checked={value.deprecated} disabled={value.in === 'path'}>
				Deprecated
			</SlideToggle>
		{/if}

		{#if value.schema !== undefined && value.schema.hasOwnProperty("type")}
			<SlideToggle
				name="nullable"
				disabled={value.in === 'path'}
				checked={typeIsNullable(value.schema.type)}
				on:change={(e) => {
					// @ts-expect-error - this is a valid target access
					switch (e.target.checked) {
						case true:
							// @ts-expect-error - we have already filtered on the type
							value.schema.type = addNullable(value.schema?.type);
							break;

						case false:
							// @ts-expect-error - we have already filtered on the type
							value.schema.type = removeNullable(value.schema?.type);
							break;
					}
				}}
			>
				Nullable
			</SlideToggle>
		{/if}
	</div>
	<label class="space-y-2">
		<p>Style</p>
		<select name="style" class="select" bind:value={value.style}>
			<option value={undefined} selected>none</option>
			<option value="matrix">Matrix</option>
			<option value="label">Label</option>
			<option value="form">Form</option>
			<option value="simple">Simple</option>
			<option value="spaceDelimited">Space Delimited</option>
			<option value="pipeDelimited">Pipe Delimited</option>
			<option value="deepObject">Deep Object</option>
		</select>
	</label>
	<div class="flex flex-row gap-16">
		<SlideToggle name="explode" bind:checked={value.explode}>Explode</SlideToggle>
		<SlideToggle name="allowReserved" bind:checked={value.allowReserved}>Allow Reserved</SlideToggle
		>
	</div>
	<label class="space-y-2">
		<p>Schema</p>
		<!-- Subject to change -->
		<select class="select" name="schema" bind:value={value.schema}>
			<option value="schema">Schema not yet implemented</option>
		</select>
	</label>
	<SlideToggle
		name="multiExample"
		bind:checked={multipleExamples}
		on:click={() => {
			if (!value.examples) value.examples = {};
		}}
	>
		Multiple Examples?
	</SlideToggle>
	{#if multipleExamples}
		<div class="space-y-2">
			<p>Examples</p>
			{#if value.examples}
				{#each Object.entries(value.examples) as example}
					<ExampleInput bind:example={example[1]} name={example[0]} />
				{/each}
			{/if}
			<button
				type="button"
				class="btn btn-sm variant-filled-primary"
				on:click={addParameterExample}
			>
				Add Example
			</button>
		</div>
	{:else}
		<label class="space-y-2">
			<p>Example</p>
			<input type="text" class="input" name="example" placeholder="An example of the value." />
		</label>
	{/if}
</div>
