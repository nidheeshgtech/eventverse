import { useId } from 'react';
import { Link } from 'react-router-dom';
import type { EventConfig } from '@/types/event';
import { readableOn } from '@/services/color';

/** EventVerse wordmark. */
export function Logo({ className = '' }: { className?: string }) {
  // Unique gradient id: a duplicate id inside a hidden copy (e.g. desktop sidebar) breaks the fill.
  const gid = `ev-logo-${useId().replace(/:/g, '')}`;
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="EventVerse home">
      <svg width="32" height="32" viewBox="0 0 64 64" aria-hidden="true" className="transition-transform duration-500 group-hover:rotate-45">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe7a3" />
            <stop offset=".5" stopColor="#f9d36b" />
            <stop offset="1" stopColor="#4cc3ff" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="#11133a" stroke="rgba(255,255,255,.12)" />
        <path d="M32 10l5.5 14.5L52 30l-14.5 5.5L32 50l-5.5-14.5L12 30l14.5-5.5z" fill={`url(#${gid})`} />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight text-white">
        Event<span className="text-gold">Verse</span>
      </span>
    </Link>
  );
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'EV'
  );
}

/** Client logo, or an elegant monogram when no logo has been uploaded. */
export function BrandMark({ event, size = 56 }: { event: Pick<EventConfig, 'brandName' | 'logoUrl' | 'theme'>; size?: number }) {
  // Built-in demo logos are full-bleed SVG tiles. Uploaded logos are PNG/JPG/WebP
  // (SVG uploads are rejected), so the prefix reliably identifies them.
  if (event.logoUrl?.startsWith('data:image/svg+xml')) {
    return (
      <img
        src={event.logoUrl}
        alt={`${event.brandName} logo`}
        width={size}
        height={size}
        className="rounded-2xl shadow-glow ring-1 ring-white/15"
        style={{ width: size, height: size }}
      />
    );
  }
  if (event.logoUrl) {
    return (
      <span
        className="inline-grid place-items-center overflow-hidden rounded-2xl bg-white/95 p-1.5 shadow-glow"
        style={{ width: size, height: size }}
      >
        <img src={event.logoUrl} alt={`${event.brandName} logo`} className="max-h-full max-w-full object-contain" />
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label={`${event.brandName} logo`}
      className="inline-grid place-items-center rounded-2xl font-display font-bold shadow-glow ring-1 ring-white/20"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${event.theme.primary}, ${event.theme.accent})`,
        color: readableOn(event.theme.primary),
      }}
    >
      {initials(event.brandName)}
    </span>
  );
}
