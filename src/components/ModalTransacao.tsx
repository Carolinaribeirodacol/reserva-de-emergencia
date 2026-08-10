import { useState } from 'react';

interface Props {
  tipo: 'entrada' | 'saida';
  onConfirmar: (valor: number, motivo: string) => void;
  onCancelar: () => void;
}

const motivosEntrada = ['Guardei do salário', 'Economizei no mês', 'Recebi extra', 'Outro'];
const motivosSaida = ['Emergência médica', 'Conserto urgente', 'Perda de renda', 'Outro'];

export function ModalTransacao({ tipo, onConfirmar, onCancelar }: Props) {
  const [valor, setValor] = useState('');
  const [motivo, setMotivo] = useState('');

  const motivos = tipo === 'entrada' ? motivosEntrada : motivosSaida;
  const podeConfirmar = !!valor && parseFloat(valor) > 0 && !!motivo;

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{tipo === 'entrada' ? '💚 Guardei dinheiro' : '🔴 Precisei usar'}</h2>

        <div className="input-wrapper">
          <span>R$</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            value={valor}
            onChange={e => setValor(e.target.value)}
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
          <button className="btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button
            className="btn-primary"
            disabled={!podeConfirmar}
            onClick={() => onConfirmar(parseFloat(valor), motivo)}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
