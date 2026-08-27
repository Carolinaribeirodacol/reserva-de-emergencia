import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Theme = 'light' | 'dark';

export const THEME_KEY = 'theme';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export function readSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (isTheme(saved)) return saved;
  } catch {
    // private mode / storage blocked
  }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark-theme', theme === 'dark');
  root.classList.toggle('light-theme', theme === 'light');
}

export function useTheme(session: Session | null) {
  const [localTheme, setLocalTheme] = useState<Theme>(readSavedTheme);

  // The account's theme (if any) wins over the local one: it's the
  // preference the user saved and that should follow them across devices.
  const accountTheme = session?.user.user_metadata?.theme;
  const theme: Theme = isTheme(accountTheme) ? accountTheme : localTheme;

  // The effect only writes to external systems (DOM and localStorage), never
  // to React state — which is also why the account theme is derived above
  // instead of becoming a setState in here.
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // same as above
    }
  }, [theme]);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setLocalTheme(next);

    // Logged in, the preference travels with the user. We don't wait for
    // the response: the switch is visual and immediate; if the network
    // fails, the theme still holds on this device via localStorage.
    if (session) {
      supabase.auth.updateUser({ data: { theme: next } });
    }
  }

  return { theme, toggleTheme };
}
