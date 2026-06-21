// src/hooks.server.ts
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// 1. เริ่มต้นสร้าง Supabase Client สำหรับฝั่ง Server-Side โดยผูกกับกลไก Cookie ของ SvelteKit
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					// กำหนด path: '/' เสมอเพื่อให้สามารถเข้าถึง Cookie ได้จากทุก Route ย่อย
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			},
		},
	});

	/**
	 * 2. สร้างฟังก์ชันตรวจสอบความปลอดภัยของ Session โดยตรวจสอบความถูกต้องของ JWT ซ้ำฝั่งเซิร์ฟเวอร์
	 * แทนการดึงเฉพาะค่า Session เปล่าๆ ช่วยให้ปลอดภัยตามหลัก Security Best Practice
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session },
		} = await event.locals.supabase.auth.getSession();
		
		if (!session) {
			return { session: null, user: null };
		}

		// ทำการ Validate Token กับระบบ Auth ของ Supabase
		const {
			data: { user },
			error,
		} = await event.locals.supabase.auth.getUser();
		
		if (error) {
			// หาก Token หมดอายุ หรือไม่ถูกต้อง ให้ตีสถานะเป็น Null
			return { session: null, user: null };
		}

		return { session, user };
	};

	// 3. ปล่อยให้ SvelteKit ทำงานและจัดส่ง Response Headers ที่จำเป็นในการทำ Caching/Streaming
	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		},
	});
};