import { supabase } from '$lib/supabaseClient';
import { getAuth } from '$lib/serverAuth';
import type { RequestHandler } from './$types';

async function getDb(event: any) {
  const { userId, client } = await getAuth(event);
  return { userId, db: (client ?? supabase) as any };
}

const getOwned = async (id: string, userId: string, db: any) => {
  const { data } = await db.from('prompts').select('id, user_id').eq('id', id).single();
  return data?.user_id === userId ? data : null;
};

export const PUT: RequestHandler = async (event) => {
  const { userId, db } = await getDb(event);
  if (!userId) return new Response('unauthorized', { status: 401 });

  const owned = await getOwned(event.params.id, userId, db);
  if (!owned) return new Response('not found', { status: 404 });

  const { title, content } = await event.request.json() as { title?: string; content?: string };
  if (!title?.trim() && !content?.trim()) return new Response('no changes', { status: 400 });

  const update: Record<string, string> = {};
  if (title?.trim()) update.title = title.trim();
  if (content?.trim()) update.content = content.trim();

  const { data, error } = await db.from('prompts').update(update).eq('id', event.params.id).select('id, title, content, created_at').single();
  if (error) return new Response(error.message, { status: 500 });
  return Response.json(data);
};

export const DELETE: RequestHandler = async (event) => {
  const { userId, db } = await getDb(event);
  if (!userId) return new Response('unauthorized', { status: 401 });

  const owned = await getOwned(event.params.id, userId, db);
  if (!owned) return new Response('not found', { status: 404 });

  await db.from('prompts').delete().eq('id', event.params.id);
  return new Response('ok');
};
