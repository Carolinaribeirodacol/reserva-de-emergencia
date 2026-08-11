import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Tema = 'light' | 'dark';

export const CHAVE_TEMA = 'tema';

function ehTema(valor: unknown): valor is Tema {
  return valor === 'light' || valor === 'dark';
}

export function lerTemaSalvo(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE_TEMA);
    if (ehTema(salvo)) return salvo;
  } catch {
    // modo privado / storage bloqueado
  }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function aplicarTema(tema: Tema) {
  const raiz = document.documentElement;
  raiz.classList.toggle('dark-theme', tema === 'dark');
  raiz.classList.toggle('light-theme', tema === 'light');
}

export function useTema(sessao: Session | null) {
  const [temaLocal, setTemaLocal] = useState<Tema>(lerTemaSalvo);

  // O tema da conta (se houver) ganha do local: é a preferência que o
  // usuário salvou e que deve segui-lo entre dispositivos.
  const temaDaConta = sessao?.user.user_metadata?.theme;
  const tema: Tema = ehTema(temaDaConta) ? temaDaConta : temaLocal;

  // Efeito só escreve em sistemas externos (DOM e localStorage), nunca em
  // estado do React — inclusive por isso o tema da conta é derivado acima
  // em vez de virar um setState aqui dentro.
  useEffect(() => {
    aplicarTema(tema);
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch {
      // idem
    }
  }, [tema]);

  function alternarTema() {
    const novo: Tema = tema === 'dark' ? 'light' : 'dark';
    setTemaLocal(novo);

    // Logado, a preferência sobe junto com o usuário. Não esperamos a
    // resposta: a troca é visual e imediata; se a rede falhar, o tema
    // continua valendo neste aparelho pelo localStorage.
    if (sessao) {
      supabase.auth.updateUser({ data: { theme: novo } });
    }
  }

  return { tema, alternarTema };
}
