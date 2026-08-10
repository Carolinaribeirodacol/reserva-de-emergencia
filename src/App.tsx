import { useState } from 'react';
import './App.css';
import { useReserva, calcularMeta, gerarRecomendacao } from './hooks/useReserva';
import { Onboarding } from './components/Onboarding';
import { BarraProgresso } from './components/BarraProgresso';
import { PainelMeta } from './components/PainelMeta';
import { ModalTransacao } from './components/ModalTransacao';
import { Recomendacao } from './components/Recomendacao';

function App() {
  const { estado, salvarPerfil, adicionarTransacao, resetar } = useReserva();
  const [modal, setModal] = useState<'entrada' | 'saida' | null>(null);

  if (!estado.perfil) {
    return <Onboarding onConcluir={salvarPerfil} />;
  }

  const { meta } = calcularMeta(estado.perfil);
  const recomendacao = gerarRecomendacao(estado.perfil, estado.saldo);

  function confirmarTransacao(valor: number, motivo: string) {
    adicionarTransacao(modal!, valor, motivo);
    setModal(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="logo">💰</span>
        <h1>Guarda Certo</h1>
        <button className="btn-reset" onClick={resetar} title="Recomeçar">↺</button>
      </header>

      <main className="app-main">
        <BarraProgresso saldo={estado.saldo} meta={meta} />
        <PainelMeta perfil={estado.perfil} saldo={estado.saldo} />

        <div className="acoes">
          <button className="btn-entrada" onClick={() => setModal('entrada')}>
            + Guardei dinheiro
          </button>
          <button className="btn-saida" onClick={() => setModal('saida')}>
            − Precisei usar
          </button>
        </div>

        <Recomendacao mensagem={recomendacao} transacoes={estado.transacoes} />
      </main>

      {modal && (
        <ModalTransacao
          tipo={modal}
          onConfirmar={confirmarTransacao}
          onCancelar={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default App;
