import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '$lib/supabaseClient';
import { env } from '$env/dynamic/public';
import type { RequestEvent } from '@sveltejs/kit';

export interface AuthResult {
  userId: string | null;
  client?: SupabaseClient<any, 'public', any>;
}

export async function getAuth(event?: RequestEvent): Promise<AuthResult> {
  let token: string | null = null;

  if (event?.request) {
    const auth = event.request.headers.get('authorization');
    token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  }

  if (!token) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return { userId: user.id };
    return { userId: null };
  }

  const tempo: SupabaseClient<any, 'public', any> = createClient(
    env.PUBLIC_SUPABASE_URL ?? '',
    env.PUBLIC_SUPABASE_ANON_KEY ?? '',
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user } } = await tempo.auth.getUser(token);
  if (!user?.id) return { userId: null };

  return { userId: user.id, client: tempo };
}
