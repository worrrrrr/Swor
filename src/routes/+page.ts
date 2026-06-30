import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const { data: recent } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: popular } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('views', { ascending: false })
    .limit(5);

  const { data: notebooks } = await supabase
    .from('notebooks')
    .select('id, title, description, cover_url, views')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(4);

  return {
    recent: recent ?? [],
    popular: popular ?? [],
    notebooks: notebooks ?? [],
  };
};
