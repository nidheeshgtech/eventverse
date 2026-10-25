import { lazy, Suspense, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { absoluteUrl } from '@/config/env';
import { DEMO_EVENTS, DEMO_SHOWCASE } from '@/config/demoEvents';
import { presetOf, styleOf } from '@/config/styles';
import { eventPath } from '@/config/site';
import { themeVars } from '@/services/color';
import type { EventConfig, ItemKind } from '@/types/event';
import { EventBackdrop } from '../game/EventBackdrop';
import { BrandMark } from '../ui/Brand';
import { ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Badge, GiftArt } from '../ui/Misc';

// The QR library only loads when a visitor asks for a code.
const QRCode = lazy(() => import('../ui/QRCode').then((m) => ({ default: m.QRCode })));

const ITEMS: ItemKind[] = ['gold', 'blue', 'purple', 'snowball'];

function DemoCard({ event, industry, pitch }: { event: EventConfig; industry: string; pitch: string }) {
  const [showQr, setShowQr] = useState(false);
  const style = styleOf(event.theme);
  const preset = presetOf(event.theme);
  const path = eventPath(event.slug);

  return (
    <article
      data-reveal
      style={themeVars(event.theme.primary, event.theme.accent) as CSSProperties}
      className="glass flex flex-col overflow-hidden rounded-3xl transition hover:border-white/25"
    >
      <EventBackdrop event={event} particles={false} loadFont={false} className="h-56 border-b border-white/10">
        {showQr ? (
          <div className="relative flex h-full flex-col items-center justify-center gap-2">
            <Suspense fallback={<span className="h-[136px] w-[136px] animate-pulse rounded-2xl bg-white/20" />}>
              <QRCode value={absoluteUrl(path)} size={120} label={`QR code to play the ${event.brandName} demo`} />
            </Suspense>
            <p className="text-xs font-medium text-slate-200">Scan with your phone camera</p>
          </div>
        ) : (
          <div className="relative flex h-full flex-col items-center justify-center gap-4">
            <BrandMark event={event} size={72} />
            <ul className="flex items-end gap-2" aria-label={`${preset.label} game items`}>
              {ITEMS.map((k) => (
                <li key={k}>
                  <GiftArt kind={k} style={style} size={k === 'snowball' ? 32 : 38} className="drop-shadow-[0_8px_14px_rgba(0,0,0,.45)]" />
                </li>
              ))}
            </ul>
          </div>
        )}
        <span className="absolute left-4 top-4">
          <Badge tone="slate">{preset.label} style</Badge>
        </span>
      </EventBackdrop>

      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow">{industry}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold">{event.brandName}</h3>
          <Badge tone="gold">Fictional brand</Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{pitch}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">Target {event.reward.threshold} pts</span>
          <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">Sample voucher: {event.reward.discountLabel}</span>
          <span className="rounded-full bg-white/5 px-3 py-1 capitalize text-slate-300">{event.game.difficulty}</span>
        </div>

        <div className="mt-auto pt-6">
          <ButtonLink to={path} className="w-full" icon={<Icon name="play" size={14} />}>
            Play this demo
          </ButtonLink>
          <div className="mt-3 flex items-center justify-between gap-2 text-sm">
            <button
              type="button"
              onClick={() => setShowQr((v) => !v)}
              aria-pressed={showQr}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-slate-200 hover:bg-white/5"
            >
              <Icon name={showQr ? 'close' : 'qr'} size={16} />
              {showQr ? 'Hide QR' : 'Show QR'}
            </button>
            <Link to={`/dashboard?event=${encodeURIComponent(event.id)}`} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-slate-200 hover:bg-white/5">
              <Icon name="chart" size={16} /> Sample analytics
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function DemoShowcase() {
  const demos = DEMO_SHOWCASE.map((d) => ({ ...d, event: DEMO_EVENTS.find((e) => e.slug === d.slug) })).filter(
    (d): d is typeof d & { event: EventConfig } => Boolean(d.event),
  );

  return (
    <section id="demos" className="section scroll-mt-24 py-24">
      <div className="mx-auto max-w-2xl text-center" data-reveal>
        <p className="eyebrow">Choose demo experience</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">One engine. Any brand.</h2>
        <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
          The same game, three very different clients. Play each one on your phone, or scan its QR code from your desktop.
        </p>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {demos.map((d) => (
          <DemoCard key={d.slug} event={d.event} industry={d.industry} pitch={d.pitch} />
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-slate-500" data-reveal>
        All brands, venues, vouchers and analytics in these demos are fictional and for demonstration only.
      </p>
    </section>
  );
}
