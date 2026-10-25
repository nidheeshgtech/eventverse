import { LIMITS } from '@/config/game';
import type { DemoRequest, EventConfig } from '@/types/event';
import { isHexColor } from './color';

export type FieldErrors<T> = Partial<Record<keyof T | string, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SLUG = /^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$/;

/** Trim and strip control characters. React escapes output; this keeps stored data tidy. */
export function clean(value: string, max = 500): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function validateDemoRequest(input: DemoRequest): FieldErrors<DemoRequest> {
  const e: FieldErrors<DemoRequest> = {};
  if (clean(input.name).length < 2) e.name = 'Please enter your name.';
  if (!EMAIL.test(clean(input.email, 254))) e.email = 'Please enter a valid email address.';
  if (clean(input.company).length < 2) e.company = 'Please enter your company.';
  if (input.phone && !/^[+()\d\s-]{7,20}$/.test(input.phone.trim())) e.phone = 'Use digits, spaces and + only.';
  if (!input.eventType) e.eventType = 'Choose an event type.';
  if (clean(input.message, 2000).length > 1000) e.message = 'Keep the message under 1000 characters.';
  return e;
}

function inRange(n: number, r: { min: number; max: number }) {
  return Number.isFinite(n) && n >= r.min && n <= r.max;
}

export function validateEvent(ev: EventConfig, takenSlugs: string[]): FieldErrors<EventConfig> {
  const e: FieldErrors<EventConfig> = {};
  if (clean(ev.brandName, 80).length < 2) e.brandName = 'Brand name is required.';
  if (clean(ev.eventName, 100).length < 2) e.eventName = 'Event name is required.';
  if (!SLUG.test(ev.slug)) e.slug = '3–48 characters: lowercase letters, numbers and hyphens.';
  else if (takenSlugs.includes(ev.slug)) e.slug = 'This URL is already used by another event.';
  if (clean(ev.welcomeMessage, 300).length > 280) e.welcomeMessage = 'Keep it under 280 characters.';
  if (!isHexColor(ev.theme.primary)) e.primary = 'Use a hex colour like #f9d36b.';
  if (!isHexColor(ev.theme.accent)) e.accent = 'Use a hex colour like #4cc3ff.';
  if (!ev.startDate || !ev.endDate) e.dates = 'Start and end dates are required.';
  else if (ev.endDate < ev.startDate) e.dates = 'End date must be on or after the start date.';
  if (!inRange(ev.game.durationSec, LIMITS.durationSec)) e.durationSec = `Between ${LIMITS.durationSec.min} and ${LIMITS.durationSec.max} seconds.`;
  for (const [k, v] of Object.entries(ev.game.scores)) {
    if (!inRange(v, LIMITS.score)) e[`score_${k}`] = 'Between -100 and 200.';
  }
  if (ev.reward.enabled) {
    if (!inRange(ev.reward.threshold, LIMITS.threshold)) e.threshold = 'Between 0 and 2000.';
    if (!inRange(ev.reward.validDays, LIMITS.validDays)) e.validDays = 'Between 1 and 365 days.';
    if (clean(ev.reward.title, 60).length < 2) e.rewardTitle = 'Reward title is required.';
    if (clean(ev.reward.discountLabel, 24).length < 1) e.discountLabel = 'Add a short label, e.g. 15% OFF.';
    if (!/^[A-Za-z0-9]{1,5}$/.test(ev.reward.codePrefix)) e.codePrefix = '1–5 letters or numbers.';
  }
  return e;
}

/** Normalises free-text fields before saving. */
export function sanitizeEvent(ev: EventConfig): EventConfig {
  return {
    ...ev,
    brandName: clean(ev.brandName, 80),
    eventName: clean(ev.eventName, 100),
    tagline: clean(ev.tagline, 120),
    welcomeMessage: clean(ev.welcomeMessage, 280),
    venue: clean(ev.venue, 120),
    reward: {
      ...ev.reward,
      title: clean(ev.reward.title, 60),
      description: clean(ev.reward.description, 200),
      discountLabel: clean(ev.reward.discountLabel, 24).toUpperCase(),
      codePrefix: ev.reward.codePrefix.toUpperCase(),
      terms: clean(ev.reward.terms, 300),
    },
  };
}

const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const LOGO_MAX_BYTES = 1024 * 1024;

/**
 * Validates a logo file and returns a downscaled PNG data URL (max 256px).
 * SVG is rejected on purpose: it can carry scripts and external references.
 */
export async function processLogo(file: File): Promise<string> {
  if (!LOGO_TYPES.includes(file.type)) throw new Error('Use a PNG, JPG or WebP image.');
  if (file.size > LOGO_MAX_BYTES) throw new Error('Logo must be 1 MB or smaller.');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const max = 256;
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not process the image.');
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/png');
  } catch (err) {
    throw err instanceof Error && err.message.startsWith('Use') ? err : new Error('That image could not be read.');
  } finally {
    URL.revokeObjectURL(url);
  }
}
