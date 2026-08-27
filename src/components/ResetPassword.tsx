import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ThemeSwitch } from './ThemeSwitch';
import { PasswordField } from './PasswordField';
import { PASSWORD_HINT, passwordMeetsRequirements, translatePasswordError } from '../helpers/password';
import type { Theme } from '../hooks/useTheme';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onFinish: () => void;
}

function translateError(message: string): string {
  const m = message.toLowerCase();
  const passwordError = translatePasswordError(m);
  if (passwordError) return passwordError;
  if (m.includes('should be different')) return 'A nova senha precisa ser diferente da atual.';
  if (m.includes('failed to fetch')) return 'Sem conexão com o servidor. Verifique sua internet.';
  return message;
}

export function ResetPassword({ theme, onToggleTheme, onFinish }: Props) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordsMatch = password === confirmation;
  const canSubmit = passwordMeetsRequirements(password) && passwordsMatch && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password });

    setSubmitting(false);

    if (error) {
      setError(translateError(error.message));
      return;
    }

    onFinish();
  }

  return (
    <div className="auth">
      <div className="auth-top">
        <ThemeSwitch theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="onboarding-header">
        <span className="logo">🔑</span>
        <h1>Nova senha</h1>
        <p>Escolha uma senha nova para a sua conta</p>
      </div>

      <form className="onboarding-card" onSubmit={submit}>
        <PasswordField
          value={password}
          onChange={setPassword}
          placeholder="nova senha"
          autoComplete="new-password"
          autoFocus
        />

        <PasswordField
          value={confirmation}
          onChange={setConfirmation}
          placeholder="confirme a nova senha"
          autoComplete="new-password"
        />

        {confirmation && !passwordsMatch && (
          <p className="error-message">As senhas não são iguais.</p>
        )}
        {!confirmation && <p className="hint">{PASSWORD_HINT}</p>}
        {error && <p className="error-message">{error}</p>}

        <button className="btn-primary" type="submit" disabled={!canSubmit}>
          {submitting ? 'Salvando…' : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  );
}
