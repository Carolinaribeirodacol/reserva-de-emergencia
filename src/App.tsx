import { useState } from 'react';
import './App.css';
import { supabase } from './lib/supabase';
import { useSession } from './hooks/useSession';
import { useTheme, type Theme } from './hooks/useTheme';
import { useRoute, type Route } from './hooks/useRoute';
import { useEmergencyFund, calculateGoal, generateRecommendation, clearCache } from './hooks/useEmergencyFund';
import { Auth } from './components/Auth';
import { ResetPassword } from './components/ResetPassword';
import { Onboarding } from './components/Onboarding';
import { ProgressBar } from './components/ProgressBar';
import { GoalPanel } from './components/GoalPanel';
import { TransactionModal } from './components/TransactionModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Recommendation } from './components/Recommendation';
import { Ad } from './components/Ad';
import { ThemeSwitch } from './components/ThemeSwitch';
import { Privacy } from './components/Privacy';
import { Terms } from './components/Terms';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import logo from './assets/images/logo.png';

function App() {
  const { session, loading, recoveringPassword, finishRecovery } = useSession();
  const { theme, toggleTheme } = useTheme(session);
  const { route, goTo } = useRoute();

  // Legal pages stay outside the login flow: they need to be
  // accessible (and indexable) even without a session.
  if (route === '/privacidade') {
    return <Privacy goTo={goTo} />;
  }
  if (route === '/termos') {
    return <Terms goTo={goTo} />;
  }

  if (loading) {
    return <div className="loading-screen">Carregando…</div>;
  }

  if (recoveringPassword) {
    return (
      <ResetPassword
        theme={theme}
        onToggleTheme={toggleTheme}
        onFinish={finishRecovery}
      />
    );
  }

  if (!session) {
    if (route === '/entrar') {
      return <Auth theme={theme} onToggleTheme={toggleTheme} goTo={goTo} />;
    }
    return <Home theme={theme} onToggleTheme={toggleTheme} goTo={goTo} />;
  }

  return (
    <LoggedInApp
      key={session.user.id}
      userId={session.user.id}
      theme={theme}
      onToggleTheme={toggleTheme}
      goTo={goTo}
    />
  );
}

interface LoggedInAppProps {
  userId: string;
  theme: Theme;
  onToggleTheme: () => void;
  goTo: (route: Route) => void;
}

function LoggedInApp({ userId, theme, onToggleTheme, goTo }: LoggedInAppProps) {
  const {
    state,
    loading,
    saving,
    error,
    clearError,
    reload,
    saveProfile,
    addTransaction,
    reset,
  } = useEmergencyFund(userId);
  const [modal, setModal] = useState<'deposit' | 'withdrawal' | null>(null);
  const [confirming, setConfirming] = useState<'logout' | 'reset' | null>(null);

  async function logout() {
    setConfirming(null);
    clearCache(userId);
    await supabase.auth.signOut();
  }

  async function resetProfile() {
    await reset();
    setConfirming(null);
  }

  const header = (
    <header className="app-header">
      <img src={logo} alt="Reserva de Emergência" className="logo" />
      <h1>Reserva de Emergência</h1>

      <ThemeSwitch theme={theme} onToggle={onToggleTheme} />

      <button className="btn-reset" onClick={() => setConfirming('reset')} title="Recomeçar perfil" disabled={saving}>
        <span className="material-symbols-outlined">
          delete_history
        </span>
      </button>

      <button className="btn-logout" onClick={() => setConfirming('logout')} title="Sair da conta">
        <span className="material-symbols-outlined">
          logout
        </span>
      </button>
    </header>
  );

  const confirmationModal =
    confirming === 'reset' ? (
      <ConfirmationModal
        title="Recomeçar do zero?"
        message="Isso apaga seu perfil e todo o histórico de movimentações, para sempre."
        confirmText="Apagar tudo"
        danger
        confirming={saving}
        onConfirm={resetProfile}
        onCancel={() => setConfirming(null)}
      />
    ) : confirming === 'logout' ? (
      <ConfirmationModal
        title="Sair da conta?"
        message="Você pode entrar de novo quando quiser."
        confirmText="Sair"
        onConfirm={logout}
        onCancel={() => setConfirming(null)}
      />
    ) : null;

  const errorNotice = error && (
    <div className="error-message error-banner">
      <span>{error}</span>
      <button
        className="btn-link"
        onClick={() => {
          clearError();
          reload();
        }}
      >
        tentar de novo
      </button>
    </div>
  );

  if (loading && !state.profile) {
    return (
      <div className="app">
        {header}
        <main className="app-main">
          {errorNotice}
          <p className="hint">Carregando seus dados…</p>
        </main>
        {confirmationModal}
      </div>
    );
  }

  if (!state.profile) {
    return (
      <>
        {errorNotice}
        <Onboarding onFinish={saveProfile} saving={saving} />
      </>
    );
  }

  const { targetAmount } = calculateGoal(state.profile);
  const recommendation = generateRecommendation(state.profile, state.balance);

  async function confirmTransaction(amount: number, reason: string) {
    const ok = await addTransaction(modal!, amount, reason);
    if (ok) setModal(null);
  }

  return (
    <>
      <div className="app">
        {header}

        <main className="app-main">
          {errorNotice}

          <ProgressBar balance={state.balance} target={targetAmount} />
          <GoalPanel profile={state.profile} balance={state.balance} />

          <div className="actions">
            <button className="btn-deposit" onClick={() => setModal('deposit')}>
              + Guardei dinheiro
            </button>
            <button className="btn-withdrawal" onClick={() => setModal('withdrawal')}>
              − Precisei usar
            </button>
          </div>

          <Recommendation message={recommendation} transactions={state.transactions} />

          <Ad slot="1264721992" />
        </main>

        <Footer goTo={goTo} />

        {modal && (
          <TransactionModal
            type={modal}
            saving={saving}
            onConfirm={confirmTransaction}
            onCancel={() => setModal(null)}
          />
        )}

        {confirmationModal}
      </div>

      <Ad slot="6230660523" className="ad-sidebar" />
    </>
  );
}

export default App;
