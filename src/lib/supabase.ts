import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltam as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Copie .env.example para .env e preencha com os dados do seu projeto Supabase.',
  );
}

// A chave anon é pública por design — ela vai no bundle do navegador.
// Quem protege os dados é o Row Level Security do banco, não essa chave.
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
