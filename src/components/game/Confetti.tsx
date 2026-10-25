import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';

const COLORS = ['#f9d36b', '#fff1bf', '#4cc3ff', '#a57bff', '#ffffff'];

/** One-shot GSAP confetti burst. Renders nothing for reduced-motion users. */
export function Confetti({ pieces = 70 }: { pieces?: number }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const nodes: HTMLSpanElement[] = [];
    for (let i = 0; i < pieces; i++) {
      const s = document.createElement('span');
      const w = gsap.utils.random(6, 11);
      s.style.cssText = `position:absolute;left:50%;top:38%;width:${w}px;height:${w * gsap.utils.random(0.4, 1.6)}px;background:${
        COLORS[i % COLORS.length]
      };border-radius:${Math.random() > 0.6 ? '50%' : '2px'};will-change:transform,opacity;`;
      el.appendChild(s);
      nodes.push(s);
    }
    const tl = gsap.timeline({ onComplete: () => nodes.forEach((n) => n.remove()) });
    nodes.forEach((n) => {
      const angle = gsap.utils.random(-Math.PI, 0);
      const dist = gsap.utils.random(120, 340);
      tl.fromTo(
        n,
        { x: 0, y: 0, rotate: 0, opacity: 1 },
        {
          keyframes: [
            { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, duration: 0.6, ease: 'power3.out' },
            { y: `+=${gsap.utils.random(260, 520)}`, x: `+=${gsap.utils.random(-60, 60)}`, opacity: 0, duration: 1.6, ease: 'power1.in' },
          ],
          rotate: gsap.utils.random(-540, 540),
        },
        gsap.utils.random(0, 0.15),
      );
    });
    return () => {
      tl.kill();
      nodes.forEach((n) => n.remove());
    };
  }, [pieces]);

  return <div ref={root} className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true" />;
}
