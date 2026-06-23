import adapter from '@sveltejs/adapter-cloudflare';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// กำหนด preprocess ที่นี่
	preprocess: [
		vitePreprocess(),
		mdsvex({ 
			extensions: ['.svx', '.md'] 
		})
	],
	
	extensions: ['.svelte', '.svx', '.md'],
	
	kit: {
		// กำหนด adapter ที่นี่
		adapter: adapter({
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			}
		})
	}
};

export default config;