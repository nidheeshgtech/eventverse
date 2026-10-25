import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { presetOf, styleOf } from '@/config/styles';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { sound } from '@/services/sound';
import type { EventConfig, ItemKind, Voucher } from '@/types/event';
import type { GameResult } from '@/types/game';
import { BrandMark } from '../ui/Brand';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { GiftArt, Spinner } from '../ui/Misc';
import { Confetti } from './Confetti';
import { VoucherCard } from './VoucherCard';

interface Props {
  event: EventConfig;
  result: GameResult;
  voucher: Voucher | null;
  /** Voucher already earned earlier in this visit (one per visit). */
  previousVoucher: Voucher | null;
  status: 'saving' | 'done' | 'error';
  onReplay: () => void;
}

const ORDER: ItemKind[] = ['gold', 'blue', 'purple', 'snowball'];

export function ResultScreen({ event, result, voucher, previousVoucher, status, onReplay }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(prefersReducedMotion() ? result.score : 0);
  const target = event.reward.threshold;
  const earned = Boolean(voucher);
  const missedBy = Math.max(0, target - result.score);

  // Count the score up, then reveal the rest.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const obj = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        v: result.score,
        duration: Math.min(1.6, 0.5 + result.score / 400),
        ease: 'power2.out',
        onUpdate: () => setShown(Math.round(obj.v)),
      });
      gsap.fromTo('[data-in]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.3 });
    }, root);
    return () => ctx.revert();
  }, [result.score]);

  useEffect(() => {
    if (status === 'done' && earned) sound.play('win');
  }, [status, earned]);

  const headline = earned ? 'Reward unlocked!' : result.score >= target * 0.75 ? 'So close!' : 'Nice run!';

  return (
    <div ref={root} className="relative flex min-h-full flex-col px-5 pb-6 pt-6 safe-bottom">
      {status === 'done' && earned && <Confetti />}

      <div className="flex flex-col items-center text-center">
        <BrandMark event={event} size={52} />
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Final score</p>
        <p className="font-display text-7xl font-extrabold tabular-nums text-white drop-shadow-[0_0_30px_rgb(var(--brand-primary)/0.5)]" aria-live="polite">
          {shown}
        </p>
        <h2 data-in className="mt-2 text-2xl font-bold">
          {headline}
        </h2>
        {event.reward.enabled && !earned && status !== 'saving' && (
          <p data-in className="mt-1 text-sm text-slate-300">
            {missedBy > 0 ? (
              <>
                You needed <strong className="text-white">{target}</strong> points — just {missedBy} more. Try again?
              </>
            ) : (
              <>You&apos;ve already earned this visit&apos;s voucher. Thanks for playing again!</>
            )}
          </p>
        )}
      </div>

      <ul data-in className="mx-auto mt-6 grid w-full max-w-sm grid-cols-4 gap-2" aria-label="Items caught">
        {ORDER.map((k) => (
          <li key={k} className="glass flex flex-col items-center rounded-2xl py-2.5">
            <GiftArt kind={k} style={styleOf(event.theme)} size={30} />
            <span className="mt-1 font-display text-lg font-bold tabular-nums">{result.caught[k]}</span>
            <span className="text-[10px] text-slate-400">{presetOf(event.theme).itemLabels[k]}</span>
          </li>
        ))}
      </ul>

      <div data-in className="mx-auto mt-6 w-full max-w-sm">
        {status === 'saving' && (
          <div className="py-6">
            <Spinner label="Saving your score" />
          </div>
        )}
        {status === 'error' && (
          <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-center text-sm text-rose-200" role="alert">
            We couldn&apos;t save this score. Your game still counts for fun — please try again.
          </p>
        )}
        {status === 'done' && voucher && <VoucherCard voucher={voucher} event={event} />}
        {status === 'done' && voucher && (
          <p className="mt-3 text-center text-xs text-slate-400">Screenshot this voucher or copy the reference. Show it at the counter.</p>
        )}
        {status === 'done' && !voucher && previousVoucher && (
          <details className="glass rounded-2xl p-4 text-sm">
            <summary className="cursor-pointer font-medium text-white">Show my voucher</summary>
            <div className="mt-4">
              <VoucherCard voucher={previousVoucher} event={event} />
            </div>
          </details>
        )}
      </div>

      <div data-in className="mx-auto mt-auto w-full max-w-sm pt-8">
        <Button size="lg" className="w-full" onClick={onReplay} icon={<Icon name="restart" size={18} />}>
          Play again
        </Button>
      </div>
    </div>
  );
}
