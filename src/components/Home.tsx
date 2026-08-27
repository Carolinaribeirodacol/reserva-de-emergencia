import { ThemeSwitch } from './ThemeSwitch';
import { HomeContent } from './HomeContent';
import { Footer } from './Footer';
import logo from '../assets/images/logo.png';
import type { Theme } from '../hooks/useTheme';
import type { Route } from '../hooks/useRoute';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  goTo: (route: Route) => void;
}

export function Home({ theme, onToggleTheme, goTo }: Props) {
  return (
    <div className="home">
      <header className="home-header">
        <div className="home-brand">
          <img src={logo} alt="Reserva de Emergência" className="logo" />
          <span>Reserva de Emergência</span>
        </div>

        <div className="home-header-actions">
          <ThemeSwitch theme={theme} onToggle={onToggleTheme} />
          <button className="btn-header-login" onClick={() => goTo('/entrar')}>
            Entrar
          </button>
        </div>
      </header>

      <section className="hero">
        <span className="hero-bg-icon material-symbols-outlined" aria-hidden="true">
          monetization_on
        </span>

        <div className="hero-content">
          <h1 className="hero-title">
            Sua <span className="gradient-text">reserva de emergência</span>, sob controle.
          </h1>
          <p className="hero-subtitle">
            Descubra quanto guardar, acompanhe seu progresso e durma tranquila. De graça.
          </p>
          <button className="btn-cta" onClick={() => goTo('/entrar')}>
            Começar agora →
          </button>
        </div>
      </section>

      <HomeContent />

      <Footer goTo={goTo} />
    </div>
  );
}
