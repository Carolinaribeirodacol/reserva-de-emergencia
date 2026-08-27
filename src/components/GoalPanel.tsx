import type { Profile } from '../types';
import { calculateGoal } from '../hooks/useEmergencyFund';

interface Props {
  profile: Profile;
  balance: number;
}

export function GoalPanel({ profile, balance }: Props) {
  const { targetAmount, months, monthlySuggestion } = calculateGoal(profile);
  const remaining = Math.max(0, targetAmount - balance);
  const monthsRemaining = monthlySuggestion > 0 ? Math.ceil(remaining / monthlySuggestion) : 0;

  function formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <div className="goal-panel">
      <h3>Sua meta</h3>
      <div className="goal-grid">
        <div className="goal-item">
          <span className="goal-icon">🎯</span>
          <p className="goal-value">{formatBRL(targetAmount)}</p>
          <p className="goal-desc">{months} meses de segurança</p>
        </div>
        <div className="goal-item">
          <span className="goal-icon">📅</span>
          <p className="goal-value">{formatBRL(monthlySuggestion)}</p>
          <p className="goal-desc">sugestão por mês</p>
        </div>
        <div className="goal-item">
          <span className="goal-icon">⏱️</span>
          <p className="goal-value">{remaining === 0 ? '0' : monthsRemaining}</p>
          <p className="goal-desc">{remaining === 0 ? 'meta batida!' : `${monthsRemaining === 1 ? 'mês' : 'meses'} p/ bater a meta`}</p>
        </div>
      </div>
    </div>
  );
}
