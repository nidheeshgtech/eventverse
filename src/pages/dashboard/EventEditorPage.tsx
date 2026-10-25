import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ColorField, LogoUploader } from '@/components/dashboard/BrandingFields';
import { EventBackdrop } from '@/components/game/EventBackdrop';
import { QrPanel } from '@/components/dashboard/QrPanel';
import { WelcomeScreen } from '@/components/game/WelcomeScreen';
import { Button } from '@/components/ui/Button';
import { SelectField, TextArea, TextField, Toggle } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { GiftArt, PageLoader } from '@/components/ui/Misc';
import { useToast } from '@/components/ui/Toast';
import { DEFAULT_GAME, DEFAULT_REWARD, LIMITS } from '@/config/game';
import { presetOf, STYLE_PRESETS, styleOf } from '@/config/styles';
import { eventPath } from '@/config/site';
import { useAsync } from '@/hooks/useAsync';
import { data } from '@/services/data';
import { localISODate } from '@/services/dates';
import { uuid } from '@/services/ids';
import { sanitizeEvent, slugify, validateEvent, type FieldErrors } from '@/services/validation';
import type { Difficulty, EventConfig, GameSettings, ItemKind, RewardSettings, VisualStyle } from '@/types/event';

function blankEvent(): EventConfig {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    slug: '',
    environment: data.mode === 'local' ? 'demo' : 'production',
    brandName: '',
    eventName: '',
    tagline: '',
    welcomeMessage: 'Catch as many gifts as you can before time runs out!',
    venue: '',
    logoUrl: null,
    theme: { primary: '#f9d36b', accent: '#4cc3ff', style: 'festive' },
    startDate: localISODate(),
    endDate: localISODate(14),
    game: { ...DEFAULT_GAME, scores: { ...DEFAULT_GAME.scores } },
    reward: { ...DEFAULT_REWARD },
    createdAt: now,
    updatedAt: now,
  };
}

const num = (v: string) => (v === '' ? Number.NaN : Number(v));
const numValue = (n: number) => (Number.isFinite(n) ? n : '');

export default function EventEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const { data: events, loading } = useAsync(() => data.listEvents(), []);
  const existing = useMemo(() => events?.find((e) => e.id === id), [events, id]);

  if (loading) return <PageLoader />;
  if (!isNew && !existing) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold">Event not found</h1>
        <Link to="/dashboard/events" className="mt-4 inline-block text-sm text-electric-300 hover:underline">
          Back to events
        </Link>
      </div>
    );
  }
  return <Editor key={id ?? 'new'} initial={existing ?? blankEvent()} isNew={isNew} otherSlugs={(events ?? []).filter((e) => e.id !== id).map((e) => e.slug)} />;
}

