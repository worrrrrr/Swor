import { supabase } from "$lib/supabaseClient";

export async function load() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("posts")
    .select()
    .order('created_at', { ascending: false })
    .limit(10);
  return {
    posts: data ?? [],
    userId: user?.id || null,
  };
}
