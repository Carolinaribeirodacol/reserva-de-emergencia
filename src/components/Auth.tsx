import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ThemeSwitch } from './ThemeSwitch';
import { PasswordField } from './PasswordField';
import { Footer } from './Footer';
import logo from '../assets/images/logo.png';
import { PASSWORD_HINT, passwordMeetsRequirements, translatePasswordError } from '../helpers/password';
import type { Theme } from '../hooks/useTheme';
import type { Route } from '../hooks/useRoute';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  goTo: (route: Route) => void;
}

type Mode = 'signIn' | 'signUp' | 'recover';

function translateError(message: string): string {
  const m = message.toLowerCase();
  const passwordError = translatePasswordError(m);
  if (passwordError) return passwordError;
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (m.includes('user already registered')) return 'Esse e-mail já tem cadastro. Tente entrar.';
  if (m.includes('unable to validate email')) return 'E-mail inválido.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Espere um pouco e tente de novo.';
  if (m.includes('failed to fetch')) return 'Sem conexão com o servidor. Verifique sua internet.';
  return message;
}

export function Auth({ theme, onToggleTheme, goTo }: Props) {
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signingInWithGoogle, setSigningInWithGoogle] = useState(false);

  async function signInWithGoogle() {
    setSigningInWithGoogle(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      setError(translateError(error.message));
      setSigningInWithGoogle(false);
    }
    // On success the browser is redirected to Google, so there's
    // nothing else to do here.
  }

  const canSubmit =
    mode === 'recover'
      ? email.includes('@') && !submitting
      : mode === 'signUp'
        ? email.includes('@') && passwordMeetsRequirements(password) && !submitting
        : email.includes('@') && password.length >= 6 && !submitting;

  async function submit(e: React.FormEvent) {
  e.preventDefault();

  if (!canSubmit) return;

  setSubmitting(true);
  setError('');
  setNotice('');

  if (mode === 'recover') {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });

    setSubmitting(false);

    if (error) {
      setError(translateError(error.message));
      return;
    }

    setNotice('Se esse e-mail tiver cadastro, enviamos um link para redefinir a senha.');
    setMode('signIn');
    return;
  }

  const credentials = {
    email: email.trim(),
    password,
  };

  const { data, error } =
    mode === 'signIn'
      ? await supabase.auth.signInWithPassword(credentials)
      : await supabase.auth.signUp(credentials);

  if (error) {
    setError(translateError(error.message));
    setSubmitting(false);
    return;
  }

  if (mode === 'signUp') {
    if (data.user?.identities?.length === 0) {
      setNotice(
        'Você já possui uma conta com este e-mail. Entre na sua conta para continuar.'
      );

      setMode('signIn');
      setPassword('');
      setSubmitting(false);

      return;
    }

    if (!data.session) {
      setNotice(
        'Conta criada! Confirme o link enviado para o seu e-mail e depois entre.'
      );

      setMode('signIn');
      setPassword('');
    }
  }

  // Sign-in complete: the URL goes back home instead of staying on /entrar.
  if (data.session) goTo('/');

  setSubmitting(false);
}

  function switchMode() {
    setMode(m => (m === 'signIn' ? 'signUp' : 'signIn'));
    setError('');
    setNotice('');
  }

  function goToRecover() {
    setMode('recover');
    setPassword('');
    setError('');
    setNotice('');
  }

  return (
    <div className="auth">
      <div className="auth-top">
        <button className="btn-link" onClick={() => goTo('/')}>
          ← Voltar
        </button>
        <ThemeSwitch theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="onboarding-header">
        <img src={logo} alt="Reserva de Emergência" className="logo" />
        <h1>Reserva de Emergência</h1>
        <p>Saiba o quanto falta para alcançar o seu objetivo!</p>
      </div>

      <form className="onboarding-card" onSubmit={submit}>
        <h2>
          {mode === 'signIn'
            ? 'Entrar na sua conta'
            : mode === 'signUp'
              ? 'Criar uma conta'
              : 'Recuperar senha'}
        </h2>

        {mode === 'recover' && (
          <p className="hint">Enviamos um link para você escolher uma senha nova.</p>
        )}

        {mode !== 'recover' && (
          <>
            <button
              className="btn-google"
              type="button"
              onClick={signInWithGoogle}
              disabled={signingInWithGoogle}
            >
              <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z" />
                <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4C29.6 35 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.6 5C9.9 39.7 16.4 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4C41.4 36 44 30.5 44 24c0-1.2-.1-2.4-.4-3.5z" />
              </svg>
              {signingInWithGoogle ? 'Aguarde…' : 'Continuar com Google'}
            </button>
            <div className="auth-divider"><span>ou</span></div>
          </>
        )}

        <div className="input-wrapper">
          <span>📧</span>
          <input
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
        </div>

        {mode !== 'recover' && (
          <PasswordField
            value={password}
            onChange={setPassword}
            placeholder="sua senha"
            autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
          />
        )}

        {mode === 'signUp' && (
          <p className="hint">{PASSWORD_HINT}</p>
        )}

        {mode === 'signIn' && (
          <button className="btn-link" type="button" onClick={goToRecover}>
            Esqueci minha senha
          </button>
        )}

        {error && <p className="error-message">{error}</p>}
        {notice && <p className="notice-message">{notice}</p>}

        <button className="btn-primary" type="submit" disabled={!canSubmit}>
          {submitting
            ? 'Aguarde…'
            : mode === 'signIn'
              ? 'Entrar'
              : mode === 'signUp'
                ? 'Criar conta'
                : 'Enviar link de recuperação'}
        </button>

        {mode === 'recover' ? (
          <button className="btn-link" type="button" onClick={() => { setMode('signIn'); setError(''); setNotice(''); }}>
            Voltar para entrar
          </button>
        ) : (
          <button className="btn-link" type="button" onClick={switchMode}>
            {mode === 'signIn'
              ? 'Ainda não tem conta? Cadastre-se'
              : 'Já tem conta? Entrar'}
          </button>
        )}
      </form>

      <Footer goTo={goTo} />
    </div>
  );
}
