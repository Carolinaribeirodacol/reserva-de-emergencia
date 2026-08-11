import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ThemeSwitch } from './ThemeSwitch';
import type { Tema } from '../hooks/useTema';

interface Props {
  tema: Tema;
  onAlternarTema: () => void;
}

type Modo = 'entrar' | 'cadastrar';

/** As mensagens do Supabase vêm em inglês; traduzimos as mais comuns. */
function traduzirErro(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (m.includes('user already registered')) return 'Esse e-mail já tem cadastro. Tente entrar.';
  if (m.includes('password should be at least')) return 'A senha precisa de pelo menos 6 caracteres.';
  if (m.includes('unable to validate email')) return 'E-mail inválido.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Espere um pouco e tente de novo.';
  if (m.includes('failed to fetch')) return 'Sem conexão com o servidor. Verifique sua internet.';
  return mensagem;
}

export function Auth({ tema, onAlternarTema }: Props) {
  const [modo, setModo] = useState<Modo>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const podeEnviar = email.includes('@') && senha.length >= 6 && !enviando;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!podeEnviar) return;

    setEnviando(true);
    setErro('');
    setAviso('');

    const credenciais = { email: email.trim(), password: senha };
    const { data, error } =
      modo === 'entrar'
        ? await supabase.auth.signInWithPassword(credenciais)
        : await supabase.auth.signUp(credenciais);

    if (error) {
      setErro(traduzirErro(error.message));
      setEnviando(false);
      return;
    }

    // Com confirmação de e-mail ligada, o signUp não devolve sessão:
    // o usuário só entra depois de clicar no link.
    if (modo === 'cadastrar' && !data.session) {
      setAviso('Conta criada! Confirme o link enviado para o seu e-mail e depois entre.');
      setModo('entrar');
      setSenha('');
    }

    setEnviando(false);
    // Sucesso com sessão não precisa de tratamento: o onAuthStateChange
    // do useSessao troca a tela sozinho.
  }

  function trocarModo() {
    setModo(m => (m === 'entrar' ? 'cadastrar' : 'entrar'));
    setErro('');
    setAviso('');
  }

  return (
    <div className="auth">
      <div className="auth-topo">
        <ThemeSwitch tema={tema} onAlternar={onAlternarTema} />
      </div>

      <div className="onboarding-header">
        <span className="logo">💰</span>
        <h1>Guarda Certo</h1>
        <p>Seus dados salvos na nuvem, em qualquer dispositivo</p>
      </div>

      <form className="onboarding-card" onSubmit={enviar}>
        <h2>{modo === 'entrar' ? 'Entrar na sua conta' : 'Criar uma conta'}</h2>

        <div className="input-wrapper">
          <span>@</span>
          <input
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
          />
        </div>

        <div className="input-wrapper">
          <span>🔒</span>
          <input
            type="password"
            placeholder="sua senha"
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            value={senha}
            onChange={e => setSenha(e.target.value)}
          />
        </div>

        {modo === 'cadastrar' && (
          <p className="dica">Mínimo de 6 caracteres.</p>
        )}

        {erro && <p className="mensagem-erro">{erro}</p>}
        {aviso && <p className="mensagem-aviso">{aviso}</p>}

        <button className="btn-primary" type="submit" disabled={!podeEnviar}>
          {enviando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
        </button>

        <button className="btn-link" type="button" onClick={trocarModo}>
          {modo === 'entrar'
            ? 'Ainda não tem conta? Cadastre-se'
            : 'Já tem conta? Entrar'}
        </button>
      </form>
    </div>
  );
}
