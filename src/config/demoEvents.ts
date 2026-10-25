import { localISODate as daysFromNow } from '@/services/dates';
import type { EventConfig } from '@/types/event';
import { DEFAULT_GAME, DEFAULT_SCORES } from './game';

const created = '2026-09-01T09:00:00.000Z';

/**
 * Built-in demo events. All brands, venues and rewards are fictional.
 * Dates are relative to today so the demos always read as live.
 * They are tagged environment: 'demo' so they never mix with production data.
 */
export const DEMO_EVENTS: EventConfig[] = [
  {
    id: 'demo-winter-festival',
    slug: 'winter-festival',
    environment: 'demo',
    brandName: 'Aurora Winter Nights',
    eventName: 'Aurora Winter Nights 2026',
    tagline: 'A winter festival under desert stars',
    welcomeMessage: 'Catch as many gifts as you can in 30 seconds. Score 400+ to unlock a festival market treat.',
    venue: 'Festival Promenade, Dubai (fictional)',
    logoUrl: null,
    theme: { primary: '#f9d36b', accent: '#4cc3ff' },
    startDate: daysFromNow(-6),
    endDate: daysFromNow(24),
    game: { ...DEFAULT_GAME, scores: { ...DEFAULT_SCORES } },
    reward: {
      enabled: true,
      threshold: 400,
      title: 'Festival Market Treat',
      description: 'Sample discount at participating festival market stalls.',
      discountLabel: '15% OFF',
      codePrefix: 'AWN',
      validDays: 14,
      terms: 'SAMPLE / DEMO ONLY. Not a real offer. Not redeemable for cash.',
    },
    createdAt: created,
    updatedAt: created,
  },
  {
    id: 'demo-retail-brand',
    slug: 'retail-brand',
    environment: 'demo',
    brandName: 'Maison Lumière',
    eventName: 'Maison Lumière Winter Edit',
    tagline: 'Holiday pop-up activation',
    welcomeMessage: 'Play our winter gift catch. Score 420+ to reveal an in-store sample offer.',
    venue: 'Pop-up atrium, Dubai (fictional)',
    logoUrl: null,
    theme: { primary: '#f2b8c6', accent: '#f9d36b' },
    startDate: daysFromNow(-3),
    endDate: daysFromNow(18),
    game: { durationSec: 30, difficulty: 'normal', scores: { ...DEFAULT_SCORES } },
    reward: {
      enabled: true,
      threshold: 420,
      title: 'Winter Edit Privilege',
      description: 'Sample in-store discount on the Winter Edit collection.',
      discountLabel: '20% OFF',
      codePrefix: 'MLW',
      validDays: 7,
      terms: 'SAMPLE / DEMO ONLY. Fictional brand and offer.',
    },
    createdAt: created,
    updatedAt: created,
  },
  {
    id: 'demo-exhibition-booth',
    slug: 'exhibition-booth',
    environment: 'demo',
    brandName: 'NovaGrid Systems',
    eventName: 'NovaGrid at the Tech Expo',
    tagline: 'Visit stand B-42',
    welcomeMessage: 'Catch the gifts before time runs out. Score 300+ to claim a sample booth reward.',
    venue: 'Hall 4, Stand B-42 (fictional)',
    logoUrl: null,
    theme: { primary: '#4cc3ff', accent: '#9b7bff' },
    startDate: daysFromNow(-1),
    endDate: daysFromNow(4),
    game: { durationSec: 30, difficulty: 'easy', scores: { ...DEFAULT_SCORES } },
    reward: {
      enabled: true,
      threshold: 300,
      title: 'Booth Reward',
      description: 'Sample voucher for a complimentary product consultation.',
      discountLabel: 'FREE CONSULT',
      codePrefix: 'NVG',
      validDays: 30,
      terms: 'SAMPLE / DEMO ONLY. Fictional exhibitor.',
    },
    createdAt: created,
    updatedAt: created,
  },
];

export const DEMO_SLUGS = new Set(DEMO_EVENTS.map((e) => e.slug));
