import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useSessao() {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregando(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((evento, novaSessao) => {
      setSessao(novaSessao);
      setCarregando(false);
      if (evento === 'PASSWORD_RECOVERY') setRecuperandoSenha(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    sessao,
    carregando,
    recuperandoSenha,
    concluirRecuperacao: () => setRecuperandoSenha(false),
  };
}
