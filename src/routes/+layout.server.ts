// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies }) => {
	const { session, user } = await safeGetSession();
	
	return {
		session,
		user,
		// ส่ง Cookie ไปยัง Universal Load เพื่อใช้สร้าง Client Instance
		cookies: cookies.getAll(),
	};
};