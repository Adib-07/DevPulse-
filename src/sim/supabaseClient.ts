import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// During local dev without env configured, fall back to a null-ish client
// so the app keeps working as an in-memory demo. In the Bolt preview the
// vars are pre-populated and a real client is returned. Wrap in try/catch
// so a malformed env var never crashes the app — persistence is optional.
let client = null;
if (url && anonKey) {
  try {
    client = createClient(url, anonKey, { auth: { persistSession: false } });
  } catch (err) {
    console.error('Failed to initialize Supabase client — running without persistence:', err);
  }
}

export const supabase = client;
export const persistenceEnabled = supabase !== null;
