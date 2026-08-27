import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AppState, Profile, Transaction } from '../types';

const HISTORY_LIMIT = 30;
const cacheKey = (userId: string) => `reserva-emergencia-cache-v2:${userId}`;

const EMPTY_STATE: AppState = { profile: null, balance: 0, transactions: [] };

function readCache(userId: string): AppState {
  try {
    const saved = localStorage.getItem(cacheKey(userId));
    if (saved) return JSON.parse(saved) as AppState;
  } catch {
    // corrupted cache is no reason to break the app
  }
  return EMPTY_STATE;
}

function writeCache(userId: string, state: AppState) {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(state));
  } catch {
    // storage full or private mode: carry on with the server only
  }
}

export function clearCache(userId: string) {
  try {
    localStorage.removeItem(cacheKey(userId));
  } catch {
    // same as above
  }
}

// ── Business rules (pure, no I/O) ──────────────────────────

function calculateMonths(profile: Profile): number {
  if (profile.age < 30 && profile.goal !== 'stability') return 3;
  if (profile.goal === 'stability') return 6;
  return 4;
}

export function calculateGoal(profile: Profile) {
  const months = calculateMonths(profile);
  const targetAmount = profile.expenses * months;
  const surplus = profile.income - profile.expenses;
  // suggests 20% of income, or 10% at minimum
  const monthlySuggestion = Math.max(profile.income * 0.1, Math.min(surplus * 0.5, profile.income * 0.3));
  return { targetAmount, months, monthlySuggestion };
}

export function generateRecommendation(profile: Profile, balance: number): string {
  const { targetAmount, monthlySuggestion } = calculateGoal(profile);
  const remaining = Math.max(0, targetAmount - balance);
  const percentage = Math.min(100, Math.round((balance / targetAmount) * 100));
  const monthsRemaining = monthlySuggestion > 0 ? Math.ceil(remaining / monthlySuggestion) : 0;

  if (percentage === 100) {
    return '🎉 Parabéns! Você completou sua reserva de emergência! Agora pode pensar em outros objetivos.';
  }
  if (percentage >= 50) {
    return `Você já passou da metade! Faltam R$ ${remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — guardando R$ ${monthlySuggestion.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês, você termina em cerca de ${monthsRemaining} ${monthsRemaining === 1 ? 'mês' : 'meses'}. 💪`;
  }
  if (balance === 0) {
    return `Vamos começar! Sua meta é guardar R$ ${targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Guardando R$ ${monthlySuggestion.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês, você chega lá em ${monthsRemaining} ${monthsRemaining === 1 ? 'mês' : 'meses'}. Qualquer valor já ajuda!`;
  }
  return `Você está em ${percentage}% da meta. Faltam R$ ${remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Continue guardando pelo menos R$ ${monthlySuggestion.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês!`;
}

// ── Database access ────────────────────────────────────────
// Row shapes and query strings mirror the actual Supabase schema
// (supabase/migrations/0001_reserva.sql), which stays in Portuguese.
// Everything past this boundary translates into the English domain model.

type GoalRow = 'estabilidade' | 'viagem' | 'outro';
type TransactionTypeRow = 'entrada' | 'saida';

interface ProfileRow {
  renda: number;
  gastos: number;
  idade: number;
  objetivo: GoalRow;
}

interface TransactionRow {
  id: string;
  tipo: TransactionTypeRow;
  valor: number;
  motivo: string;
  criada_em: string;
}

function goalFromRow(value: GoalRow): Profile['goal'] {
  return value === 'estabilidade' ? 'stability' : value === 'viagem' ? 'travel' : 'other';
}

function goalToRow(value: Profile['goal']): GoalRow {
  return value === 'stability' ? 'estabilidade' : value === 'travel' ? 'viagem' : 'outro';
}

function transactionTypeFromRow(value: TransactionTypeRow): Transaction['type'] {
  return value === 'entrada' ? 'deposit' : 'withdrawal';
}

function transactionTypeToRow(value: Transaction['type']): TransactionTypeRow {
  return value === 'deposit' ? 'entrada' : 'saida';
}

function profileFromRow(row: ProfileRow): Profile {
  return {
    income: Number(row.renda),
    expenses: Number(row.gastos),
    age: row.idade,
    goal: goalFromRow(row.objetivo),
  };
}

function transactionFromRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: transactionTypeFromRow(row.tipo),
    amount: Number(row.valor),
    reason: row.motivo,
    date: new Date(row.criada_em).toLocaleDateString('pt-BR'),
  };
}

