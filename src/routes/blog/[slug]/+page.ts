import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !post) {
    throw new Error('ไม่พบบทความ');
  }

  const { data: { user } } = await supabase.auth.getUser();
  const isAuthor = user?.id === post.user_id;

  return { post, isAuthor };
};
