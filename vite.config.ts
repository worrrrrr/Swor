// vite.config.ts
import { mdsvex } from 'mdsvex';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			}	
			,
			preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
			extensions: ['.svelte', '.svx', '.md']
		})
	],
	ssr: {
		noExternal: ['@swisseph/browser', '@swisseph/core','@swisseph/node', /@swisseph\/.*/]
	},
	optimizeDeps: {
		include: ['@swisseph/browser', '@swisseph/core']
	}
});
