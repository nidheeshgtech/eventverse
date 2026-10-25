import { useEffect } from 'react';
import { Link, Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { data } from '@/services/data';
import { getSupabase } from '@/services/supabase';
import { Logo } from '../ui/Brand';
import { Button, ButtonLink } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';
import { GlassCard, PageLoader } from '../ui/Misc';

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/dashboard', label: 'Overview', icon: 'chart', end: true },
  { to: '/dashboard/events', label: 'Events', icon: 'calendar' },
  { to: '/dashboard/vouchers', label: 'Vouchers', icon: 'ticket' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white'
  }`;

export default function DashboardLayout() {
  const admin = useAdmin();

  useEffect(() => {
    document.title = 'Dashboard · EventVerse';
  }, []);

  if (admin.status === 'loading') return <PageLoader />;
  if (admin.status === 'signed-out') return <Navigate to="/login" replace />;
  if (admin.status === 'forbidden') {
    return (
      <div className="grid min-h-[100dvh] place-items-center p-6">
        <GlassCard className="max-w-sm p-7 text-center">
          <h1 className="text-xl font-bold">No dashboard access</h1>
          <p className="mt-2 text-sm text-slate-400">{admin.email} is not listed as an EventVerse admin.</p>
          <Button variant="secondary" className="mt-6" onClick={() => void getSupabase()?.auth.signOut()}>
            Sign out
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-[100dvh] flex-col border-r border-white/10 bg-midnight-950/60 p-5 backdrop-blur-xl lg:flex">
        <Logo />
        <nav className="mt-10 flex flex-col gap-1" aria-label="Dashboard">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
              <Icon name={n.icon} size={18} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <ButtonLink to="/dashboard/events/new" size="sm" className="mt-6" icon={<Icon name="plus" size={16} />}>
          New event
        </ButtonLink>
        <div className="mt-auto space-y-3">
          <ModeCard />
          <Link to="/" className="flex items-center gap-2 px-1 text-xs text-slate-400 hover:text-white">
            <Icon name="arrowLeft" size={14} /> Back to website
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-midnight-950/80 backdrop-blur-xl safe-top lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Logo />
            <ButtonLink to="/dashboard/events/new" size="sm" icon={<Icon name="plus" size={14} />}>
              New
            </ButtonLink>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2" aria-label="Dashboard">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
                <Icon name={n.icon} size={16} />
                {n.label}
              </NavLink>
            ))}
          </nav>
        </header>

        {data.mode === 'local' && (
          <div className="border-b border-gold-400/20 bg-gold-400/10 px-4 py-2.5 text-center text-xs text-gold-300 sm:px-8">
            <strong className="font-semibold">Demo mode.</strong> Analytics are sample data. Events and vouchers you create are saved in this browser only.
          </div>
        )}

        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ModeCard() {
  const local = data.mode === 'local';
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
      <p className="flex items-center gap-2 font-semibold text-white">
        <span className={`h-2 w-2 rounded-full ${local ? 'bg-gold-400' : 'bg-emerald-400'}`} />
        {local ? 'Local demo mode' : 'Connected to Supabase'}
      </p>
      <p className="mt-1 text-slate-400">{local ? 'Add Supabase keys to .env.local to go live.' : 'Showing production analytics.'}</p>
      {!local && (
        <button type="button" className="mt-2 text-slate-300 underline-offset-2 hover:underline" onClick={() => void getSupabase()?.auth.signOut()}>
          Sign out
        </button>
      )}
    </div>
  );
}
