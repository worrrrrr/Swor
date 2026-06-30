import { supabase } from '$lib/supabaseClient';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { slug } = await request.json() as { slug: string };
  if (!slug) return new Response('missing slug', { status: 400 });

  const { data: post } = await supabase.from('posts').select('views').eq('slug', slug).single();
  const views = (post?.views || 0) + 1;
  await supabase.from('posts').update({ views }).eq('slug', slug);

  return Response.json({ views });
};
