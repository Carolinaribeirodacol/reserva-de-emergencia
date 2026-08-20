import { useState } from 'react';
import './App.css';
import { supabase } from './lib/supabase';
import { useSessao } from './hooks/useSessao';
import { useTema, type Tema } from './hooks/useTema';
import { useReserva, calcularMeta, gerarRecomendacao, limparCache } from './hooks/useReserva';
import { Auth } from './components/Auth';
import { RedefinirSenha } from './components/RedefinirSenha';
import { Onboarding } from './components/Onboarding';
import { BarraProgresso } from './components/BarraProgresso';
import { PainelMeta } from './components/PainelMeta';
import { ModalTransacao } from './components/ModalTransacao';
import { ModalConfirmacao } from './components/ModalConfirmacao';
import { Recomendacao } from './components/Recomendacao';
import { Anuncio } from './components/Anuncio';
import { ThemeSwitch } from './components/ThemeSwitch';

function App() {
  const { sessao, carregando, recuperandoSenha, concluirRecuperacao } = useSessao();
  const { tema, alternarTema } = useTema(sessao);

  if (carregando) {
    return <div className="tela-carregando">Carregando…</div>;
  }

  if (recuperandoSenha) {
    return (
      <RedefinirSenha
        tema={tema}
        onAlternarTema={alternarTema}
        onConcluir={concluirRecuperacao}
      />
    );
  }

  if (!sessao) {
    return <Auth tema={tema} onAlternarTema={alternarTema} />;
  }

  return (
    <AppLogado
      key={sessao.user.id}
      userId={sessao.user.id}
      theme={tema}
      onSwitchTheme={alternarTema}
    />
  );
}

interface PropsLogado {
  userId: string;
  theme: Tema;
  onSwitchTheme: () => void;
}

function AppLogado({ userId, theme, onSwitchTheme }: PropsLogado) {
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
  const [confirmando, setConfirmando] = useState<'sair' | 'apagar' | null>(null);

  async function sair() {
    setConfirmando(null);
    limparCache(userId);
    await supabase.auth.signOut();
  }

  async function apagarPerfil() {
    await resetar();
    setConfirmando(null);
  }

  const cabecalho = (
    <header className="app-header">
      <span className="logo">💰</span>
      <h1>Reserva de Emergência</h1>

      <ThemeSwitch tema={theme} onAlternar={onSwitchTheme} />

      <button className="btn-reset" onClick={() => setConfirmando('apagar')} title="Recomeçar perfil" disabled={salvando}>
        <span className="material-symbols-outlined">
          delete_history
        </span>
      </button>

      <button className="btn-logout" onClick={() => setConfirmando('sair')} title="Sair da conta">
        <span className="material-symbols-outlined">
          logout
        </span>
      </button>
    </header>
  );

  const modalConfirmacao =
    confirmando === 'apagar' ? (
      <ModalConfirmacao
        titulo="Recomeçar do zero?"
        mensagem="Isso apaga seu perfil e todo o histórico de movimentações, para sempre."
        textoConfirmar="Apagar tudo"
        perigo
        confirmando={salvando}
        onConfirmar={apagarPerfil}
        onCancelar={() => setConfirmando(null)}
      />
    ) : confirmando === 'sair' ? (
      <ModalConfirmacao
        titulo="Sair da conta?"
        mensagem="Você pode entrar de novo quando quiser."
        textoConfirmar="Sair"
        onConfirmar={sair}
        onCancelar={() => setConfirmando(null)}
      />
    ) : null;

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

  if (carregando && !estado.perfil) {
    return (
      <div className="app">
        {cabecalho}
        <main className="app-main">
          {avisoErro}
          <p className="dica">Carregando seus dados…</p>
        </main>
        {modalConfirmacao}
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
    <>
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

          <Anuncio slot="1264721992" />
        </main>

        {modal && (
          <ModalTransacao
            tipo={modal}
            salvando={salvando}
            onConfirmar={confirmarTransacao}
            onCancelar={() => setModal(null)}
          />
        )}

        {modalConfirmacao}
      </div>

      <Anuncio slot="6230660523" className="anuncio-lateral" />
    </>
  );
}

export default App;
