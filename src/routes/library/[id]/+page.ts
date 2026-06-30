import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const { data: notebook } = await supabase
    .from('notebooks')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!notebook || !notebook.published) {
    throw new Error('ไม่พบหนังสือ');
  }

  const { data: sources } = await supabase
    .from('notebook_sources')
    .select('id, title, content, source_type, created_at')
    .eq('notebook_id', params.id)
    .order('created_at', { ascending: true });

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === notebook.user_id;

  return {
    notebook,
    sources: sources ?? [],
    isOwner,
    userId: user?.id || null,
  };
};
