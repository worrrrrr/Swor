import { supabase } from '$lib/supabaseClient';
import { getAuth } from '$lib/serverAuth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const { userId, client } = await getAuth(event);
  if (!userId) return Response.json([]);

  const db = (client ?? supabase) as any;
  const { data } = await db.from('notebooks').select('id, title').eq('user_id', userId).order('created_at', { ascending: false });
  return Response.json(data ?? []);
};
