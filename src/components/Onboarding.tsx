import { useState } from 'react';
import type { Perfil } from '../types';

interface Props {
  onConcluir: (perfil: Perfil) => void;
}

const passos = ['renda', 'gastos', 'perfil'] as const;

export function Onboarding({ onConcluir }: Props) {
  const [passo, setPasso] = useState(0);
  const [renda, setRenda] = useState('');
  const [gastos, setGastos] = useState('');
  const [idade, setIdade] = useState('');
  const [objetivo, setObjetivo] = useState<Perfil['objetivo']>('estabilidade');

  function avancar() {
    if (passo < passos.length - 1) setPasso(p => p + 1);
    else {
      onConcluir({
        renda: parseFloat(renda.replace(',', '.')),
        gastos: parseFloat(gastos.replace(',', '.')),
        idade: parseInt(idade),
        objetivo,
      });
    }
  }

  const podeContinuar =
    passo === 0 ? !!renda && parseFloat(renda) > 0 :
    passo === 1 ? !!gastos && parseFloat(gastos) > 0 :
    !!idade && parseInt(idade) > 0;

  return (
    <div className="onboarding">
      <div className="onboarding-header">
        <span className="logo">💰</span>
        <h1>Guarda Certo</h1>
        <p>Seu assistente de reserva de emergência</p>
      </div>

      <div className="onboarding-steps">
        {passos.map((_, i) => (
          <div key={i} className={`step-dot ${i <= passo ? 'ativo' : ''}`} />
        ))}
      </div>

      <div className="onboarding-card">
        {passo === 0 && (
          <>
            <h2>Quanto você ganha por mês?</h2>
            <p className="dica">Inclua salário, freelas, ou qualquer renda fixa.</p>
            <div className="input-wrapper">
              <span>R$</span>
              <input
                type="number"
                min="0"
                placeholder="2.500"
                value={renda}
                onChange={e => setRenda(e.target.value)}
                autoFocus
              />
            </div>
          </>
        )}

        {passo === 1 && (
          <>
            <h2>Quanto você gasta por mês?</h2>
            <p className="dica">Aluguel, alimentação, transporte — o essencial mesmo.</p>
            <div className="input-wrapper">
              <span>R$</span>
              <input
                type="number"
                min="0"
                placeholder="2.000"
                value={gastos}
                onChange={e => setGastos(e.target.value)}
                autoFocus
              />
            </div>
          </>
        )}

        {passo === 2 && (
          <>
            <h2>Mais sobre você</h2>
            <p className="dica">Isso ajuda a calcular o tamanho ideal da sua reserva.</p>
            <div className="input-wrapper">
              <span>Idade</span>
              <input
                type="number"
                min="16"
                max="99"
                placeholder="25"
                value={idade}
                onChange={e => setIdade(e.target.value)}
                autoFocus
              />
            </div>
            <p className="label-objetivo">Qual seu principal objetivo agora?</p>
            <div className="objetivo-options">
              {([['estabilidade', '🛡️ Segurança'], ['viagem', '✈️ Viajar em breve'], ['outro', '🎯 Outro objetivo']] as const).map(([val, label]) => (
                <button
                  key={val}
                  className={`objetivo-btn ${objetivo === val ? 'selecionado' : ''}`}
                  onClick={() => setObjetivo(val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          className="btn-primary"
          onClick={avancar}
          disabled={!podeContinuar}
        >
          {passo < passos.length - 1 ? 'Continuar →' : 'Começar minha reserva 🚀'}
        </button>
      </div>
    </div>
  );
}
