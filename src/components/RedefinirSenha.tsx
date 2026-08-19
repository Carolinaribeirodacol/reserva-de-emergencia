import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ThemeSwitch } from './ThemeSwitch';
import { CampoSenha } from './CampoSenha';
import { DICA_SENHA, senhaAtendeRequisitos, traduzirErroSenha } from '../helpers/senha';
import type { Tema } from '../hooks/useTema';

interface Props {
  tema: Tema;
  onAlternarTema: () => void;
  onConcluir: () => void;
}

function traduzirErro(mensagem: string): string {
  const m = mensagem.toLowerCase();
  const erroSenha = traduzirErroSenha(m);
  if (erroSenha) return erroSenha;
  if (m.includes('should be different')) return 'A nova senha precisa ser diferente da atual.';
  if (m.includes('failed to fetch')) return 'Sem conexão com o servidor. Verifique sua internet.';
  return mensagem;
}

export function RedefinirSenha({ tema, onAlternarTema, onConcluir }: Props) {
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const senhasConferem = senha === confirmacao;
  const podeEnviar = senhaAtendeRequisitos(senha) && senhasConferem && !enviando;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!podeEnviar) return;

    setEnviando(true);
    setErro('');

    const { error } = await supabase.auth.updateUser({ password: senha });

    setEnviando(false);

    if (error) {
      setErro(traduzirErro(error.message));
      return;
    }

    onConcluir();
  }

  return (
    <div className="auth">
      <div className="auth-topo">
        <ThemeSwitch tema={tema} onAlternar={onAlternarTema} />
      </div>

      <div className="onboarding-header">
        <span className="logo">🔑</span>
        <h1>Nova senha</h1>
        <p>Escolha uma senha nova para a sua conta</p>
      </div>

      <form className="onboarding-card" onSubmit={enviar}>
        <CampoSenha
          value={senha}
          onChange={setSenha}
          placeholder="nova senha"
          autoComplete="new-password"
          autoFocus
        />

        <CampoSenha
          value={confirmacao}
          onChange={setConfirmacao}
          placeholder="confirme a nova senha"
          autoComplete="new-password"
        />

        {confirmacao && !senhasConferem && (
          <p className="mensagem-erro">As senhas não são iguais.</p>
        )}
        {!confirmacao && <p className="dica">{DICA_SENHA}</p>}
        {erro && <p className="mensagem-erro">{erro}</p>}

        <button className="btn-primary" type="submit" disabled={!podeEnviar}>
          {enviando ? 'Salvando…' : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  );
}