function Section({ id, title, icon, children }: { id: string; title: string; icon: Parameters<typeof Icon>[0]['name']; children: ReactNode }) {
  return (
    <section id={id} className="glass scroll-mt-28 rounded-2xl p-5 sm:p-6">
      <h2 className="mb-5 flex items-center gap-2.5 text-base font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-gold-300">
          <Icon name={icon} size={16} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Editor({ initial, isNew, otherSlugs }: { initial: EventConfig; isNew: boolean; otherSlugs: string[] }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [draft, setDraft] = useState<EventConfig>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<FieldErrors<EventConfig>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    document.title = `${isNew ? 'New event' : draft.brandName || 'Edit event'} · EventVerse`;
  }, [isNew, draft.brandName]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const patch = (p: Partial<EventConfig>) => {
    setDirty(true);
    setDraft((d) => {
      const next = { ...d, ...p };
      if (!slugTouched && ('eventName' in p || 'brandName' in p)) next.slug = slugify(next.eventName || next.brandName);
      return next;
    });
  };
  const patchGame = (p: Partial<GameSettings>) => patch({ game: { ...draft.game, ...p } });
  const patchReward = (p: Partial<RewardSettings>) => patch({ reward: { ...draft.reward, ...p } });
  const patchScore = (k: ItemKind, v: number) => patchGame({ scores: { ...draft.game.scores, [k]: v } });

  const save = async () => {
    const clean = sanitizeEvent(draft);
    const found = validateEvent(clean, otherSlugs);
    setErrors(found);
    if (Object.keys(found).length) {
      toast('Please fix the highlighted fields', 'error');
      return;
    }
    setSaving(true);
    try {
      const saved = await data.saveEvent(clean);
      setDraft(saved);
      setDirty(false);
      toast(isNew ? 'Event created' : 'Changes saved');
      if (isNew) navigate(`/dashboard/events/${saved.id}`, { replace: true });
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not save event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const visualStyle = styleOf(draft.theme);
  const previewEvent: EventConfig = {
    ...draft,
    brandName: draft.brandName || 'Your Brand',
    welcomeMessage: draft.welcomeMessage || 'Your welcome message appears here.',
  };

  return (
    <div className="pb-24">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/dashboard/events" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <Icon name="arrowLeft" size={14} /> All events
          </Link>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{isNew ? 'Create event' : draft.brandName || 'Edit event'}</h1>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Link
              to={eventPath(draft.slug)}
              target="_blank"
              rel="noopener"
              className="glass inline-flex h-11 items-center gap-2 rounded-full px-5 font-display text-[15px] font-semibold text-white hover:bg-white/10"
            >
              <Icon name="play" size={14} /> Test play
            </Link>
          )}
          <Button onClick={save} disabled={saving} icon={<Icon name="check" size={16} />}>
            {saving ? 'Saving…' : isNew ? 'Create event' : 'Save changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Section id="basics" title="Event details" icon="calendar">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Brand name" value={draft.brandName} onChange={(e) => patch({ brandName: e.target.value })} error={errors.brandName} maxLength={80} placeholder="e.g. Aurora Winter Nights" />
              <TextField label="Event name" value={draft.eventName} onChange={(e) => patch({ eventName: e.target.value })} error={errors.eventName} maxLength={100} placeholder="e.g. Aurora Winter Nights 2026" />
              <TextField
                label="Event URL"
                value={draft.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  patch({ slug: slugify(e.target.value) });
                }}
                error={errors.slug}
                hint={`Visitors open ${eventPath(draft.slug || 'your-event')}`}
                maxLength={48}
              />
              <TextField label="Tagline" value={draft.tagline} onChange={(e) => patch({ tagline: e.target.value })} maxLength={120} placeholder="Short line under the title" />
              <TextField label="Venue" value={draft.venue} onChange={(e) => patch({ venue: e.target.value })} maxLength={120} placeholder="Hall, stand or location" />
              <SelectField
                label="Data environment"
                value={draft.environment}
                onChange={(e) => patch({ environment: e.target.value as EventConfig['environment'] })}
                disabled={data.mode === 'local'}
                hint={data.mode === 'local' ? 'Local mode stores everything as demo data.' : 'Demo events are excluded from production analytics.'}
              >
                <option value="demo">Demo</option>
                <option value="production">Production</option>
              </SelectField>
              <TextField label="Start date" type="date" value={draft.startDate} onChange={(e) => patch({ startDate: e.target.value })} error={errors.dates} />
              <TextField label="End date" type="date" value={draft.endDate} min={draft.startDate} onChange={(e) => patch({ endDate: e.target.value })} />
              <TextArea
                label="Welcome message"
                value={draft.welcomeMessage}
                onChange={(e) => patch({ welcomeMessage: e.target.value })}
                error={errors.welcomeMessage}
                hint={`${draft.welcomeMessage.length}/280`}
                maxLength={280}
                wrapperClassName="sm:col-span-2"
              />
            </div>
          </Section>

          <Section id="branding" title="Branding" icon="palette">
            <div className="grid gap-5">
              <LogoUploader value={draft.logoUrl} onChange={(logoUrl) => patch({ logoUrl })} />
              <ColorField label="Primary colour" value={draft.theme.primary} onChange={(primary) => patch({ theme: { ...draft.theme, primary } })} error={errors.primary} />
              <ColorField label="Accent colour" value={draft.theme.accent} onChange={(accent) => patch({ theme: { ...draft.theme, accent } })} error={errors.accent} />
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-slate-200">Visual style</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(Object.keys(STYLE_PRESETS) as VisualStyle[]).map((s) => (
                    <label
                      key={s}
                      className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-3 transition ${
                        visualStyle === s ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                      }`}
                    >
                      <input type="radio" name="visual-style" value={s} checked={visualStyle === s} onChange={() => patch({ theme: { ...draft.theme, style: s } })} className="sr-only" />
                      <span className="flex items-center gap-1">
                        {(['gold', 'blue', 'purple'] as ItemKind[]).map((k) => (
                          <GiftArt key={k} kind={k} style={s} size={26} />
                        ))}
                      </span>
                      <span className="text-sm font-semibold text-white">{STYLE_PRESETS[s].label}</span>
                      <span className="text-xs leading-snug text-slate-400">{STYLE_PRESETS[s].description}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </Section>

          <Section id="game" title="Game settings" icon="settings">
            <div className="grid gap-5">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <label htmlFor="duration" className="font-medium text-slate-200">
                    Round length
                  </label>
                  <span className="font-display font-semibold text-white">{draft.game.durationSec}s</span>
                </div>
                <input
                  id="duration"
                  type="range"
                  min={LIMITS.durationSec.min}
                  max={LIMITS.durationSec.max}
                  step={5}
                  value={draft.game.durationSec}
                  onChange={(e) => patchGame({ durationSec: Number(e.target.value) })}
                  className="w-full accent-[rgb(var(--brand-primary))]"
                />
                {errors.durationSec && <p className="mt-1 text-xs text-rose-300">{errors.durationSec}</p>}
              </div>

              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-slate-200">Difficulty</legend>
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/5 p-1">
                  {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => (
                    <label
                      key={d}
                      className={`cursor-pointer rounded-xl py-2.5 text-center text-sm font-medium capitalize transition ${
                        draft.game.difficulty === d ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <input type="radio" name="difficulty" value={d} checked={draft.game.difficulty === d} onChange={() => patchGame({ difficulty: d })} className="sr-only" />
                      {d}
                    </label>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-slate-400">Controls spawn rate, fall speed and snowball frequency. Difficulty always ramps up during a round.</p>
              </fieldset>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-200">Points per item</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(Object.keys(draft.game.scores) as ItemKind[]).map((k) => (
                    <label key={k} className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-3">
                      <GiftArt kind={k} style={visualStyle} size={40} />
                      <span className="text-xs text-slate-400">{presetOf(draft.theme).itemLabels[k]}</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={numValue(draft.game.scores[k])}
                        min={LIMITS.score.min}
                        max={LIMITS.score.max}
                        onChange={(e) => patchScore(k, num(e.target.value))}
                        aria-invalid={Boolean(errors[`score_${k}`])}
                        className="w-20 rounded-lg border border-white/10 bg-midnight-950/60 px-2 py-1.5 text-center font-display font-semibold text-white focus:border-electric-400/60 focus:outline-none aria-[invalid=true]:border-rose-400"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section id="rewards" title="Reward settings" icon="gift">
            <div className="grid gap-4">
              <Toggle checked={draft.reward.enabled} onChange={(enabled) => patchReward({ enabled })} label="Award a voucher" description="Skill-based: players earn it by reaching the target score. No random draws." />
              {draft.reward.enabled && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Target score" type="number" inputMode="numeric" value={numValue(draft.reward.threshold)} onChange={(e) => patchReward({ threshold: num(e.target.value) })} error={errors.threshold} hint="Normal, 30s: standing still scores ~250; flawless play ~550. 400 rewards real skill." />
                  <TextField label="Voucher valid for (days)" type="number" inputMode="numeric" value={numValue(draft.reward.validDays)} onChange={(e) => patchReward({ validDays: num(e.target.value) })} error={errors.validDays} />
                  <TextField label="Reward title" value={draft.reward.title} onChange={(e) => patchReward({ title: e.target.value })} error={errors.rewardTitle} maxLength={60} />
                  <TextField label="Voucher label" value={draft.reward.discountLabel} onChange={(e) => patchReward({ discountLabel: e.target.value })} error={errors.discountLabel} maxLength={24} placeholder="15% OFF" />
                  <TextField label="Reference prefix" value={draft.reward.codePrefix} onChange={(e) => patchReward({ codePrefix: e.target.value.toUpperCase() })} error={errors.codePrefix} maxLength={5} hint="e.g. AWN → AWN-7K3Q-9XMD-4" />
                  <TextField label="Description" value={draft.reward.description} onChange={(e) => patchReward({ description: e.target.value })} maxLength={200} />
                  <TextArea label="Terms" value={draft.reward.terms} onChange={(e) => patchReward({ terms: e.target.value })} maxLength={300} wrapperClassName="sm:col-span-2" />
                </div>
              )}
              <p className="rounded-xl bg-gold-400/10 px-3 py-2 text-xs text-gold-200">Demo vouchers are always marked “SAMPLE / DEMO ONLY”. One voucher is issued per visit.</p>
            </div>
          </Section>

          <Section id="share" title="Share & QR code" icon="qr">
            {isNew ? (
              <p className="text-sm text-slate-400">Create the event to generate its unique URL and QR code.</p>
            ) : (
              <QrPanel event={draft} />
            )}
          </Section>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Live preview</p>
          <div className="mx-auto w-[300px] rounded-[2.5rem] border border-white/15 bg-midnight-900 p-2 shadow-2xl">
            <div className="pointer-events-none" aria-hidden="true" ref={(el) => el?.setAttribute('inert', '')}>
              <EventBackdrop event={draft} className="h-[600px] rounded-[2rem]">
                <div className="relative h-full origin-top scale-[0.92]">
                  <WelcomeScreen event={previewEvent} onStart={() => undefined} prefetchGame={false} />
                </div>
              </EventBackdrop>
            </div>
          </div>
        </aside>
      </div>

      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:left-[248px] border-t border-white/10 bg-midnight-950/90 backdrop-blur-xl safe-bottom">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <p className="text-sm text-slate-300">Unsaved changes</p>
            <Button onClick={save} disabled={saving} size="sm">
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
