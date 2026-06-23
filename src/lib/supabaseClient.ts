import { createClient } from "@supabase/supabase-js";
import { env } from "$env/dynamic/public";

// ดึงข้อมูลคีย์แบบ Dynamic และกำหนด Fallback ป้องกันการทำงานผิดพลาดตอน Build
const supabaseUrl = env.PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY ?? env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

// สร้างและส่งออกอินสแตนซ์ Supabase Client สำหรับทำงานร่วมกับทุกหน้าจอ
export const supabase = createClient(supabaseUrl, supabaseKey);