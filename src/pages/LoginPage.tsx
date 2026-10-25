import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/Brand';
import { Button, ButtonLink } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { GlassCard } from '@/components/ui/Misc';
import { getSupabase } from '@/services/supabase';

export default function LoginPage() {
  const db = getSupabase();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!db) return <Navigate to="/dashboard" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await db.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) setError('Sign-in failed. Check your email and password.');
    else navigate('/dashboard', { replace: true });
  };

  return (
    <div className="grid min-h-[100dvh] place-items-center px-4">
      <GlassCard className="w-full max-w-sm p-7">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-sm text-slate-400">Access is limited to users listed in admin_users.</p>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && (
            <p className="text-sm text-rose-300" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <ButtonLink to="/" variant="ghost" size="sm" className="mt-4 w-full">
          Back to site
        </ButtonLink>
      </GlassCard>
    </div>
  );
}
