import type { Perfil } from '../types';
import { calcularMeta } from '../hooks/useReserva';

interface Props {
  perfil: Perfil;
  saldo: number;
}

export function PainelMeta({ perfil, saldo }: Props) {
  const { meta, meses, sugestaoMensal } = calcularMeta(perfil);
  const falta = Math.max(0, meta - saldo);
  const mesesRestantes = sugestaoMensal > 0 ? Math.ceil(falta / sugestaoMensal) : 0;

  function formatarBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <div className="painel-meta">
      <h3>Sua meta</h3>
      <div className="painel-grid">
        <div className="painel-item">
          <span className="painel-icon">🎯</span>
          <p className="painel-valor">{formatarBRL(meta)}</p>
          <p className="painel-desc">{meses} meses de segurança</p>
        </div>
        <div className="painel-item">
          <span className="painel-icon">📅</span>
          <p className="painel-valor">{formatarBRL(sugestaoMensal)}</p>
          <p className="painel-desc">sugestão por mês</p>
        </div>
        <div className="painel-item">
          <span className="painel-icon">⏱️</span>
          <p className="painel-valor">{falta === 0 ? '0' : mesesRestantes}</p>
          <p className="painel-desc">{falta === 0 ? 'meta batida!' : `${mesesRestantes === 1 ? 'mês' : 'meses'} p/ bater a meta`}</p>
        </div>
      </div>
    </div>
  );
}
