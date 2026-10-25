import { DEFAULT_SCORES, ITEM_LABELS } from '@/config/game';
import type { ItemKind } from '@/types/event';
import { Icon, type IconName } from '../ui/Icon';
import { GiftArt, GlassCard } from '../ui/Misc';

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center" data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h2>
      {copy && <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">{copy}</p>}
    </div>
  );
}

const STEPS: { icon: IconName; title: string; copy: string }[] = [
  { icon: 'palette', title: 'Brand your event', copy: 'Upload the client logo, set colours, write the welcome message and choose the reward.' },
  { icon: 'qr', title: 'Print the QR code', copy: 'Every event gets a unique URL and a high-resolution QR for booths, screens and signage.' },
  { icon: 'play', title: 'Visitors play', copy: 'A 30-second, skill-based game in the browser. No app, no sign-up, works on any phone.' },
  { icon: 'chart', title: 'Reward & measure', copy: 'Players who hit the target score get a voucher with a QR. Track visits, plays and redemptions.' },
];

export function HowItWorks() {
  return (
    <section id="how" className="section scroll-mt-24 py-24">
      <SectionHeading eyebrow="How it works" title="From brief to booth in an afternoon" copy="One platform, reused for every client. Configure, print and go live without a developer." />
      <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} data-reveal>
            <GlassCard className="relative h-full p-6">
              <span className="absolute right-5 top-5 font-display text-5xl font-bold text-white/5" aria-hidden="true">
                0{i + 1}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-400/25 to-electric-500/20 text-gold-300 ring-1 ring-white/10">
                <Icon name={s.icon} size={22} />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.copy}</p>
            </GlassCard>
          </li>
        ))}
      </ol>

      <div data-reveal className="mt-10">
        <GlassCard className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-between sm:p-8">
          <div className="text-center sm:text-left">
            <p className="eyebrow">Catch the Gift</p>
            <p className="mt-2 font-display text-xl font-semibold text-white">Simple rules. Instantly understood.</p>
          </div>
          <ul className="grid w-full grid-cols-4 gap-2 sm:w-auto sm:gap-5">
            {(Object.keys(DEFAULT_SCORES) as ItemKind[]).map((k) => (
              <li key={k} className="flex flex-col items-center text-center">
                <GiftArt kind={k} size={52} />
                <span className={`mt-1 font-display text-lg font-bold ${DEFAULT_SCORES[k] < 0 ? 'text-rose-300' : 'text-gold-300'}`}>
                  {DEFAULT_SCORES[k] > 0 ? '+' : ''}
                  {DEFAULT_SCORES[k]}
                </span>
                <span className="text-[11px] text-slate-400">{ITEM_LABELS[k]}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </section>
  );
}

const AGENCY: { icon: IconName; title: string; copy: string }[] = [
  { icon: 'sparkles', title: 'True white-label', copy: 'Your client’s logo, colours and copy on every screen. EventVerse stays invisible.' },
  { icon: 'bolt', title: 'Launch in minutes', copy: 'Clone an event, change the brand, print the QR. Reuse one build across every activation.' },
  { icon: 'chart', title: 'Reports clients love', copy: 'Visits, plays, completion, scores and redemptions — the numbers that prove ROI.' },
];

const BRAND: { icon: IconName; title: string; copy: string }[] = [
  { icon: 'users', title: 'Longer dwell time', copy: 'A playful reason to stop at the stand, scan and engage with the brand.' },
  { icon: 'store', title: 'Footfall that converts', copy: 'Skill-earned vouchers with QR codes drive visitors to the counter or store.' },
  { icon: 'shield', title: 'Brand-safe by design', copy: 'No paid entry and no random prize draws. Rewards are earned by playing.' },
];

function BenefitList({ title, items, tone }: { title: string; items: typeof AGENCY; tone: 'gold' | 'blue' }) {
  return (
    <GlassCard data-reveal className="p-6 sm:p-8">
      <h3 className={`text-sm font-semibold uppercase tracking-[0.2em] ${tone === 'gold' ? 'text-gold-300' : 'text-electric-300'}`}>{title}</h3>
      <ul className="mt-6 space-y-6">
        {items.map((b) => (
          <li key={b.title} className="flex gap-4">
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-white/10 ${
                tone === 'gold' ? 'bg-gold-400/15 text-gold-300' : 'bg-electric-400/15 text-electric-300'
              }`}
            >
              <Icon name={b.icon} size={20} />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-white">{b.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{b.copy}</p>
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

export function Benefits() {
  return (
    <section id="benefits" className="section scroll-mt-24 py-24">
      <SectionHeading eyebrow="Benefits" title="Built for agencies. Loved by brands." />
      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        <BenefitList title="For event agencies" items={AGENCY} tone="gold" />
        <BenefitList title="For brands" items={BRAND} tone="blue" />
      </div>
    </section>
  );
}
