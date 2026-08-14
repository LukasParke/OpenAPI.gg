<script lang="ts">
	import type { OpenAPIV3_1 } from '$lib/openAPITypes';
	import { SlideToggle } from '@skeletonlabs/skeleton';
	import ExampleInput from '$lib/components/atoms/ExampleInput.svelte';

	export let variableName: string;
	export let value: OpenAPIV3_1.ParameterObject;
	export let location: 'path' | 'query' | 'header' | 'cookie';

	value.name = variableName;
	value.in = location;
	if (location === 'path') value.required = true;
	let multipleExamples = value.examples && Object.keys(value.examples).length > 1;

	const addParameterExample = () => {
		const exampleName = prompt('Enter a name for the example');
		if (!exampleName) return;
		value.examples ??= {};
		value.examples[exampleName] = {
			summary: '',
			description: '',
			value: ''
		};
	};

	const setSchemaType = (schemaType: string) => {
		value.schema = {
			type: schemaType as 'string' | 'number' | 'integer' | 'boolean'
		};
		value = value;
	};

	const getSchemaType = () => {
		if (!value.schema || '$ref' in value.schema) return 'string';
		return typeof value.schema.type === 'string' ? value.schema.type : 'string';
	};
</script>

<div class="card py-6 px-4 flex flex-col gap-4 text-sm">
	<h4 class="h4">{variableName}</h4>

	<span class="flex items-center gap-2">
		<p>Location:</p>
		<select
			name="location"
			class="select w-min"
			disabled={location === 'path'}
			bind:value={location}
			on:change={() => {
				value.in = location;
			}}
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
		<SlideToggle name="required" disabled={location === 'path'} bind:checked={value.required}>
			Required
		</SlideToggle>
		<SlideToggle name="deprecated" bind:checked={value.deprecated} disabled={location === 'path'}>
			Deprecated
		</SlideToggle>
		<SlideToggle
			name="allowEmptyValue"
			bind:checked={value.allowEmptyValue}
			disabled={location === 'path'}
		>
			Allow Empty Value
		</SlideToggle>
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
		<p>Schema type</p>
		<select
			class="select"
			name="schema"
			value={getSchemaType()}
			on:change={(event) => setSchemaType(event.currentTarget.value)}
		>
			<option value="string">String</option>
			<option value="number">Number</option>
			<option value="integer">Integer</option>
			<option value="boolean">Boolean</option>
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
			<input
				type="text"
				class="input"
				name="example"
				bind:value={value.example}
				placeholder="An example of the value."
			/>
		</label>
	{/if}
</div>
