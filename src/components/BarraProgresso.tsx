interface Props {
  saldo: number;
  meta: number;
}

function corProgresso(pct: number): string {
  if (pct >= 100) return '#22c55e';
  if (pct >= 66) return '#86efac';
  if (pct >= 33) return '#facc15';
  return '#f87171';
}

export function BarraProgresso({ saldo, meta }: Props) {
  const pct = Math.min(100, Math.round((saldo / meta) * 100));
  const cor = corProgresso(pct);
  const falta = Math.max(0, meta - saldo);

  return (
    <div className="barra-container">
      <div className="barra-topo">
        <span className="barra-label">Progresso da reserva</span>
        <span className="barra-pct" style={{ color: cor }}>{pct}%</span>
      </div>

      <div className="barra-track">
        <div
          className="barra-fill"
          style={{ width: `${pct}%`, background: cor, transition: 'width 0.6s ease, background 0.6s ease' }}
        />
      </div>

      <div className="barra-valores">
        <span className="valor-atual">
          R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} guardados
        </span>
        {falta > 0 && (
          <span className="valor-falta">
            Faltam R$ {falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>
    </div>
  );
}
