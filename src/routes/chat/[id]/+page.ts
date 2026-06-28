import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  return {
    session: session || null,
    sessionId: params.id,
  };
};
