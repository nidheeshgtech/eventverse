import { useMemo, type HTMLAttributes, type ReactNode } from 'react';
import { itemSvg, svgDataUri } from '@/assets/art';
import type { ItemKind } from '@/types/event';

export function GlassCard({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass rounded-3xl ${className}`} {...rest}>
      {children}
    </div>
  );
}

type Tone = 'gold' | 'blue' | 'green' | 'rose' | 'slate' | 'purple';
const tones: Record<Tone, string> = {
  gold: 'bg-gold-400/15 text-gold-300 ring-gold-400/30',
  blue: 'bg-electric-400/15 text-electric-300 ring-electric-400/30',
  green: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30',
  rose: 'bg-rose-400/15 text-rose-300 ring-rose-400/30',
  slate: 'bg-white/10 text-slate-300 ring-white/15',
  purple: 'bg-plum-500/20 text-violet-200 ring-plum-500/40',
};

export function Badge({ tone = 'slate', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Persistent marker for anything that is not real data. */
export function SampleBadge({ label = 'Sample / Demo only' }: { label?: string }) {
  return (
    <Badge tone="gold">
      <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
      {label}
    </Badge>
  );
}

export function GiftArt({ kind, size = 64, className = '', alt }: { kind: ItemKind; size?: number; className?: string; alt?: string }) {
  const src = useMemo(() => svgDataUri(itemSvg(kind, `i${kind}`)), [kind]);
  return (
    <img
      src={src}
      width={size}
      height={Math.round(size * (128 / 120))}
      alt={alt ?? ''}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      className={`select-none ${className}`}
    />
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 text-slate-300">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-brand-primary" aria-hidden="true" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Spinner />
    </div>
  );
}
