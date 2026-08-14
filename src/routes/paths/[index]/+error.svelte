<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex min-h-[50vh] w-full items-center justify-center">
	<div class="card max-w-lg p-8 text-center">
		<div
			class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-500/10"
		>
			<span class="text-2xl font-bold text-error-500" aria-hidden="true">!</span>
		</div>
		<h1 class="h3">Unable to open this path</h1>
		<p class="mt-2 opacity-70">
			{$page.status}: {$page.error?.message ?? 'The requested path could not be loaded.'}
		</p>
		<a class="btn variant-filled-primary mt-6" href="/paths">Return to paths</a>
	</div>
</div>
