<script lang="ts">
	import JsonObjectEditor from '$lib/components/JsonObjectEditor.svelte';
	import SchemaEditor from '$lib/components/SchemaEditor.svelte';
	import { selectedSpec } from '$lib/db';
	import { createSchema } from '$lib/schema';

	const sections = [
		'schemas',
		'responses',
		'parameters',
		'examples',
		'requestBodies',
		'headers',
		'securitySchemes',
		'links',
		'callbacks',
		'pathItems'
	] as const;
	type Section = (typeof sections)[number];

	let activeSection: Section = 'schemas';
	let componentName = '';

	$selectedSpec.spec.components ??= {};
	$: components = $selectedSpec.spec.components ?? {};
	$: activeComponents = (components[activeSection] ?? {}) as Record<string, unknown>;

	const templateFor = (section: Section): unknown => {
		switch (section) {
			case 'schemas':
				return createSchema('object');
			case 'responses':
				return { description: 'Response' };
			case 'parameters':
				return { name: '', in: 'query', schema: createSchema() };
			case 'examples':
				return { summary: '', description: '', value: null };
			case 'requestBodies':
				return {
					description: '',
					required: false,
					content: { 'application/json': { schema: createSchema('object') } }
				};
			case 'headers':
				return { description: '', schema: createSchema() };
			case 'securitySchemes':
				return { type: 'http', scheme: 'bearer' };
			case 'links':
				return { operationId: '', description: '' };
			case 'callbacks':
			case 'pathItems':
				return {};
		}
	};

	const addComponent = () => {
		const name = componentName.trim();
		if (!name || activeComponents[name]) return;
		$selectedSpec.spec.components ??= {};
		const section = ($selectedSpec.spec.components[activeSection] ??= {}) as Record<
			string,
			unknown
		>;
		section[name] = templateFor(activeSection);
		componentName = '';
		$selectedSpec = $selectedSpec;
	};

	const removeComponent = (name: string) => {
		const section = $selectedSpec.spec.components?.[activeSection] as
			| Record<string, unknown>
			| undefined;
		if (!section) return;
		delete section[name];
		$selectedSpec = $selectedSpec;
	};

	const sectionLabel = (section: Section) =>
		section
			.replace(/[A-Z]/g, (character) => ` ${character}`)
			.replace(/^./, (value) => value.toUpperCase());
</script>

<div class="mx-auto max-w-6xl space-y-4">
	<div>
		<h1 class="h2">Reusable components</h1>
		<p class="opacity-70">
			Build reusable OpenAPI objects and reference them from paths, operations, and schemas.
		</p>
	</div>

	<div class="flex flex-wrap gap-2">
		{#each sections as section}
			<button
				type="button"
				class="btn btn-sm"
				class:variant-filled-primary={activeSection === section}
				class:variant-ghost-primary={activeSection !== section}
				on:click={() => (activeSection = section)}
			>
				{sectionLabel(section)}
			</button>
		{/each}
	</div>

	{#if activeSection === 'securitySchemes'}
		<p class="text-sm">
			The dedicated <a class="anchor" href="/authentication">Security editor</a> provides guided authentication
			forms. Advanced values can also be edited here.
		</p>
	{/if}

	<div class="space-y-3">
		{#each Object.keys(activeComponents) as name}
			<div class="card p-4 space-y-3">
				<div class="flex justify-between items-center gap-2">
					<h2 class="h4">{name}</h2>
					<button
						type="button"
						class="btn btn-sm variant-ghost-error"
						on:click={() => removeComponent(name)}>Remove</button
					>
				</div>
				{#if activeSection === 'schemas'}
					<SchemaEditor bind:value={activeComponents[name]} schemas={components.schemas ?? {}} />
				{:else}
					<JsonObjectEditor
						title={sectionLabel(activeSection).slice(0, -1)}
						description="Edit this reusable OpenAPI object. References use the standard #/components/... form."
						bind:value={activeComponents[name]}
					/>
				{/if}
			</div>
		{/each}
	</div>

	<div class="card p-4 flex gap-2">
		<input
			class="input"
			bind:value={componentName}
			placeholder={`New ${sectionLabel(activeSection).slice(0, -1)} name`}
			on:keydown={(event) => {
				if (event.key === 'Enter') addComponent();
			}}
		/>
		<button type="button" class="btn variant-filled-primary" on:click={addComponent}>
			Add component
		</button>
	</div>
</div>
