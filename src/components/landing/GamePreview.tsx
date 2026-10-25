import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { DEFAULT_SCORES, ITEM_LABELS } from '@/config/game';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ItemKind } from '@/types/event';
import { GiftArt } from '../ui/Misc';
import { Icon } from '../ui/Icon';
import { ButtonLink } from '../ui/Button';

interface Drop {
  id: number;
  kind: ItemKind;
  x: number; // percent
}

const KINDS: ItemKind[] = ['purple', 'blue', 'gold', 'purple', 'blue', 'snowball'];

/**
 * A tap-to-catch teaser inside a phone mockup. Pure DOM + GSAP so the landing page
 * stays light; the real Phaser game loads only on the demo route.
 */
export function GamePreview() {
  const reduced = useReducedMotion();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [score, setScore] = useState(0);
  const [pops, setPops] = useState<{ id: number; x: number; y: number; label: string; bad: boolean }[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const tweens = useRef(new Map<number, gsap.core.Tween>());
  const nextId = useRef(1);
  const inView = useRef(true);

  const remove = useCallback((id: number) => {
    tweens.current.get(id)?.kill();
    tweens.current.delete(id);
    setDrops((d) => d.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting));
    io.observe(el);
    if (reduced) {
      setDrops([
        { id: 1, kind: 'gold', x: 20 },
        { id: 2, kind: 'blue', x: 62 },
        { id: 3, kind: 'purple', x: 40 },
      ]);
      return () => io.disconnect();
    }
    const timer = window.setInterval(() => {
      if (!inView.current || document.hidden) return;
      setDrops((d) =>
        d.length > 5 ? d : [...d, { id: nextId.current++, kind: KINDS[Math.floor(Math.random() * KINDS.length)], x: 8 + Math.random() * 72 }],
      );
    }, 800);
    const map = tweens.current;
    return () => {
      window.clearInterval(timer);
      io.disconnect();
      map.forEach((t) => t.kill());
      map.clear();
    };
  }, [reduced]);

  // Start a fall tween for each new drop.
  const attach = useCallback(
    (id: number) => (node: HTMLButtonElement | null) => {
      if (!node || reduced || tweens.current.has(id)) return;
      const h = stage.current?.clientHeight ?? 420;
      const t = gsap.fromTo(
        node,
        { y: -80, rotate: gsap.utils.random(-20, 20) },
        {
          y: h + 20,
          rotate: gsap.utils.random(-40, 40),
          duration: gsap.utils.random(3.2, 4.6),
          ease: 'none',
          onComplete: () => remove(id),
        },
      );
      tweens.current.set(id, t);
    },
    [reduced, remove],
  );

  const catchDrop = (drop: Drop, el: HTMLElement) => {
    const delta = DEFAULT_SCORES[drop.kind];
    setScore((s) => Math.max(0, s + delta));
    const box = el.getBoundingClientRect();
    const host = stage.current!.getBoundingClientRect();
    const pop = { id: drop.id, x: box.left - host.left + box.width / 2, y: box.top - host.top, label: delta > 0 ? `+${delta}` : `${delta}`, bad: delta < 0 };
    setPops((p) => [...p, pop]);
    window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== pop.id)), 700);
    tweens.current.get(drop.id)?.kill();
    tweens.current.delete(drop.id);
    gsap.to(el, { scale: 1.35, opacity: 0, duration: 0.22, ease: 'power2.out', onComplete: () => remove(drop.id) });
  };

  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]" aria-label="Interactive game preview">
      <div className="absolute -inset-10 rounded-[4rem] bg-gradient-to-br from-gold-400/25 via-plum-500/25 to-electric-500/25 blur-3xl" aria-hidden="true" />
      <div className="relative rounded-[2.75rem] border border-white/15 bg-midnight-900 p-2.5 shadow-2xl">
        <div className="relative h-[540px] overflow-hidden rounded-[2.25rem] bg-[radial-gradient(ellipse_at_top,#2a1659,#0a0b26_70%)]">
          <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black/70" aria-hidden="true" />
          <div className="absolute inset-x-0 top-10 z-20 flex items-center justify-between px-5">
            <div className="glass rounded-full px-3 py-1.5 font-display text-sm font-bold text-gold-300" aria-live="polite">
              {score} pts
            </div>
            <div className="glass rounded-full px-3 py-1.5 text-xs font-medium text-slate-200">Tap the gifts</div>
          </div>

          <div ref={stage} className="absolute inset-0 z-10">
            {drops.map((d) => (
              <button
                key={d.id}
                ref={attach(d.id)}
                type="button"
                onPointerDown={(e) => catchDrop(d, e.currentTarget)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && catchDrop(d, e.currentTarget)}
                aria-label={`Catch ${ITEM_LABELS[d.kind]} (${DEFAULT_SCORES[d.kind] > 0 ? '+' : ''}${DEFAULT_SCORES[d.kind]})`}
                className="absolute top-0 touch-manipulation"
                style={{ left: `${d.x}%`, top: reduced ? `${30 + (d.id % 3) * 18}%` : 0 }}
              >
                <GiftArt kind={d.kind} size={d.kind === 'snowball' ? 46 : 58} className="drop-shadow-[0_10px_18px_rgba(0,0,0,.45)]" />
              </button>
            ))}
            {pops.map((p) => (
              <span
                key={p.id}
                className={`pointer-events-none absolute animate-rise font-display text-2xl font-extrabold ${p.bad ? 'text-rose-300' : 'text-gold-300'}`}
                style={{ left: p.x, top: p.y }}
                aria-hidden="true"
              >
                {p.label}
              </span>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-midnight-950 via-midnight-950/80 to-transparent px-5 pb-6 pt-16">
            <ButtonLink to="/demo/winter-festival" className="w-full" icon={<Icon name="play" size={14} />}>
              Play the full game
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
