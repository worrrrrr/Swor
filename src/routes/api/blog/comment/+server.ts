import { supabase } from '$lib/supabaseClient';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const slug = url.searchParams.get('slug');
  if (!slug) return new Response('missing slug', { status: 400 });

  const { data: post } = await supabase.from('posts').select('id').eq('slug', slug).single();
  if (!post) return new Response('not found', { status: 404 });

  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id')
    .eq('post_id', post.id)
    .order('created_at', { ascending: true });

  const userIds = [...new Set((comments || []).map(c => c.user_id))];
  const { data: profiles } = await supabase
    .from('auth.users')
    .select('id, email')
    .in('id', userIds);

  const emailMap = Object.fromEntries((profiles || []).map((u: any) => [u.id, u.email]));

  const enriched = (comments || []).map(c => ({
    ...c,
    author: (emailMap[c.user_id] || 'Unknown').split('@')[0],
  }));

  return Response.json(enriched);
};

export const POST: RequestHandler = async ({ request }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });

  const { slug, content } = await request.json() as { slug: string; content: string };
  if (!slug || !content?.trim()) return new Response('missing fields', { status: 400 });

  const { data: post } = await supabase.from('posts').select('id').eq('slug', slug).single();
  if (!post) return new Response('not found', { status: 404 });

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ post_id: post.id, user_id: user.id, content: content.trim() })
    .select('id, content, created_at, user_id')
    .single();

  if (error) return new Response(error.message, { status: 500 });

  return Response.json({
    ...comment,
    author: (user.email || 'Unknown').split('@')[0],
  }, { status: 201 });
};
