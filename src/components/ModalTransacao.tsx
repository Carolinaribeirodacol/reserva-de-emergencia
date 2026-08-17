import { useState } from 'react';
import { currencyToNumber, formatCurrency } from '../helpers/currency';

interface Props {
  tipo: 'entrada' | 'saida';
  salvando?: boolean;
  onConfirmar: (valor: number, motivo: string) => void;
  onCancelar: () => void;
}

const motivosEntrada = ['Guardei do salário', 'Economizei no mês', 'Recebi extra', 'Outro'];
const motivosSaida = ['Emergência médica', 'Conserto urgente', 'Perda de renda', 'Outro'];

export function ModalTransacao({ tipo, salvando = false, onConfirmar, onCancelar }: Props) {
  const [valor, setValor] = useState('');
  const [motivo, setMotivo] = useState('');

  const motivos = tipo === 'entrada' ? motivosEntrada : motivosSaida;
  const valorNumerico = currencyToNumber(valor);
  const podeConfirmar = valorNumerico > 0 && !!motivo && !salvando;

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{tipo === 'entrada' ? '💚 Guardei dinheiro' : '🔴 Precisei usar'}</h2>

        <div className="input-wrapper">
          <span>R$</span>
          <input
            type="text"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            value={valor}
            onChange={e => setValor(formatCurrency(e.target.value))}
            autoFocus
          />
        </div>

        <p className="label-objetivo">Qual o motivo?</p>
        <div className="objetivo-options">
          {motivos.map(m => (
            <button
              key={m}
              className={`objetivo-btn ${motivo === m ? 'selecionado' : ''}`}
              onClick={() => setMotivo(m)}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancelar} disabled={salvando}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            disabled={!podeConfirmar}
            onClick={() => onConfirmar(valorNumerico, motivo)}
          >
            {salvando ? 'Salvando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
