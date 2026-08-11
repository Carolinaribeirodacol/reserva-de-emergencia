import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Sessão do usuário logado. `carregando` cobre o intervalo entre o boot e a
 * resposta do getSession() — sem ele, a tela de login pisca antes da sessão
 * salva ser recuperada.
 */
export function useSessao() {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregando(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
      setCarregando(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { sessao, carregando };
}
