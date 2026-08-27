import type { Route } from '../hooks/useRoute';

interface Props {
  goTo: (route: Route) => void;
}

export function Privacy({ goTo }: Props) {
  return (
    <div className="legal-page">
      <button className="btn-link" onClick={() => goTo('/')}>
        ← Voltar para o início
      </button>

      <h1>Política de Privacidade</h1>
      <p className="hint">Última atualização: 26 de agosto de 2026.</p>

      <p>
        Esta política explica quais dados o <strong>Reserva de Emergência</strong> coleta,
        para que servem e como você pode controlá-los. O app foi feito para ajudar você a
        calcular e acompanhar sua reserva de emergência pessoal.
      </p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li>
          <strong>Dados de conta:</strong> e-mail e senha (ou, se você entrar com o Google,
          o e-mail e nome associados à sua conta Google), usados só para autenticação.
        </li>
        <li>
          <strong>Dados financeiros que você informa:</strong> renda, gastos mensais, idade,
          objetivo, e as movimentações (entradas e saídas) que você registra. Esses dados
          existem para calcular sua meta e seu progresso — não usamos para nenhuma outra
          finalidade.
        </li>
        <li>
          <strong>Cache local:</strong> uma cópia dos seus dados fica salva no armazenamento
          local do seu navegador (localStorage), só para o app abrir mais rápido. Ela é apagada
          quando você sai da conta ou limpa os dados do site.
        </li>
      </ul>

      <h2>Onde os dados ficam guardados</h2>
      <p>
        Os dados de conta e financeiros são armazenados no Supabase, com Row Level Security
        habilitado: cada pessoa só consegue ler ou alterar os próprios dados, tanto pela regra
        do banco quanto pela aplicação. Não vendemos nem compartilhamos seus dados financeiros
        com terceiros.
      </p>

      <h2>Anúncios e cookies</h2>
      <p>
        Este site exibe anúncios do Google AdSense. O Google e seus parceiros podem usar
        cookies para exibir anúncios com base nas suas visitas a este e a outros sites. Você
        pode desativar a personalização de anúncios nas{' '}
        <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">
          configurações de anúncios do Google
        </a>
        , e saber mais sobre como o Google usa dados de sites parceiros em{' '}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">
          policies.google.com/technologies/partner-sites
        </a>
        .
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode apagar seu perfil e todo o histórico de movimentações a qualquer momento,
        direto no app (botão "Recomeçar perfil"). Para excluir completamente sua conta ou tirar
        qualquer outra dúvida sobre seus dados, entre em contato pelo e-mail abaixo.
      </p>

      <h2>Contato</h2>
      <p>
        Dúvidas sobre esta política ou sobre seus dados: {' '}
        <a href="mailto:carolinaribeirodacol@gmail.com">carolinaribeirodacol@gmail.com</a>.
      </p>

      <p className="hint">
        Podemos atualizar esta política de tempos em tempos. A data no topo desta página
        sempre reflete a versão mais recente.
      </p>
    </div>
  );
}
