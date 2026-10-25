import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { EVENT_TYPES } from '@/config/site';
import { data } from '@/services/data';
import { emailDemoRequest } from '@/services/leads';
import { clean, validateDemoRequest, type FieldErrors } from '@/services/validation';
import type { DemoRequest } from '@/types/event';
import { Button } from '../ui/Button';
import { SelectField, TextArea, TextField } from '../ui/Field';
import { Icon } from '../ui/Icon';
import { GlassCard } from '../ui/Misc';

const EMPTY: DemoRequest = { name: '', email: '', company: '', phone: '', eventType: '', message: '' };

export function BookDemo() {
  const [form, setForm] = useState<DemoRequest>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<DemoRequest>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [trap, setTrap] = useState('');

  const set = (key: keyof DemoRequest) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (trap) return; // honeypot: bots fill hidden fields
    const found = validateDemoRequest(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus('sending');
    const request: DemoRequest = {
      name: clean(form.name, 120),
      email: clean(form.email, 254).toLowerCase(),
      company: clean(form.company, 120),
      phone: clean(form.phone, 20),
      eventType: form.eventType,
      message: clean(form.message, 1000),
    };
    try {
      // The email is what reaches the team; the data-service copy is a backup record.
      await emailDemoRequest(request);
      await data.submitDemoRequest(request).catch(() => undefined);
      setStatus('sent');
      setForm(EMPTY);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="book" className="section scroll-mt-24 py-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div data-reveal>
          <p className="eyebrow">Book a demo</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">Bring EventVerse to your next activation</h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
            Tell us about your event and we&apos;ll walk you through a branded build for your client — on your phone, at your
            booth, in under 30 minutes.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-slate-300">
            {['A live, branded demo with your client’s logo', 'Reward and scoring strategy for your audience', 'Deployment plan for QR, screens and staff'].map(
              (t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-gold-400/20 text-gold-300">
                    <Icon name="check" size={12} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ),
            )}
          </ul>
        </div>

        <GlassCard data-reveal className="p-6 sm:p-8">
          {status === 'sent' ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center" role="status">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30">
                <Icon name="check" size={30} strokeWidth={2.5} />
              </span>
              <h3 className="mt-6 text-2xl font-semibold">Request received</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Thanks — we&apos;ll be in touch shortly to set up your branded demo.
              </p>
              <Button variant="secondary" className="mt-8" onClick={() => setStatus('idle')}>
                Send another
              </Button>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
              <TextField label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} maxLength={120} required />
              <TextField label="Work email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} error={errors.email} maxLength={254} required />
              <TextField label="Company" autoComplete="organization" value={form.company} onChange={set('company')} error={errors.company} maxLength={120} required />
              <TextField label="Phone (optional)" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set('phone')} error={errors.phone} maxLength={20} placeholder="+971" />
              <SelectField label="Event type" value={form.eventType} onChange={set('eventType')} error={errors.eventType} wrapperClassName="sm:col-span-2" required>
                <option value="">Select an event type</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectField>
              <TextArea
                label="Tell us about the event (optional)"
                value={form.message}
                onChange={set('message')}
                error={errors.message}
                maxLength={1000}
                wrapperClassName="sm:col-span-2"
                placeholder="Dates, venue, expected footfall, reward ideas…"
              />
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label>
                  Leave this empty
                  <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                </label>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Request a demo'}
                </Button>
                {status === 'error' && (
                  <p className="mt-3 text-center text-sm text-rose-300" role="alert">
                    Something went wrong. Please try again.
                  </p>
                )}
                <p className="mt-3 text-center text-xs text-slate-500">We only use your details to respond to this request.</p>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="section pb-24">
      <div data-reveal className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-plum-800 via-midnight-800 to-midnight-900 px-6 py-16 text-center sm:px-12">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold-400/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-electric-500/20 blur-3xl" aria-hidden="true" />
        <h2 className="relative text-3xl font-bold sm:text-5xl">
          Ready to make your stand <span className="text-gold">unmissable?</span>
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-slate-300">Play the demo on your phone, then open the dashboard to see how events are configured.</p>
        <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="#book" className="bg-brand-gradient inline-flex h-14 items-center justify-center rounded-full px-7 font-display font-semibold shadow-glow">
            Book a demo
          </a>
          <Link to="/dashboard" className="glass inline-flex h-14 items-center justify-center gap-2 rounded-full px-7 font-display font-semibold text-white">
            Explore the dashboard <Icon name="arrowRight" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
