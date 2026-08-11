import { useState } from 'react';
import './App.css';
import { supabase } from './lib/supabase';
import { useSessao } from './hooks/useSessao';
import { useReserva, calcularMeta, gerarRecomendacao, limparCache } from './hooks/useReserva';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { BarraProgresso } from './components/BarraProgresso';
import { PainelMeta } from './components/PainelMeta';
import { ModalTransacao } from './components/ModalTransacao';
import { Recomendacao } from './components/Recomendacao';
import { ThemeSwitch } from './components/ThemeSwitch';

function App() {
  const { sessao, carregando } = useSessao();

  if (carregando) {
    return <div className="tela-carregando">Carregando…</div>;
  }

  if (!sessao) {
    return <Auth />;
  }

  // A key garante que todo o estado seja recriado ao trocar de usuário.
  return <AppLogado key={sessao.user.id} userId={sessao.user.id} />;
}

function AppLogado({ userId }: { userId: string }) {
  const {
    estado,
    carregando,
    salvando,
    erro,
    limparErro,
    recarregar,
    salvarPerfil,
    adicionarTransacao,
    resetar,
  } = useReserva(userId);
  const [modal, setModal] = useState<'entrada' | 'saida' | null>(null);

  async function sair() {
    limparCache(userId);
    await supabase.auth.signOut();
  }

  async function recomecar() {
    if (!confirm('Isso apaga seu perfil e todo o histórico, para sempre. Continuar?')) return;
    await resetar();
  }

  const cabecalho = (
    <header className="app-header">
      <span className="logo">💰</span>
      <h1>Guarda Certo</h1>
      <ThemeSwitch theme="light">☀️</ThemeSwitch>
      <ThemeSwitch theme="dark">🌙</ThemeSwitch>
      <button className="btn-reset" onClick={recomecar} title="Recomeçar" disabled={salvando}>
        ↺
      </button>
      <button className="btn-reset" onClick={sair} title="Sair da conta">
        ⎋
      </button>
    </header>
  );

  const avisoErro = erro && (
    <div className="mensagem-erro banner-erro">
      <span>{erro}</span>
      <button
        className="btn-link"
        onClick={() => {
          limparErro();
          recarregar();
        }}
      >
        tentar de novo
      </button>
    </div>
  );

  // Sem perfil e ainda carregando, mostrar o onboarding seria um falso
  // negativo — o perfil pode estar a caminho do servidor.
  if (carregando && !estado.perfil) {
    return (
      <div className="app">
        {cabecalho}
        <main className="app-main">
          {avisoErro}
          <p className="dica">Carregando seus dados…</p>
        </main>
      </div>
    );
  }

  if (!estado.perfil) {
    return (
      <>
        {avisoErro}
        <Onboarding onConcluir={salvarPerfil} salvando={salvando} />
      </>
    );
  }

  const { meta } = calcularMeta(estado.perfil);
  const recomendacao = gerarRecomendacao(estado.perfil, estado.saldo);

  async function confirmarTransacao(valor: number, motivo: string) {
    const ok = await adicionarTransacao(modal!, valor, motivo);
    if (ok) setModal(null);
  }

  return (
    <div className="app">
      {cabecalho}

      <main className="app-main">
        {avisoErro}

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
          salvando={salvando}
          onConfirmar={confirmarTransacao}
          onCancelar={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default App;
