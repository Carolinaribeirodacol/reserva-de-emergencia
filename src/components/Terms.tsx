import type { Route } from '../hooks/useRoute';

interface Props {
  goTo: (route: Route) => void;
}

export function Terms({ goTo }: Props) {
  return (
    <div className="legal-page">
      <button className="btn-link" onClick={() => goTo('/')}>
        ← Voltar para o início
      </button>

      <h1>Termos de Uso</h1>
      <p className="hint">Última atualização: 26 de agosto de 2026.</p>

      <p>
        Ao usar o <strong>Reserva de Emergência</strong>, você concorda com estes termos. Leia
        com atenção.
      </p>

      <h2>O que é o app</h2>
      <p>
        O Reserva de Emergência é uma ferramenta gratuita para calcular e acompanhar sua
        reserva de emergência pessoal, com base em informações que você mesmo fornece (renda,
        gastos, idade e objetivo). O cálculo é uma sugestão baseada em regras simples de
        planejamento financeiro pessoal.
      </p>

      <h2>Não é aconselhamento financeiro</h2>
      <p>
        As metas e recomendações mostradas no app são estimativas educativas, não
        recomendações de investimento nem aconselhamento financeiro profissional. Decisões
        sobre sua vida financeira são de sua responsabilidade.
      </p>

      <h2>Sua conta</h2>
      <p>
        Você é responsável por manter sua senha em sigilo e por tudo o que acontecer na sua
        conta. Os dados que você registra (renda, gastos, movimentações) são de sua
        responsabilidade quanto à veracidade — o app não verifica essas informações.
      </p>

      <h2>Disponibilidade</h2>
      <p>
        Fazemos o possível para manter o app disponível, mas ele é oferecido "como está", sem
        garantia de disponibilidade contínua ou ausência de erros. Podemos alterar ou
        descontinuar funcionalidades a qualquer momento.
      </p>

      <h2>Anúncios</h2>
      <p>
        O app exibe anúncios de terceiros (Google AdSense) para se manter gratuito. Veja
        detalhes sobre isso na nossa{' '}
        <button className="btn-link btn-link-inline" onClick={() => goTo('/privacidade')}>
          Política de Privacidade
        </button>
        .
      </p>

      <h2>Alterações nestes termos</h2>
      <p>
        Podemos atualizar estes termos de tempos em tempos. A data no topo desta página sempre
        reflete a versão mais recente.
      </p>

      <h2>Contato</h2>
      <p>
        Dúvidas sobre estes termos: {' '}
        <a href="mailto:carolinaribeirodacol@gmail.com">carolinaribeirodacol@gmail.com</a>.
      </p>
    </div>
  );
}
