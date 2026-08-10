import type { Transacao } from '../types';

interface Props {
  mensagem: string;
  transacoes: Transacao[];
}

export function Recomendacao({ mensagem, transacoes }: Props) {
  return (
    <>
      <div className="recomendacao">
        <span className="recomendacao-icon">🤖</span>
        <p>{mensagem}</p>
      </div>

      {transacoes.length > 0 && (
        <div className="historico">
          <h3>Últimas movimentações</h3>
          <ul>
            {transacoes.slice(0, 5).map(t => (
              <li key={t.id} className={`historico-item ${t.tipo}`}>
                <span className="historico-icon">{t.tipo === 'entrada' ? '↑' : '↓'}</span>
                <div className="historico-info">
                  <span className="historico-motivo">{t.motivo}</span>
                  <span className="historico-data">{t.data}</span>
                </div>
                <span className="historico-valor">
                  {t.tipo === 'entrada' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
