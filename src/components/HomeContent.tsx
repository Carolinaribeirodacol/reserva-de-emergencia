export function HomeContent() {
  return (
    <section className="landing">
      <div className="landing-grid">
        <div className="landing-block landing-card">
          <h2>O que é uma reserva de emergência?</h2>
          <p>
            É o dinheiro guardado para cobrir seus gastos essenciais caso algo inesperado
            aconteça — uma demissão, um problema de saúde, um conserto urgente. Ter essa
            reserva é o que evita que um imprevisto vire uma dívida.
          </p>
        </div>

        <div className="landing-block landing-card">
          <h2>Como o app funciona</h2>
          <ol className="landing-steps">
            <li>
              <strong>Conte sua situação.</strong> Renda, gastos mensais, idade e objetivo —
              leva menos de um minuto.
            </li>
            <li>
              <strong>Receba sua meta.</strong> Calculamos quanto guardar com base no seu
              perfil (de 3 a 6 meses de gastos, dependendo do seu objetivo e idade).
            </li>
            <li>
              <strong>Registre o que guarda e o que usa.</strong> Cada entrada e saída fica no
              seu histórico, e a barra de progresso mostra o quanto falta.
            </li>
          </ol>
        </div>
      </div>

      <div className="landing-block landing-faq">
        <h2>Perguntas frequentes</h2>

        <details>
          <summary>Quanto eu devo guardar?</summary>
          <p>
            A regra mais comum é de 3 a 6 meses dos seus gastos essenciais. O app sugere um
            número dentro dessa faixa considerando sua idade e o seu objetivo, mas você pode
            ajustar como quiser.
          </p>
        </details>

        <details>
          <summary>Meus dados financeiros ficam seguros?</summary>
          <p>
            Sim. Suas informações ficam protegidas por login e por regras de acesso no banco
            de dados que garantem que só você enxerga os seus próprios dados. Veja os detalhes
            na nossa Política de Privacidade, no rodapé desta página.
          </p>
        </details>

        <details>
          <summary>O app é gratuito?</summary>
          <p>
            Sim, o uso é 100% gratuito. O app se mantém com a exibição de anúncios.
          </p>
        </details>

        <details>
          <summary>Posso mudar meus dados depois?</summary>
          <p>
            Sim. Você pode recomeçar o perfil do zero a qualquer momento, direto dentro do
            app, apagando o histórico anterior.
          </p>
        </details>
      </div>
    </section>
  );
}
