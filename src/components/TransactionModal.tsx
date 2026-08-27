import { useState } from 'react';
import { currencyToNumber, formatCurrency } from '../helpers/currency';

interface Props {
  type: 'deposit' | 'withdrawal';
  saving?: boolean;
  onConfirm: (amount: number, reason: string) => void;
  onCancel: () => void;
}

const depositReasons = ['Guardei do salário', 'Economizei no mês', 'Recebi extra', 'Outro'];
const withdrawalReasons = ['Emergência médica', 'Conserto urgente', 'Perda de renda', 'Outro'];

export function TransactionModal({ type, saving = false, onConfirm, onCancel }: Props) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const reasons = type === 'deposit' ? depositReasons : withdrawalReasons;
  const numericAmount = currencyToNumber(amount);
  const canConfirm = numericAmount > 0 && !!reason && !saving;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{type === 'deposit' ? '💚 Guardei dinheiro' : '🔴 Precisei usar'}</h2>

        <div className="input-wrapper">
          <span>R$</span>
          <input
            type="text"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            value={amount}
            onChange={e => setAmount(formatCurrency(e.target.value))}
            autoFocus
          />
        </div>

        <p className="option-label">Qual o motivo?</p>
        <div className="option-group">
          {reasons.map(r => (
            <button
              key={r}
              className={`option-btn ${reason === r ? 'selected' : ''}`}
              onClick={() => setReason(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            disabled={!canConfirm}
            onClick={() => onConfirm(numericAmount, reason)}
          >
            {saving ? 'Salvando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
