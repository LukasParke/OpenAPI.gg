<script lang="ts">
	import { saveDocumentNow } from '$lib/editorSession';
	import type { CssClasses } from '@skeletonlabs/skeleton';

	export let width: CssClasses = 'w-full';
</script>

<button class="btn variant-ghost-success {width}" on:click={saveDocumentNow}> Save </button>
