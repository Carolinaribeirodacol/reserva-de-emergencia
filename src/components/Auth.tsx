import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ThemeSwitch } from './ThemeSwitch';
import { CampoSenha } from './CampoSenha';
import { DICA_SENHA, senhaAtendeRequisitos, traduzirErroSenha } from '../helpers/senha';
import type { Tema } from '../hooks/useTema';

interface Props {
  tema: Tema;
  onAlternarTema: () => void;
}

type Modo = 'entrar' | 'cadastrar' | 'recuperar';

function traduzirErro(mensagem: string): string {
  const m = mensagem.toLowerCase();
  const erroSenha = traduzirErroSenha(m);
  if (erroSenha) return erroSenha;
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (m.includes('user already registered')) return 'Esse e-mail já tem cadastro. Tente entrar.';
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

  const podeEnviar =
    modo === 'recuperar'
      ? email.includes('@') && !enviando
      : modo === 'cadastrar'
        ? email.includes('@') && senhaAtendeRequisitos(senha) && !enviando
        : email.includes('@') && senha.length >= 6 && !enviando;

  async function enviar(e: React.FormEvent) {
  e.preventDefault();

  if (!podeEnviar) return;

  setEnviando(true);
  setErro('');
  setAviso('');

  if (modo === 'recuperar') {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });

    setEnviando(false);

    if (error) {
      setErro(traduzirErro(error.message));
      return;
    }

    setAviso('Se esse e-mail tiver cadastro, enviamos um link para redefinir a senha.');
    setModo('entrar');
    return;
  }

  const credenciais = {
    email: email.trim(),
    password: senha,
  };

  const { data, error } =
    modo === 'entrar'
      ? await supabase.auth.signInWithPassword(credenciais)
      : await supabase.auth.signUp(credenciais);

  if (error) {
    setErro(traduzirErro(error.message));
    setEnviando(false);
    return;
  }

  if (modo === 'cadastrar') {
    if (data.user?.identities?.length === 0) {
      setAviso(
        'Você já possui uma conta com este e-mail. Entre na sua conta para continuar.'
      );

      setModo('entrar');
      setSenha('');
      setEnviando(false);

      return;
    }

    if (!data.session) {
      setAviso(
        'Conta criada! Confirme o link enviado para o seu e-mail e depois entre.'
      );

      setModo('entrar');
      setSenha('');
    }
  }

  setEnviando(false);
}

  function trocarModo() {
    setModo(m => (m === 'entrar' ? 'cadastrar' : 'entrar'));
    setErro('');
    setAviso('');
  }

  function irParaRecuperar() {
    setModo('recuperar');
    setSenha('');
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
        <h2>
          {modo === 'entrar'
            ? 'Entrar na sua conta'
            : modo === 'cadastrar'
              ? 'Criar uma conta'
              : 'Recuperar senha'}
        </h2>

        {modo === 'recuperar' && (
          <p className="dica">Enviamos um link para você escolher uma senha nova.</p>
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

        {modo !== 'recuperar' && (
          <CampoSenha
            value={senha}
            onChange={setSenha}
            placeholder="sua senha"
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
          />
        )}

        {modo === 'cadastrar' && (
          <p className="dica">{DICA_SENHA}</p>
        )}

        {modo === 'entrar' && (
          <button className="btn-link" type="button" onClick={irParaRecuperar}>
            Esqueci minha senha
          </button>
        )}

        {erro && <p className="mensagem-erro">{erro}</p>}
        {aviso && <p className="mensagem-aviso">{aviso}</p>}

        <button className="btn-primary" type="submit" disabled={!podeEnviar}>
          {enviando
            ? 'Aguarde…'
            : modo === 'entrar'
              ? 'Entrar'
              : modo === 'cadastrar'
                ? 'Criar conta'
                : 'Enviar link de recuperação'}
        </button>

        {modo === 'recuperar' ? (
          <button className="btn-link" type="button" onClick={() => { setModo('entrar'); setErro(''); setAviso(''); }}>
            Voltar para entrar
          </button>
        ) : (
          <button className="btn-link" type="button" onClick={trocarModo}>
            {modo === 'entrar'
              ? 'Ainda não tem conta? Cadastre-se'
              : 'Já tem conta? Entrar'}
          </button>
        )}
      </form>
    </div>
  );
}
