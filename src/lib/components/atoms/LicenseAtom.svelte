<script lang="ts">
	import { selectedSpec } from '$lib/db';
	import spdxLicenseList from 'spdx-license-list';
	import { onMount } from 'svelte';

	const modifiedLicenseList = Object.entries(spdxLicenseList).map((entry) => {
		return {
			identifier: entry[0],
			name: entry[1].name,
			url: entry[1].url
		};
	});

	const popularLicenses = ['MIT', 'Apache-2.0', 'GPL-3.0', 'Unlicense'];

	let selectedLicense: {
		name: string;
		url: string;
		identifier: string;
	};

	selectedSpec.subscribe((spec) => {
		if (!spec.spec.info.license) return;

		let licenseCandidate;

		if (spec.spec.info.license.identifier) {
			licenseCandidate = modifiedLicenseList.find(
				(entry) => entry.identifier === spec.spec.info.license!.identifier
			);
		} else if (spec.spec.info.license.url) {
			licenseCandidate = modifiedLicenseList.find(
				(entry) => entry.url === spec.spec.info.license!.url
			);
		} else if (spec.spec.info.license.name) {
			licenseCandidate = modifiedLicenseList.find(
				(entry) => entry.name === spec.spec.info.license!.name
			);
		}

		if (licenseCandidate) {
			selectedLicense = licenseCandidate;
		}
	});
</script>

<div class="border-token grow rounded-container-token bg-surface-backdrop-token space-y-1 p-4">
	<div class="flex flex-row flex-wrap justify-between">
		<h4 class="h4">License</h4>
		{#if $selectedSpec.spec.info.license}
			<label class="text-sm ">
				<span>Pick a license</span>
				<select
					class="select md:w-56 text-sm"
					bind:value={selectedLicense}
					on:change={() => {
						$selectedSpec.spec.info.license = {
							name: selectedLicense.name,
							url: selectedLicense.url
						};
					}}
				>
					<optgroup label="Popular Licenses">
						{#each modifiedLicenseList.filter( (entry) => popularLicenses.includes(entry.identifier) ) as license}
							<option value={license}>{license.name}</option>
						{/each}
					</optgroup>
					<optgroup label="All Licenses">
						{#each modifiedLicenseList
							.filter((entry) => !popularLicenses.includes(entry.identifier))
							.sort() as license}
							<option value={license}>{license.name}</option>
						{/each}
					</optgroup>
				</select>
			</label>
		{/if}
	</div>

	{#if $selectedSpec.spec.info.license}
		<label class="text-sm space-y-1">
			<span>Name (required)</span>
			<input
				class="input text-sm"
				name="licenseName"
				placeholder="Apache 2.0"
				type="text"
				bind:value={$selectedSpec.spec.info.license.name}
			/>
		</label>
		<label class="text-sm space-y-1">
			<span>Identifer (optional)</span>
			<input
				class="input text-sm"
				name="licenseIdentifier"
				placeholder="Apache-2.0"
				type="text"
				bind:value={$selectedSpec.spec.info.license.identifier}
			/>
		</label>
		<label class="text-sm space-y-1">
			<span>URL (optional)</span>
			<input
				class="input text-sm"
				name="licenseUrl"
				placeholder="https://www.apache.org/licenses/LICENSE-2.0.html"
				type="url"
				bind:value={$selectedSpec.spec.info.license.url}
			/>
		</label>
	{:else}
		<button
			type="button"
			class="btn variant-filled-primary"
			on:click={() => {
				$selectedSpec.spec.info.license = {
					name: spdxLicenseList['MIT'].name,
					url: spdxLicenseList['MIT'].url
				};
			}}
		>
			Add License
		</button>
	{/if}
</div>
