import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QrDialog } from '@/components/dashboard/QrPanel';
import { formatDate } from '@/components/game/VoucherCard';
import { BrandMark } from '@/components/ui/Brand';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge, Spinner } from '@/components/ui/Misc';
import { useToast } from '@/components/ui/Toast';
import { DEMO_EVENTS } from '@/config/demoEvents';
import { eventPath } from '@/config/site';
import { useAsync } from '@/hooks/useAsync';
import { data } from '@/services/data';
import { localISODate } from '@/services/dates';
import { uuid } from '@/services/ids';
import type { EventConfig } from '@/types/event';

export function eventStatus(ev: EventConfig): { label: string; tone: 'green' | 'blue' | 'slate' } {
  const today = localISODate();
  if (today < ev.startDate) return { label: 'Scheduled', tone: 'blue' };
  if (today > ev.endDate) return { label: 'Ended', tone: 'slate' };
  return { label: 'Live', tone: 'green' };
}

const isBuiltIn = (id: string) => DEMO_EVENTS.some((d) => d.id === id);

export default function EventsPage() {
  const { data: events, loading, reload } = useAsync(() => data.listEvents(), []);
  const [qrFor, setQrFor] = useState<EventConfig | null>(null);
  const toast = useToast();

  const duplicate = async (ev: EventConfig) => {
    const taken = new Set(events?.map((e) => e.slug));
    let slug = `${ev.slug}-copy`.slice(0, 48);
    for (let i = 2; taken.has(slug); i++) slug = `${ev.slug.slice(0, 42)}-copy-${i}`;
    const now = new Date().toISOString();
    await data.saveEvent({ ...ev, id: uuid(), slug, eventName: `${ev.eventName} (copy)`, createdAt: now, updatedAt: now });
    toast('Event duplicated');
    reload();
  };

  const remove = async (ev: EventConfig) => {
    const builtIn = isBuiltIn(ev.id);
    const msg = builtIn ? `Reset "${ev.brandName}" to its original demo settings?` : `Delete "${ev.brandName}"? This cannot be undone.`;
    if (!window.confirm(msg)) return;
    await data.deleteEvent(ev.id);
    toast(builtIn ? 'Demo event reset' : 'Event deleted');
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Events</h1>
          <p className="mt-1 text-sm text-slate-400">Each event has its own URL, branding, game settings and rewards.</p>
        </div>
        <ButtonLink to="/dashboard/events/new" icon={<Icon name="plus" size={16} />}>
          Create event
        </ButtonLink>
      </div>

      {loading ? (
        <div className="py-20">
          <Spinner />
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events?.map((ev) => {
            const st = eventStatus(ev);
            return (
              <li key={ev.id} className="glass flex flex-col rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <BrandMark event={ev} size={48} />
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {ev.environment === 'demo' && <Badge tone="gold">Demo</Badge>}
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                </div>
                <h2 className="mt-4 text-lg font-semibold">{ev.brandName}</h2>
                <p className="text-sm text-slate-400">{ev.eventName}</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white/5 p-2.5">
                    <dt className="text-slate-400">Dates</dt>
                    <dd className="mt-0.5 text-slate-100">
                      {formatDate(ev.startDate)} – {formatDate(ev.endDate)}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2.5">
                    <dt className="text-slate-400">Reward</dt>
                    <dd className="mt-0.5 text-slate-100">{ev.reward.enabled ? `${ev.reward.discountLabel} at ${ev.reward.threshold}+` : 'Off'}</dd>
                  </div>
                </dl>
                <p className="mt-3 truncate font-mono text-[11px] text-slate-500">{eventPath(ev.slug)}</p>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  <ButtonLink to={`/dashboard/events/${ev.id}`} size="sm" variant="secondary" icon={<Icon name="edit" size={14} />}>
                    Edit
                  </ButtonLink>
                  <Button size="sm" variant="ghost" onClick={() => setQrFor(ev)} icon={<Icon name="qr" size={14} />}>
                    QR
                  </Button>
                  <Link
                    to={eventPath(ev.slug)}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-slate-200 hover:bg-white/5"
                  >
                    <Icon name="external" size={14} /> Open
                  </Link>
                  <div className="ml-auto flex gap-1">
                    <button
                      type="button"
                      onClick={() => duplicate(ev)}
                      className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-white/5 hover:text-white"
                      aria-label={`Duplicate ${ev.brandName}`}
                      title="Duplicate"
                    >
                      <Icon name="copy" size={16} />
                    </button>
                    {(data.mode === 'local' || !isBuiltIn(ev.id)) && (
                      <button
                        type="button"
                        onClick={() => remove(ev)}
                        className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"
                        aria-label={isBuiltIn(ev.id) ? `Reset ${ev.brandName}` : `Delete ${ev.brandName}`}
                        title={isBuiltIn(ev.id) ? 'Reset to default' : 'Delete'}
                      >
                        <Icon name={isBuiltIn(ev.id) ? 'restart' : 'trash'} size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {qrFor && <QrDialog event={qrFor} onClose={() => setQrFor(null)} />}
    </div>
  );
}
