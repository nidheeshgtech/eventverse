import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '@/components/game/VoucherCard';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge, Spinner } from '@/components/ui/Misc';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { data } from '@/services/data';
import type { Voucher } from '@/types/event';

function statusOf(v: Voucher) {
  if (v.redeemedAt) return { label: 'Redeemed', tone: 'slate' as const };
  if (new Date(v.expiresAt) < new Date()) return { label: 'Expired', tone: 'rose' as const };
  return { label: 'Valid', tone: 'green' as const };
}

export default function VouchersPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { data: vouchers, loading, reload } = useAsync(() => data.listVouchers(), []);
  const events = useAsync(() => data.listEvents(), []);
  const [query, setQuery] = useState('');
  const [verify, setVerify] = useState('');

  const names = useMemo(() => new Map(events.data?.map((e) => [e.id, e.brandName])), [events.data]);
  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    return (vouchers ?? []).filter((v) => !q || v.code.includes(q) || (names.get(v.eventId) ?? '').toUpperCase().includes(q));
  }, [vouchers, query, names]);

  const redeem = async (code: string) => {
    try {
      await data.redeemVoucher(code);
      toast('Voucher redeemed');
      reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not redeem', 'error');
    }
  };

  const onVerify = (e: FormEvent) => {
    e.preventDefault();
    const code = verify.trim().toUpperCase();
    if (code) navigate(`/voucher/${encodeURIComponent(code)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Vouchers</h1>
          <p className="mt-1 text-sm text-slate-400">
            {data.mode === 'local' ? 'Vouchers earned in this browser (demo mode).' : 'All vouchers issued across your events.'}
          </p>
        </div>
        <form onSubmit={onVerify} className="flex gap-2">
          <label className="sr-only" htmlFor="verify">
            Verify a voucher reference
          </label>
          <input
            id="verify"
            value={verify}
            onChange={(e) => setVerify(e.target.value)}
            placeholder="AWN-XXXX-XXXX-X"
            className="w-48 rounded-full border border-white/10 bg-midnight-950/60 px-4 font-mono text-sm uppercase text-white placeholder:normal-case placeholder:text-slate-500 focus:border-electric-400/60 focus:outline-none sm:w-56"
          />
          <Button type="submit" size="md" variant="secondary">
            Verify
          </Button>
        </form>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <Icon name="ticket" size={18} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reference or event"
            aria-label="Search vouchers"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <span className="text-xs text-slate-400">{filtered.length} shown</span>
        </div>

        {loading ? (
          <div className="py-16">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold text-white">No vouchers yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Play a demo and reach the target score to issue one.{' '}
              <Link to="/demo/winter-festival" className="text-electric-300 hover:underline">
                Open the winter festival demo
              </Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Reward</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Issued</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const st = statusOf(v);
                  return (
                    <tr key={v.code} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        <Link to={`/voucher/${v.code}`} className="font-mono text-white hover:underline">
                          {v.code}
                        </Link>
                        {v.environment === 'demo' && <span className="ml-2 text-[10px] font-semibold uppercase text-gold-300">sample</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{names.get(v.eventId) ?? v.eventSlug}</td>
                      <td className="px-4 py-3 text-slate-300">{v.discountLabel}</td>
                      <td className="px-4 py-3 tabular-nums text-slate-300">{v.score}</td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(v.issuedAt)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {st.label === 'Valid' && (
                          <Button size="sm" variant="secondary" onClick={() => redeem(v.code)}>
                            Redeem
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
