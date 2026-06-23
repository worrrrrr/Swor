import adapter from '@sveltejs/adapter-cloudflare';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess(),
		mdsvex({ extensions: ['.svx', '.md'] })
	],
	extensions: ['.svelte', '.svx', '.md'],
	kit: {
		adapter: adapter()
	}
};

export default config;