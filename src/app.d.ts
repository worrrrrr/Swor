// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}
		// เปลี่ยนจาก:
		interface NavItem {
			name: string;
			href: string;
		}

		// เป็น:
		interface NavItem {
			name: string;
			href: '/' | '/astro' | '/blog' | '/project'; // ระบุเฉพาะค่าที่เป็นไปได้จริง
		}
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
