import { env } from "$env/dynamic/public";

const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY;

// เพิ่มการตรวจสอบความปลอดภัยฝั่งเซิร์ฟเวอร์ก่อนเริ่มทำงาน
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
  throw new Error("Supabase configuration is missing");
}