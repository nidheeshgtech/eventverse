import { useEffect, useState } from 'react';
import { getSupabase } from '@/services/supabase';

type AdminState = { status: 'loading' } | { status: 'demo' } | { status: 'signed-out' } | { status: 'forbidden'; email: string } | { status: 'admin'; email: string };

/**
 * Local demo mode: everyone may open the dashboard (it only holds sample data).
 * Supabase mode: requires a signed-in user listed in admin_users (checked server-side via is_admin()).
 */
export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>(() => (getSupabase() ? { status: 'loading' } : { status: 'demo' }));

  useEffect(() => {
    const db = getSupabase();
    if (!db) return;
    let alive = true;
    const check = async () => {
      const { data } = await db.auth.getSession();
      const user = data.session?.user;
      if (!user) return alive && setState({ status: 'signed-out' });
      const { data: ok } = await db.rpc('is_admin', { min_role: 'viewer' });
      if (alive) setState(ok ? { status: 'admin', email: user.email ?? '' } : { status: 'forbidden', email: user.email ?? '' });
    };
    void check();
    const { data: sub } = db.auth.onAuthStateChange(() => void check());
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
