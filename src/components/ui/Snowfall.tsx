import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Flake {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  a: number;
  tw: number;
}

/**
 * Lightweight canvas snowfall + glowing particles for page backgrounds.
 * Pauses when off-screen or when the tab is hidden; static when reduced motion is on.
 */
export function Snowfall({ density = 1, color = '#ffffff', className = '' }: { density?: number; color?: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let flakes: Flake[] = [];
    let raf = 0;
    let visible = true;

    const seed = () => {
      const count = Math.round(Math.min(120, (w * h) / 14000) * density);
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        vy: Math.random() * 0.35 + 0.15,
        vx: Math.random() * 0.2 - 0.1,
        a: Math.random() * 0.6 + 0.25,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw(0);
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += f.vy * dt;
        f.x += f.vx * dt + Math.sin(f.tw) * 0.08 * dt;
        f.tw += 0.01 * dt;
        if (f.y > h + 4) {
          f.y = -4;
          f.x = Math.random() * w;
        }
        if (f.x > w + 4) f.x = -4;
        if (f.x < -4) f.x = w + 4;
        const glow = f.r > 1.6;
        ctx.globalAlpha = f.a * (0.75 + Math.sin(f.tw * 2) * 0.25);
        ctx.fillStyle = glow && color === '#ffffff' ? '#fff3cf' : color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        if (glow) {
          ctx.globalAlpha *= 0.18;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;
      if (visible && !document.hidden) draw(dt);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [density, color, reduced]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
