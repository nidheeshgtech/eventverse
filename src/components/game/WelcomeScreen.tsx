import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ITEM_LABELS } from '@/config/game';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import type { EventConfig, ItemKind } from '@/types/event';
import { BrandMark } from '../ui/Brand';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { GiftArt, SampleBadge } from '../ui/Misc';
import { AudioToggle } from './AudioToggle';

interface Props {
  event: EventConfig;
  onStart: () => void;
}

const ORDER: ItemKind[] = ['gold', 'blue', 'purple', 'snowball'];

export function WelcomeScreen({ event, onStart }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-in]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.07 });
      gsap.to('[data-bob]', { y: -8, rotate: 4, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.25 });
    }, root);
    return () => ctx.revert();
  }, []);

  const scores = event.game.scores;

  return (
    <div ref={root} className="flex min-h-full flex-col px-5 pb-6 pt-5 safe-bottom">
      <div className="flex items-center justify-between" data-in>
        <SampleBadge label="Demo" />
        <AudioToggle />
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center text-center">
        <div data-in>
          <BrandMark event={event} size={76} />
        </div>
        <p data-in className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-accent">
          {event.brandName}
        </p>
        <h1 data-in className="mt-2 text-[2rem] font-bold leading-tight sm:text-4xl">
          Catch the <span className="text-brand">Gift</span>
        </h1>
        {event.tagline && (
          <p data-in className="mt-1 text-sm text-slate-400">
            {event.tagline}
          </p>
        )}
        <p data-in className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-200">
          {event.welcomeMessage}
        </p>

        <ul data-in className="mt-7 grid w-full max-w-sm grid-cols-4 gap-2" aria-label="Points per item">
          {ORDER.map((k) => (
            <li key={k} className="glass flex flex-col items-center rounded-2xl px-1 pb-2 pt-3">
              <span data-bob>
                <GiftArt kind={k} size={k === 'snowball' ? 40 : 46} />
              </span>
              <span className={`mt-1 font-display text-base font-bold ${scores[k] < 0 ? 'text-rose-300' : 'text-white'}`}>
                {scores[k] > 0 ? '+' : ''}
                {scores[k]}
              </span>
              <span className="text-[10px] leading-tight text-slate-400">{ITEM_LABELS[k]}</span>
            </li>
          ))}
        </ul>

        <div data-in className="mt-5 flex w-full max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-left">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-primary/20 text-brand-primary">
            <Icon name="clock" size={20} />
          </span>
          <p className="text-xs leading-relaxed text-slate-300">
            <strong className="text-white">{event.game.durationSec} seconds.</strong> Drag your finger, move the mouse or use ← → to move the basket.
            {event.reward.enabled && (
              <>
                {' '}
                Score <strong className="text-white">{event.reward.threshold}+</strong> to earn a sample voucher.
              </>
            )}
          </p>
        </div>
      </div>

      <div data-in className="mx-auto mt-8 w-full max-w-sm">
        <Button size="lg" className="w-full" onClick={onStart} icon={<Icon name="play" size={16} />}>
          Start game
        </Button>
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Free to play · Skill-based · Powered by EventVerse
        </p>
      </div>
    </div>
  );
}
