import { supabase } from '$lib/supabaseClient';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const notebook_id = url.searchParams.get('notebook_id');
  if (!notebook_id) return new Response('missing notebook_id', { status: 400 });

  const { data: sources } = await supabase
    .from('notebook_sources')
    .select('*')
    .eq('notebook_id', notebook_id)
    .order('created_at', { ascending: true });

  return Response.json(sources ?? []);
};

export const POST: RequestHandler = async ({ request }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });

  const { notebook_id, title, content, source_type } = await request.json() as {
    notebook_id: string;
    title: string;
    content: string;
    source_type?: string;
  };

  if (!notebook_id || !title?.trim() || !content?.trim()) {
    return new Response('missing fields', { status: 400 });
  }

  const { data: source, error } = await supabase
    .from('notebook_sources')
    .insert({ notebook_id, title: title.trim(), content: content.trim(), source_type: source_type || 'text' })
    .select('*')
    .single();

  if (error) return new Response(error.message, { status: 500 });

  return Response.json(source, { status: 201 });
};

export const DELETE: RequestHandler = async ({ url }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });

  const id = url.searchParams.get('id');
  if (!id) return new Response('missing id', { status: 400 });

  await supabase.from('notebook_sources').delete().eq('id', id);
  return new Response('ok');
};
