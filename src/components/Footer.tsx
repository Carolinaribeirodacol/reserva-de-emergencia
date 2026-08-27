import type { Route } from '../hooks/useRoute';

interface Props {
  goTo: (route: Route) => void;
}

export function Footer({ goTo }: Props) {
  return (
    <footer className="footer">
      <button className="btn-link" onClick={() => goTo('/privacidade')}>
        Política de Privacidade
      </button>
      <span className="footer-separator">·</span>
      <button className="btn-link" onClick={() => goTo('/termos')}>
        Termos de Uso
      </button>
    </footer>
  );
}
