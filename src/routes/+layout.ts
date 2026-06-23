import { supabase } from "$lib/supabaseClient";
// src/routes/+page.ts

export async function load() {
  // ทำการดึงข้อมูลจากตาราง posts ผ่าน Supabase Client
  const { data } = await supabase.from("posts").select();
  return {
    posts: data ?? [],
  };
}