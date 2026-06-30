import { supabase } from '$lib/supabaseClient';
import { getAuth } from '$lib/serverAuth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  const { userId, client } = await getAuth(event);
  if (!userId) return new Response('unauthorized', { status: 401 });

  const db = (client ?? supabase) as any;
  const { post_id, notebook_id } = await event.request.json() as { post_id: string; notebook_id: string };
  if (!post_id || !notebook_id) return new Response('missing fields', { status: 400 });

  const { data: post } = await db.from('posts').select('id, title, content').eq('id', post_id).single();
  if (!post) return new Response('post not found', { status: 404 });

  const { data: nb } = await db.from('notebooks').select('id, user_id').eq('id', notebook_id).single();
  if (!nb || nb.user_id !== userId) return new Response('notebook not found', { status: 404 });

  const { data: existing } = await db.from('notebook_items').select('id').eq('notebook_id', notebook_id).eq('source_id', post_id).eq('type', 'blog').maybeSingle();
  if (existing) return new Response('already in notebook', { status: 409 });

  const { error: ie } = await db.from('notebook_items').insert({ notebook_id, type: 'blog', title: post.title, source_id: post.id });
  if (ie) return new Response(ie.message, { status: 500 });

  const { error: se } = await db.from('notebook_sources').insert({ notebook_id, title: post.title, content: post.content || '' });
  if (se) return new Response(se.message, { status: 500 });

  return Response.json({ ok: true });
};