/** Fetches everything the screen needs. Rejects if any query fails. */
async function fetchFromServer(): Promise<AppState> {
  // The three queries are independent; nothing is gained by serializing them.
  const [profileRes, balanceRes, transactionsRes] = await Promise.all([
    supabase.from('perfis').select('renda, gastos, idade, objetivo').maybeSingle(),
    supabase.from('saldos').select('saldo').maybeSingle(),
    supabase
      .from('transacoes')
      .select('id, tipo, valor, motivo, criada_em')
      .order('criada_em', { ascending: false })
      .limit(HISTORY_LIMIT),
  ]);

  const failure = profileRes.error ?? balanceRes.error ?? transactionsRes.error;
  if (failure) throw failure;

  const profileRow = profileRes.data as ProfileRow | null;
  return {
    profile: profileRow ? profileFromRow(profileRow) : null,
    balance: Number((balanceRes.data as { saldo: number } | null)?.saldo ?? 0),
    transactions: ((transactionsRes.data ?? []) as TransactionRow[]).map(transactionFromRow),
  };
}

export function useEmergencyFund(userId: string) {
  const [state, setState] = useState<AppState>(() => readCache(userId));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Manual bump to redo the fetch (the "try again" button).
  const [attempt, setAttempt] = useState(0);

  // The initial state already comes from the cache (useState above); here we
  // just sync with the server. `alive` prevents a delayed response from
  // overwriting state after the component unmounted or the user switched.
  useEffect(() => {
    let alive = true;

    fetchFromServer()
      .then(newState => {
        if (!alive) return;
        setState(newState);
        setError('');
        setLoading(false);
        writeCache(userId, newState);
      })
      .catch(() => {
        if (!alive) return;
        setError('Não foi possível carregar seus dados. Verifique sua conexão.');
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [userId, attempt]);

  async function saveProfile(profile: Profile): Promise<boolean> {
    setSaving(true);
    setError('');

    const { error } = await supabase.from('perfis').upsert(
      {
        user_id: userId,
        renda: profile.income,
        gastos: profile.expenses,
        idade: profile.age,
        objetivo: goalToRow(profile.goal),
      },
      { onConflict: 'user_id' },
    );

    setSaving(false);

    if (error) {
      setError('Não foi possível salvar seu perfil. Tente de novo.');
      return false;
    }

    setState(s => {
      const next = { ...s, profile };
      writeCache(userId, next);
      return next;
    });
    return true;
  }

  async function addTransaction(
    type: Transaction['type'],
    amount: number,
    reason: string,
  ): Promise<boolean> {
    // The app has never shown a negative balance. Since the balance is now
    // the sum of transactions, the cap has to apply at the entry point —
    // otherwise the sum in the database would diverge from what the screen shows.
    const finalAmount = type === 'withdrawal' ? Math.min(amount, state.balance) : amount;

    if (finalAmount <= 0) {
      setError('Você não tem saldo guardado para registrar essa saída.');
      return false;
    }

    setSaving(true);
    setError('');

    const { data, error } = await supabase
      .from('transacoes')
      .insert({
        user_id: userId,
        tipo: transactionTypeToRow(type),
        valor: finalAmount,
        motivo: reason,
      })
      .select('id, tipo, valor, motivo, criada_em')
      .single();

    setSaving(false);

    if (error || !data) {
      setError('Não foi possível registrar a movimentação. Tente de novo.');
      return false;
    }

    const transaction = transactionFromRow(data as TransactionRow);
    setState(s => {
      const next: AppState = {
        ...s,
        balance: type === 'deposit' ? s.balance + finalAmount : Math.max(0, s.balance - finalAmount),
        transactions: [transaction, ...s.transactions].slice(0, HISTORY_LIMIT),
      };
      writeCache(userId, next);
      return next;
    });
    return true;
  }

  async function reset(): Promise<boolean> {
    setSaving(true);
    setError('');

    // Deleting the profile doesn't delete the transactions (there's no FK
    // between them), so the two deletions are explicit.
    const transactionsRes = await supabase.from('transacoes').delete().eq('user_id', userId);
    const profileRes = await supabase.from('perfis').delete().eq('user_id', userId);

    setSaving(false);

    if (transactionsRes.error || profileRes.error) {
      setError('Não foi possível recomeçar. Tente de novo.');
      return false;
    }

    setState(EMPTY_STATE);
    writeCache(userId, EMPTY_STATE);
    return true;
  }

  return {
    state,
    loading,
    saving,
    error,
    clearError: () => setError(''),
    reload: () => {
      setLoading(true);
      setAttempt(a => a + 1);
    },
    saveProfile,
    addTransaction,
    reset,
  };
}
