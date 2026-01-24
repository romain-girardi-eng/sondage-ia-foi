import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  return createBrowserClient<Database>(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!
  );
}

// Singleton for client-side usage
let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (typeof window === 'undefined') {
    // Server-side: always create new client
    return createClient();
  }

  if (!client) {
    client = createClient();
  }
  return client;
}
