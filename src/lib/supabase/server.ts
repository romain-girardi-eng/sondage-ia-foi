import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const isServiceRoleConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  );
}

// Service role client for admin operations
export function createServiceRoleClient() {
  if (!isServiceRoleConfigured) {
    return null;
  }

  return createClient<Database>(
    SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
