import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Estado, Perfil, Transacao } from '../types';

const LIMITE_HISTORICO = 30;
const cacheKey = (userId: string) => `reserva-emergencia-cache-v2:${userId}`;

const ESTADO_VAZIO: Estado = { perfil: null, saldo: 0, transacoes: [] };

function lerCache(userId: string): Estado {
  try {
    const salvo = localStorage.getItem(cacheKey(userId));
    if (salvo) return JSON.parse(salvo) as Estado;
  } catch {
    // cache corrompido não é motivo para quebrar o app
  }
  return ESTADO_VAZIO;
}

function escreverCache(userId: string, estado: Estado) {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(estado));
  } catch {
    // quota cheia ou modo privado: seguimos só com o servidor
  }
}

export function limparCache(userId: string) {
  try {
    localStorage.removeItem(cacheKey(userId));
  } catch {
    // idem
  }
}

// ── Regras de negócio (puras, sem I/O) ────────────────────

function calcularMeses(perfil: Perfil): number {
  if (perfil.idade < 30 && perfil.objetivo !== 'estabilidade') return 3;
  if (perfil.objetivo === 'estabilidade') return 6;
  return 4;
}

export function calcularMeta(perfil: Perfil) {
  const meses = calcularMeses(perfil);
  const meta = perfil.gastos * meses;
  const sobra = perfil.renda - perfil.gastos;
  // sugere 20% da renda ou 10% no mínimo
  const sugestaoMensal = Math.max(perfil.renda * 0.1, Math.min(sobra * 0.5, perfil.renda * 0.3));
  return { meta, meses, sugestaoMensal };
}

export function gerarRecomendacao(perfil: Perfil, saldo: number): string {
  const { meta, sugestaoMensal } = calcularMeta(perfil);
  const falta = Math.max(0, meta - saldo);
  const porcentagem = Math.min(100, Math.round((saldo / meta) * 100));
  const mesesRestantes = sugestaoMensal > 0 ? Math.ceil(falta / sugestaoMensal) : 0;

  if (porcentagem === 100) {
    return '🎉 Parabéns! Você completou sua reserva de emergência! Agora pode pensar em outros objetivos.';
  }
  if (porcentagem >= 50) {
    return `Você já passou da metade! Faltam R$ ${falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — guardando R$ ${sugestaoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês, você termina em cerca de ${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}. 💪`;
  }
  if (saldo === 0) {
    return `Vamos começar! Sua meta é guardar R$ ${meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Guardando R$ ${sugestaoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês, você chega lá em ${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}. Qualquer valor já ajuda!`;
  }
  return `Você está em ${porcentagem}% da meta. Faltam R$ ${falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Continue guardando pelo menos R$ ${sugestaoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês!`;
}

// ── Acesso ao banco ───────────────────────────────────────

interface LinhaPerfil {
  renda: number;
  gastos: number;
  idade: number;
  objetivo: Perfil['objetivo'];
}

interface LinhaTransacao {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  motivo: string;
  criada_em: string;
}

function paraTransacao(linha: LinhaTransacao): Transacao {
  return {
    id: linha.id,
    tipo: linha.tipo,
    valor: Number(linha.valor),
    motivo: linha.motivo,
    data: new Date(linha.criada_em).toLocaleDateString('pt-BR'),
  };
}

/** Busca tudo o que a tela precisa. Rejeita se qualquer consulta falhar. */
async function buscarDoServidor(): Promise<Estado> {
  // As três consultas são independentes; nada ganha em serializá-las.
  const [perfilRes, saldoRes, transacoesRes] = await Promise.all([
    supabase.from('perfis').select('renda, gastos, idade, objetivo').maybeSingle(),
    supabase.from('saldos').select('saldo').maybeSingle(),
    supabase
      .from('transacoes')
      .select('id, tipo, valor, motivo, criada_em')
      .order('criada_em', { ascending: false })
      .limit(LIMITE_HISTORICO),
  ]);

  const falha = perfilRes.error ?? saldoRes.error ?? transacoesRes.error;
  if (falha) throw falha;

  const linhaPerfil = perfilRes.data as LinhaPerfil | null;
  return {
    perfil: linhaPerfil
      ? {
          renda: Number(linhaPerfil.renda),
          gastos: Number(linhaPerfil.gastos),
          idade: linhaPerfil.idade,
          objetivo: linhaPerfil.objetivo,
        }
      : null,
    saldo: Number((saldoRes.data as { saldo: number } | null)?.saldo ?? 0),
    transacoes: ((transacoesRes.data ?? []) as LinhaTransacao[]).map(paraTransacao),
  };
}

