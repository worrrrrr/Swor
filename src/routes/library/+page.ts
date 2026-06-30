import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const { data: notebooks } = await supabase
    .from('notebooks')
    .select('id, title, description, cover_url, created_at, views')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return { notebooks: notebooks ?? [] };
};
