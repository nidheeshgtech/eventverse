import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { Icon } from '../ui/Icon';
import { GiftArt } from '../ui/Misc';
import { Snowfall } from '../ui/Snowfall';
import { GamePreview } from './GamePreview';

const FACTS = [
  { value: '< 3 s', label: 'QR scan to play' },
  { value: '0', label: 'App downloads' },
  { value: '100%', label: 'White-label' },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !root.current) return;
    const ctx = gsap.context(() => {
      // fromTo with explicit end values: `from` would read end state from the DOM,
      // which is wrong while a CSS transition (e.g. on buttons) is mid-flight.
      const show = { y: 0, opacity: 1 };
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('[data-hero="badge"]', { y: 16, opacity: 0 }, { ...show, duration: 0.6 })
        .fromTo('[data-hero="line"]', { y: 40, opacity: 0 }, { ...show, duration: 0.9, stagger: 0.12 }, '-=0.3')
        .fromTo('[data-hero="copy"]', { y: 20, opacity: 0 }, { ...show, duration: 0.7 }, '-=0.5')
        .fromTo('[data-hero="cta"] > *', { y: 16, opacity: 0 }, { ...show, duration: 0.6, stagger: 0.08 }, '-=0.4')
        .fromTo('[data-hero="fact"]', { y: 16, opacity: 0 }, { ...show, duration: 0.5, stagger: 0.06 }, '-=0.3')
        .fromTo('[data-hero="phone"]', { y: 60, opacity: 0, rotate: 4 }, { ...show, rotate: 0, duration: 1.1 }, 0.2);
      gsap.to('[data-hero="orbit"]', { y: -14, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.6 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden pb-20 pt-28 sm:pt-32 lg:pb-28">
      <Snowfall />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-plum-500/20 blur-[120px]" aria-hidden="true" />

      <div className="section relative grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        <div className="text-center lg:text-left">
          <span data-hero="badge" className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-slate-200">
            <Icon name="snowflake" size={14} className="text-electric-300" />
            Built for Dubai exhibitions, retail &amp; festivals
          </span>

          <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.05] sm:text-6xl lg:text-[4.25rem]">
            <span data-hero="line" className="block">Turn every visitor</span>
            <span data-hero="line" className="block">
              into a <span className="text-gold animate-shimmer">player.</span>
            </span>
          </h1>

          <p data-hero="copy" className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0">
            EventVerse is a white-label gaming platform for experiential events. Visitors scan a QR code, play a
            30-second branded game and earn a reward — while you measure every interaction.
          </p>

          <div data-hero="cta" className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a href="#demos" className="bg-brand-gradient inline-flex h-14 items-center gap-2 rounded-full px-7 font-display text-base font-semibold shadow-glow transition hover:brightness-110 sm:text-lg">
              <Icon name="play" size={16} /> Choose a live demo
            </a>
            <a href="#book" className="glass inline-flex h-14 items-center gap-2 rounded-full px-7 font-display font-semibold text-white transition hover:bg-white/10">
              Book a demo <Icon name="arrowRight" size={18} />
            </a>
          </div>

          <dl className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-4 lg:mx-0">
            {FACTS.map((f) => (
              <div key={f.label} data-hero="fact" className="flex flex-col text-center lg:text-left">
                <dt className="order-2 text-xs text-slate-400">{f.label}</dt>
                <dd className="font-display text-2xl font-bold text-white sm:text-3xl">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-hero="phone" className="relative">
          <div data-hero="orbit" className="absolute -left-2 top-16 hidden sm:block lg:-left-6" aria-hidden="true">
            <GiftArt kind="gold" size={72} className="rotate-[-12deg] drop-shadow-[0_20px_30px_rgba(249,211,107,.35)]" />
          </div>
          <div data-hero="orbit" className="absolute -right-2 bottom-24 hidden sm:block lg:-right-4" aria-hidden="true">
            <GiftArt kind="blue" size={64} className="rotate-[14deg] drop-shadow-[0_20px_30px_rgba(76,195,255,.35)]" />
          </div>
          <GamePreview />
        </div>
      </div>
    </section>
  );
}
