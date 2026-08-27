import type { Transaction } from '../types';

interface Props {
  message: string;
  transactions: Transaction[];
}

export function Recommendation({ message, transactions }: Props) {
  return (
    <>
      <div className="recommendation">
        <span className="recommendation-icon">🤖</span>
        <p>{message}</p>
      </div>

      {transactions.length > 0 && (
        <div className="history">
          <h3>Últimas movimentações</h3>
          <ul>
            {transactions.slice(0, 5).map(t => (
              <li key={t.id} className={`history-item ${t.type}`}>
                <span className="history-icon">{t.type === 'deposit' ? '↑' : '↓'}</span>
                <div className="history-info">
                  <span className="history-reason">{t.reason}</span>
                  <span className="history-date">{t.date}</span>
                </div>
                <span className="history-amount">
                  {t.type === 'deposit' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
