import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Client Supabase — Auth / Database / Realtime.
 * Les variables d'environnement sont des placeholders tant que le projet
 * Supabase n'est pas provisionné (Phase 2). Le client est créé de façon
 * paresseuse pour ne jamais faire échouer le build en attendant.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || supabaseUrl.startsWith('PLACEHOLDER')) {
    throw new Error(
      'Supabase non configuré : renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local'
    );
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}
