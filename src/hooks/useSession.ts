import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveringPassword, setRecoveringPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setRecoveringPassword(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    session,
    loading,
    recoveringPassword,
    finishRecovery: () => setRecoveringPassword(false),
  };
}
