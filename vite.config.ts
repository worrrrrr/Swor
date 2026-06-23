import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()  // <-- สำคัญมาก: ต้องไม่มี options ข้างในนี้!
	],
	ssr: {
		noExternal: ['@swisseph/browser', '@swisseph/core', '@swisseph/node', /@swisseph\/.*/]
	},
	optimizeDeps: {
		include: ['@swisseph/browser', '@swisseph/core']
	}
});