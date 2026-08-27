import { useState } from 'react';
import type { Profile } from '../types';
import { currencyToNumber, formatCurrency } from '../helpers/currency';
import logo from '../assets/images/logo.png';

interface Props {
  onFinish: (profile: Profile) => void;
  saving?: boolean;
}

const steps = ['income', 'expenses', 'profile'] as const;

export function Onboarding({ onFinish, saving = false }: Props) {
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState<Profile['goal']>('stability');

  function advance() {
    if (step < steps.length - 1) setStep(s => s + 1);
    else {
      onFinish({
        income: currencyToNumber(income),
        expenses: currencyToNumber(expenses),
        age: parseInt(age),
        goal,
      });
    }
  }

  const canProceed =
    saving
      ? false
      : step === 0
        ? !!income && currencyToNumber(income) > 0
        : step === 1
          ? !!expenses && currencyToNumber(expenses) > 0
          : !!age && parseInt(age) > 0;

  return (
    <div className="onboarding">
      <div className="onboarding-header">
        <img src={logo} alt="Reserva de Emergência" className="logo" />
        <h1>Reserva de Emergência</h1>
        <p>Seu assistente de reserva de emergência</p>
      </div>

      <div className="onboarding-steps">
        {steps.map((_, i) => (
          <div key={i} className={`step-dot ${i <= step ? 'active' : ''}`} />
        ))}
      </div>

      <div className="onboarding-card">
        {step === 0 && (
          <>
            <h2>Quanto você ganha por mês?</h2>
            <p className="hint">Inclua salário, freelas, ou qualquer renda fixa.</p>
            <div className="input-wrapper">
              <span>R$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="2.500"
                value={income}
                onChange={e => setIncome(formatCurrency(e.target.value))}
                autoFocus
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2>Quanto você gasta por mês?</h2>
            <p className="hint">Aluguel, alimentação, transporte — o essencial mesmo.</p>
            <div className="input-wrapper">
              <span>R$</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="2.000"
                value={expenses}
                onChange={e => setExpenses(formatCurrency(e.target.value))}
                autoFocus
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Mais sobre você</h2>
            <p className="hint">Isso ajuda a calcular o tamanho ideal da sua reserva.</p>
            <div className="input-wrapper">
              <span>Idade</span>
              <input
                type="number"
                min="16"
                max="99"
                placeholder="25"
                value={age}
                onChange={e => setAge(e.target.value)}
                autoFocus
              />
            </div>
            <p className="option-label">Qual seu principal objetivo agora?</p>
            <div className="option-group">
              {([['stability', '🛡️ Segurança'], ['travel', '✈️ Viajar em breve'], ['other', '🎯 Outro objetivo']] as const).map(([val, label]) => (
                <button
                  key={val}
                  className={`option-btn ${goal === val ? 'selected' : ''}`}
                  onClick={() => setGoal(val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          className="btn-primary"
          onClick={advance}
          disabled={!canProceed}
        >
          {saving
            ? 'Salvando…'
            : step < steps.length - 1
              ? 'Continuar →'
              : 'Começar minha reserva 🚀'}
        </button>
      </div>
    </div>
  );
}
