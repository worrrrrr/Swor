import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { prompts: [] };

  const { data } = await supabase
    .from('prompts')
    .select('id, title, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return { prompts: data ?? [] };
};
