import { Link } from 'react-router-dom';
import { SITE } from '@/config/site';
import { Logo } from '../ui/Brand';

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 pb-10 pt-14 safe-bottom">
      <div className="section grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            White-label interactive games for exhibitions, retail activations, winter festivals and corporate events.
          </p>
          <p className="mt-4 text-xs text-slate-500">
            {SITE.company} · {SITE.city}. All brands, events and rewards shown are fictional and for demonstration only.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Live demos</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link className="hover:text-white" to="/demo/luxury-perfume">Luxury perfume exhibition</Link></li>
            <li><Link className="hover:text-white" to="/demo/winter-festival">Dubai winter festival</Link></li>
            <li><Link className="hover:text-white" to="/demo/exhibition-booth">Corporate exhibition booth</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Platform</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link className="hover:text-white" to="/dashboard">Admin dashboard</Link></li>
            <li><Link className="hover:text-white" to="/dashboard/events/new">Create an event</Link></li>
            <li><a className="hover:text-white" href="#book">Book a demo</a></li>
          </ul>
        </div>
      </div>
      <div className="section mt-12">
        <div className="hairline" />
        <p className="mt-6 text-xs text-slate-500">© {new Date().getFullYear()} EventVerse demo. No paid entry, no chance-based prizes — rewards are earned by skill.</p>
      </div>
    </footer>
  );
}
