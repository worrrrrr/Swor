import { supabase } from '$lib/supabaseClient';
import { getAuth } from '$lib/serverAuth';
import type { RequestHandler } from './$types';

async function getDb(event: any) {
  const { userId, client } = await getAuth(event);
  return { userId, db: (client ?? supabase) as any };
}

export const GET: RequestHandler = async (event) => {
  const { userId, db } = await getDb(event);
  if (!userId) return Response.json([]);

  const { data } = await db.from('prompts').select('id, title, content, created_at').eq('user_id', userId).order('created_at', { ascending: false });
  return Response.json(data ?? []);
};

export const POST: RequestHandler = async (event) => {
  const { userId, db } = await getDb(event);
  if (!userId) return new Response('unauthorized', { status: 401 });

  const { title, content } = await event.request.json() as { title: string; content: string };
  if (!title?.trim() || !content?.trim()) return new Response('missing fields', { status: 400 });

  const { data, error } = await db.from('prompts').insert({ user_id: userId, title: title.trim(), content: content.trim() }).select('id, title, content, created_at').single();
  if (error) return new Response(error.message, { status: 500 });
  return Response.json(data, { status: 201 });
};
