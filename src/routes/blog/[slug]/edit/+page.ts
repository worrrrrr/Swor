import { supabase } from '$lib/supabaseClient';
import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(302, '/login');

  const { data: post, error: err } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (err || !post) error(404, 'ไม่พบบทความ');

  if (post.user_id !== user.id) error(403, 'คุณไม่มีสิทธิ์แก้ไขบทความนี้');

  return { post };
};
