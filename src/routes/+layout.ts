// src/routes/+layout.ts
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	// สร้างการระบุความสัมพันธ์เพื่อให้ระบบโหลดซ้ำเมื่อมีการเรียกคำสั่ง invalidate('supabase:auth')
	depends('supabase:auth');

	const supabase = isBrowser()
		? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: {
					fetch,
				},
			})
		: createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: {
					fetch,
				},
				cookies: {
					getAll() {
						return data.cookies;
					},
				},
			});

	const session = isBrowser()
		? (await supabase.auth.getSession()).data.session
		: data.session;

	const user = isBrowser()
		? (await supabase.auth.getUser()).data.user
		: data.user;

	return { supabase, session, user };
};