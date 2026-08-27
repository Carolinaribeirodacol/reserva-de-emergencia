import { useEffect, useState } from 'react';

export type Route = '/' | '/entrar' | '/privacidade' | '/termos';

const VALID_ROUTES: Route[] = ['/', '/entrar', '/privacidade', '/termos'];

function readRoute(): Route {
  const path = window.location.pathname as Route;
  return VALID_ROUTES.includes(path) ? path : '/';
}

/** Minimal routing for the app's few static pages (no external lib). */
export function useRoute() {
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const onNavigate = () => setRoute(readRoute());
    window.addEventListener('popstate', onNavigate);
    return () => window.removeEventListener('popstate', onNavigate);
  }, []);

  function goTo(destination: Route) {
    window.history.pushState({}, '', destination);
    setRoute(destination);
    window.scrollTo(0, 0);
  }

  return { route, goTo };
}
