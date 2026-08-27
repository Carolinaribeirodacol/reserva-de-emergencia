interface Props {
  balance: number;
  target: number;
}

function progressColor(pct: number): string {
  if (pct >= 100) return '#22c55e';
  if (pct >= 66) return '#86efac';
  if (pct >= 33) return '#facc15';
  return '#f87171';
}

export function ProgressBar({ balance, target }: Props) {
  const pct = Math.min(100, Math.round((balance / target) * 100));
  const color = progressColor(pct);
  const remaining = Math.max(0, target - balance);

  return (
    <div className="progress-container">
      <div className="progress-top">
        <span className="progress-label">Progresso da reserva</span>
        <span className="progress-pct" style={{ color }}>{pct}%</span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: color, transition: 'width 0.6s ease, background 0.6s ease' }}
        />
      </div>

      <div className="progress-values">
        <span className="current-value">
          R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} guardados
        </span>
        {remaining > 0 && (
          <span className="remaining-value">
            Faltam R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>
    </div>
  );
}
