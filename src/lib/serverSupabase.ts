import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';

export function createAuthClient(token: string) {
  return createServerClient(
    env.PUBLIC_SUPABASE_URL ?? '',
    env.PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );
}
