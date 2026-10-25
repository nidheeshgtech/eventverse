import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { EventBackdrop } from '@/components/game/EventBackdrop';
import { formatDate } from '@/components/game/VoucherCard';
import { BrandMark, Logo } from '@/components/ui/Brand';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge, GlassCard, PageLoader, SampleBadge } from '@/components/ui/Misc';
import { useToast } from '@/components/ui/Toast';
import { useAsync } from '@/hooks/useAsync';
import { data } from '@/services/data';
import { isValidVoucherCode } from '@/services/ids';
import type { EventConfig, Voucher } from '@/types/event';

/** Landing page for a scanned voucher QR. Staff can verify and mark it redeemed. */
export default function VoucherPage() {
  const { code = '' } = useParams();
  const normalized = code.toUpperCase();
  const wellFormed = isValidVoucherCode(normalized);
  const toast = useToast();
  const { data: lookup, loading, error } = useAsync(
    () => (wellFormed ? data.getVoucher(normalized) : Promise.resolve(null)),
    [normalized, wellFormed],
  );
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setVoucher(lookup?.voucher ?? null);
  }, [lookup]);

  useEffect(() => {
    document.title = 'Voucher check · EventVerse';
  }, []);

  if (loading) return <PageLoader />;

  const event = lookup?.event;
  const expired = voucher ? new Date(voucher.expiresAt) < new Date() : false;
  const state: 'valid' | 'redeemed' | 'expired' | 'unknown' = !voucher
    ? 'unknown'
    : voucher.redeemedAt
      ? 'redeemed'
      : expired
        ? 'expired'
        : 'valid';

  const redeem = async () => {
    if (!voucher) return;
    setBusy(true);
    try {
      setVoucher(await data.redeemVoucher(voucher.code));
      toast('Voucher marked as redeemed');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not redeem voucher', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell event={event ?? null}>
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <Logo />
          <SampleBadge label="Demo" />
        </div>

        <GlassCard className="mt-8 p-6 text-center">
          {state === 'unknown' ? (
            <>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-400/15 text-rose-300">
                <Icon name="close" size={26} />
              </span>
              <h1 className="mt-4 text-2xl font-bold">{wellFormed ? 'Voucher not found' : 'Invalid voucher reference'}</h1>
              <p className="mt-2 text-sm text-slate-400">
                {error
                  ? 'The voucher service could not be reached.'
                  : wellFormed && data.mode === 'local'
                    ? 'In local demo mode, vouchers are stored on the device that earned them. Connect Supabase to verify vouchers on any device.'
                    : 'Please check the reference and try again.'}
              </p>
              <p className="mt-4 font-mono text-sm text-slate-300">{normalized}</p>
            </>
          ) : (
            voucher && (
              <>
                {event && (
                  <div className="flex justify-center">
                    <BrandMark event={event} size={56} />
                  </div>
                )}
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-accent">{event?.brandName}</p>
                <h1 className="mt-1 text-xl font-semibold">{voucher.title}</h1>
                <p className="mt-2 font-display text-4xl font-extrabold text-brand">{voucher.discountLabel}</p>
                <div className="mt-4">
                  {state === 'valid' && <Badge tone="green">Valid</Badge>}
                  {state === 'redeemed' && <Badge tone="slate">Redeemed {formatDate(voucher.redeemedAt!)}</Badge>}
                  {state === 'expired' && <Badge tone="rose">Expired</Badge>}
                </div>
                <dl className="mt-6 grid grid-cols-3 gap-2 text-left text-sm">
                  <div className="col-span-3 rounded-2xl bg-white/5 p-3">
                    <dt className="text-xs text-slate-400">Reference</dt>
                    <dd className="mt-0.5 font-mono text-base tracking-wider text-white">{voucher.code}</dd>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <dt className="text-xs text-slate-400">Score</dt>
                    <dd className="mt-0.5 text-white">{voucher.score} pts</dd>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <dt className="text-xs text-slate-400">Issued</dt>
                    <dd className="mt-0.5 text-white">{formatDate(voucher.issuedAt)}</dd>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <dt className="text-xs text-slate-400">Valid until</dt>
                    <dd className="mt-0.5 text-white">{formatDate(voucher.expiresAt)}</dd>
                  </div>
                </dl>
                {state === 'valid' && (
                  <Button size="lg" className="mt-6 w-full" onClick={redeem} disabled={busy} icon={<Icon name="check" size={18} />}>
                    {busy ? 'Redeeming…' : 'Mark as redeemed (staff)'}
                  </Button>
                )}
                <p className="mt-5 rounded-xl bg-gold-400/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-300">
                  Sample / Demo only — not a real offer
                </p>
              </>
            )
          )}
        </GlassCard>

        <div className="mt-6 text-center">
          <ButtonLink to="/" variant="ghost" size="sm" icon={<Icon name="arrowLeft" size={16} />}>
            EventVerse home
          </ButtonLink>
        </div>
      </div>
    </Shell>
  );
}

/** Event-branded backdrop when the voucher's event is known; plain page otherwise. */
function Shell({ event, children }: { event: EventConfig | null; children: ReactNode }) {
  const inner = <div className="relative min-h-[100dvh] px-4 py-8 safe-top">{children}</div>;
  return event ? (
    <EventBackdrop event={event} particles={false}>
      {inner}
    </EventBackdrop>
  ) : (
    inner
  );
}
