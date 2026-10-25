import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useDocumentHidden } from '@/hooks/useDocumentHidden';
import { presetOf, styleOf } from '@/config/styles';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { sound } from '@/services/sound';
import type { EventConfig } from '@/types/event';
import type { GameHandle, GameResult } from '@/types/game';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Spinner } from '../ui/Misc';
import { AudioToggle } from './AudioToggle';

interface Props {
  event: EventConfig;
  onEnd: (result: GameResult) => void;
  onQuit: () => void;
}

type Phase = 'loading' | 'countdown' | 'running' | 'paused' | 'error';

export function GameStage({ event, onEnd, onQuit }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<GameHandle | null>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('loading');
  const [count, setCount] = useState(3);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(event.game.durationSec * 1000);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  // Boot Phaser (lazy-loaded) once per mount. Replays remount this component.
  useEffect(() => {
    let disposed = false;
    const el = host.current;
    if (!el) return;
    import('@/game/createGame')
      .then(({ createGame }) =>
        createGame(
          el,
          {
            durationSec: event.game.durationSec,
            difficulty: event.game.difficulty,
            scores: event.game.scores,
            basketColor: event.theme.primary,
            reducedMotion: reduced,
            style: styleOf(event.theme),
            particle: presetOf(event.theme).particle,
          },
          {
            onScore: (s) => setScore(s),
            onTick: (ms) => setRemaining(ms),
            onEnd: (r) => endRef.current(r),
          },
        ),
      )
      .then((h) => {
        if (disposed) return h.destroy();
        handle.current = h;
        setPhase('countdown');
      })
      .catch(() => !disposed && setPhase('error'));
    return () => {
      disposed = true;
      handle.current?.destroy();
      handle.current = null;
    };
    // The game is configured once per round; settings changes apply on the next round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3-2-1 countdown, paused while the pause overlay is open.
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (count === 0) {
      // Resume (after a pause) and start (first round) are both no-ops when not needed.
      handle.current?.resume();
      handle.current?.start();
      setPhase('running');
      return;
    }
    sound.play('tick');
    const t = window.setTimeout(() => setCount((c) => c - 1), 800);
    return () => window.clearTimeout(t);
  }, [phase, count]);

  // Score bump.
  useEffect(() => {
    if (!reduced && scoreRef.current && score > 0) {
      gsap.fromTo(scoreRef.current, { scale: 1.25 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' });
    }
  }, [score, reduced]);

  const pause = useCallback(() => {
    if (phaseRef.current !== 'running' && phaseRef.current !== 'countdown') return;
    handle.current?.pause();
    setPhase('paused');
  }, []);

  // The scene stays paused through a fresh 3-2-1 so nothing falls while the player re-orients.
  const resume = () => {
    setCount(3);
    setPhase('countdown');
  };

  // Auto-pause when the tab is hidden or the phone is locked.
  useDocumentHidden(pause);

  // Keyboard shortcut: P / Escape toggles pause.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' && e.key.toLowerCase() !== 'p') return;
      if (phaseRef.current === 'paused') resume();
      else pause();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pause]);

  const total = event.game.durationSec * 1000;
  const seconds = Math.ceil(remaining / 1000);
  const pct = Math.max(0, Math.min(1, remaining / total));
  const urgent = seconds <= 5 && phase === 'running';
  const target = event.reward.enabled ? event.reward.threshold : 0;

  return (
    <div className="relative h-full w-full select-none overflow-hidden">
      <div
        ref={host}
        className="absolute inset-0 touch-none"
        role="application"
        aria-label="Catch the Gift game. Move the basket with your finger, mouse or the left and right arrow keys."
      />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-4 pt-3 safe-top">
        <div className="flex items-start justify-between gap-3">
          <div className="glass rounded-2xl px-4 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Score</p>
            <span ref={scoreRef} className="block font-['Outfit',system-ui,sans-serif] text-2xl font-bold tabular-nums text-white">
              {score}
            </span>
          </div>

          <div className={`glass rounded-2xl px-4 py-2 text-center ${urgent ? 'ring-2 ring-rose-400/60' : ''}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Time</p>
            <span className={`block font-['Outfit',system-ui,sans-serif] text-2xl font-bold tabular-nums ${urgent ? 'text-rose-300' : 'text-white'}`}>
              {seconds}s
            </span>
          </div>

          <div className="pointer-events-auto flex gap-2">
            <AudioToggle />
            <button
              type="button"
              onClick={pause}
              aria-label="Pause game"
              className="glass grid h-11 w-11 place-items-center rounded-full text-white hover:bg-white/10"
            >
              <Icon name="pause" size={18} />
            </button>
          </div>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div
            className={`h-full rounded-full transition-[width] duration-100 ease-linear ${urgent ? 'bg-rose-400' : 'bg-brand-gradient'}`}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        {target > 0 && (
          <p className="mt-2 text-center text-[11px] font-medium text-slate-300">
            {score >= target ? (
              <span className="text-emerald-300">Target reached — keep going!</span>
            ) : (
              <>Target {target} pts</>
            )}
          </p>
        )}
      </div>

      {phase === 'loading' && (
        <div className="absolute inset-0 z-20 grid place-items-center">
          <Spinner label="Preparing the game" />
        </div>
      )}

      {phase === 'error' && (
        <div className="absolute inset-0 z-20 grid place-items-center p-6 text-center">
          <div>
            <p className="text-lg font-semibold">The game could not start.</p>
            <p className="mt-1 text-sm text-slate-400">Please check your connection and try again.</p>
            <Button className="mt-6" onClick={onQuit}>
              Back
            </Button>
          </div>
        </div>
      )}

      {phase === 'countdown' && count > 0 && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center" aria-live="assertive">
          <span key={count} className="font-display text-[7rem] font-bold text-white drop-shadow-[0_0_40px_rgb(var(--brand-primary)/0.7)] motion-safe:animate-count">
            {count}
          </span>
        </div>
      )}

      {phase === 'paused' && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-midnight-950/70 p-6 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="pause-title">
          <div className="glass-strong w-full max-w-xs rounded-3xl p-6 text-center">
            <h2 id="pause-title" className="text-2xl font-bold">
              Paused
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Score {score} · {seconds}s left
            </p>
            <div className="mt-6 grid gap-3">
              <Button size="lg" onClick={resume} autoFocus icon={<Icon name="play" size={14} />}>
                Resume
              </Button>
              <Button variant="secondary" onClick={onQuit} icon={<Icon name="restart" size={16} />}>
                Quit to start
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
