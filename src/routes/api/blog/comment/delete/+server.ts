import { supabase } from '$lib/supabaseClient';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });

  const { id } = await request.json() as { id: string };
  if (!id) return new Response('missing id', { status: 400 });

  const { data: comment } = await supabase.from('comments').select('user_id').eq('id', id).single();
  if (!comment) return new Response('not found', { status: 404 });
  if (comment.user_id !== user.id) return new Response('forbidden', { status: 403 });

  await supabase.from('comments').delete().eq('id', id);

  return new Response('ok');
};
