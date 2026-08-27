import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltam as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Copie .env.example para .env e preencha com os dados do seu projeto Supabase.',
  );
}

// The anon key is public by design — it ships in the browser bundle.
// What protects the data is the database's Row Level Security, not this key.
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