export function useReserva(userId: string) {
  const [estado, setEstado] = useState<Estado>(() => lerCache(userId));
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  // Bump manual para refazer a busca (botão "tentar de novo").
  const [tentativa, setTentativa] = useState(0);

  // O estado inicial já sai do cache (useState acima); aqui só sincronizamos
  // com o servidor. O `vivo` evita que uma resposta atrasada sobrescreva o
  // estado depois que o componente saiu de cena ou que o usuário trocou.
  useEffect(() => {
    let vivo = true;

    buscarDoServidor()
      .then(novoEstado => {
        if (!vivo) return;
        setEstado(novoEstado);
        setErro('');
        setCarregando(false);
        escreverCache(userId, novoEstado);
      })
      .catch(() => {
        if (!vivo) return;
        setErro('Não foi possível carregar seus dados. Verifique sua conexão.');
        setCarregando(false);
      });

    return () => {
      vivo = false;
    };
  }, [userId, tentativa]);

  async function salvarPerfil(perfil: Perfil): Promise<boolean> {
    setSalvando(true);
    setErro('');

    const { error } = await supabase
      .from('perfis')
      .upsert({ user_id: userId, ...perfil }, { onConflict: 'user_id' });

    setSalvando(false);

    if (error) {
      setErro('Não foi possível salvar seu perfil. Tente de novo.');
      return false;
    }

    setEstado(e => {
      const novo = { ...e, perfil };
      escreverCache(userId, novo);
      return novo;
    });
    return true;
  }

  async function adicionarTransacao(
    tipo: 'entrada' | 'saida',
    valor: number,
    motivo: string,
  ): Promise<boolean> {
    // O app nunca mostrou saldo negativo. Como agora o saldo é a soma das
    // transações, o limite tem que valer no lançamento — senão a soma no
    // banco divergiria do que a tela mostra.
    const valorFinal = tipo === 'saida' ? Math.min(valor, estado.saldo) : valor;

    if (valorFinal <= 0) {
      setErro('Você não tem saldo guardado para registrar essa saída.');
      return false;
    }

    setSalvando(true);
    setErro('');

    const { data, error } = await supabase
      .from('transacoes')
      .insert({ user_id: userId, tipo, valor: valorFinal, motivo })
      .select('id, tipo, valor, motivo, criada_em')
      .single();

    setSalvando(false);

    if (error || !data) {
      setErro('Não foi possível registrar a movimentação. Tente de novo.');
      return false;
    }

    const transacao = paraTransacao(data as LinhaTransacao);
    setEstado(e => {
      const novo: Estado = {
        ...e,
        saldo: tipo === 'entrada' ? e.saldo + valorFinal : Math.max(0, e.saldo - valorFinal),
        transacoes: [transacao, ...e.transacoes].slice(0, LIMITE_HISTORICO),
      };
      escreverCache(userId, novo);
      return novo;
    });
    return true;
  }

  async function resetar(): Promise<boolean> {
    setSalvando(true);
    setErro('');

    // Apagar o perfil não apaga as transações (não há FK entre eles),
    // então as duas exclusões são explícitas.
    const transacoesRes = await supabase.from('transacoes').delete().eq('user_id', userId);
    const perfilRes = await supabase.from('perfis').delete().eq('user_id', userId);

    setSalvando(false);

    if (transacoesRes.error || perfilRes.error) {
      setErro('Não foi possível recomeçar. Tente de novo.');
      return false;
    }

    setEstado(ESTADO_VAZIO);
    escreverCache(userId, ESTADO_VAZIO);
    return true;
  }

  return {
    estado,
    carregando,
    salvando,
    erro,
    limparErro: () => setErro(''),
    recarregar: () => {
      setCarregando(true);
      setTentativa(t => t + 1);
    },
    salvarPerfil,
    adicionarTransacao,
    resetar,
  };
}
