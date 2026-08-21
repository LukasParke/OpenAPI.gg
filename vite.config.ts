/// <reference types="vitest/config" />
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	plugins: [enhancedImages(), sveltekit(), purgeCss()],
	test: {
		include: ['src/**/*.test.ts']
	}
});
