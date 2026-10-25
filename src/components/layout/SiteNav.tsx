import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '@/config/site';
import { Logo } from '../ui/Brand';
import { ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 safe-top ${
        scrolled || open ? 'border-b border-white/10 bg-midnight-950/75 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="section flex h-16 items-center justify-between" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-2 md:flex">
          <Link to="/dashboard" className="rounded-full px-4 py-2 text-sm text-slate-300 hover:text-white">
            Dashboard
          </Link>
          <ButtonLink to="/demo/winter-festival" size="sm" icon={<Icon name="play" size={14} />}>
            Live demo
          </ButtonLink>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full text-white hover:bg-white/10 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="section h-[calc(100dvh-4rem)] overflow-y-auto pb-10 md:hidden">
          <ul className="flex flex-col gap-1 pt-4">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-4 font-display text-xl text-white hover:bg-white/5"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/dashboard" className="block rounded-2xl px-4 py-4 font-display text-xl text-white hover:bg-white/5">
                Dashboard
              </Link>
            </li>
          </ul>
          <ButtonLink to="/demo/winter-festival" size="lg" className="mt-6 w-full" icon={<Icon name="play" size={16} />}>
            Play the live demo
          </ButtonLink>
        </div>
      )}
    </header>
  );
}
