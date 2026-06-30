import { supabase } from '$lib/supabaseClient';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });

  const { slug } = await request.json() as { slug: string };
  if (!slug) return new Response('missing slug', { status: 400 });

  const { data: post } = await supabase.from('posts').select('id').eq('slug', slug).single();
  if (!post) return new Response('not found', { status: 404 });

  const postId = post.id;

  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  let liked: boolean;
  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id);
    liked = false;
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    liked = true;
  }

  const { count } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  await supabase.from('posts').update({ likes_count: count }).eq('id', postId);

  return Response.json({ liked, likes_count: count });
};
