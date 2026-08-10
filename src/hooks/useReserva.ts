import { useState, useEffect } from 'react';
import type { Estado, Perfil, Transacao } from '../types';

const CHAVE = 'reserva-emergencia-v1';

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

function estadoInicial(): Estado {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) return JSON.parse(salvo);
  } catch {
    // ignore parse errors
  }
  return { perfil: null, saldo: 0, transacoes: [] };
}

export function useReserva() {
  const [estado, setEstado] = useState<Estado>(estadoInicial);

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  }, [estado]);

  function salvarPerfil(perfil: Perfil) {
    setEstado(e => ({ ...e, perfil }));
  }

  function adicionarTransacao(tipo: 'entrada' | 'saida', valor: number, motivo: string) {
    const transacao: Transacao = {
      id: crypto.randomUUID(),
      tipo,
      valor,
      motivo,
      data: new Date().toLocaleDateString('pt-BR'),
    };
    setEstado(e => ({
      ...e,
      saldo: tipo === 'entrada' ? e.saldo + valor : Math.max(0, e.saldo - valor),
      transacoes: [transacao, ...e.transacoes].slice(0, 30),
    }));
  }

  function resetar() {
    setEstado({ perfil: null, saldo: 0, transacoes: [] });
  }

  return { estado, salvarPerfil, adicionarTransacao, resetar };
}
