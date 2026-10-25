import { localISODate as daysFromNow } from '@/services/dates';
import type { EventConfig } from '@/types/event';
import { DEMO_LOGOS } from './demoLogos';
import { DEFAULT_GAME, DEFAULT_SCORES } from './game';

const created = '2026-09-01T09:00:00.000Z';

/**
 * Built-in demo events. All brands, venues and rewards are fictional.
 * Dates are relative to today so the demos always read as live.
 * They are tagged environment: 'demo' so they never mix with production data.
 * Slugs are part of public links and printed QR codes — never rename them.
 */
export const DEMO_EVENTS: EventConfig[] = [
  {
    id: 'demo-luxury-perfume',
    slug: 'luxury-perfume',
    environment: 'demo',
    brandName: 'Maison Ambre',
    eventName: 'Maison Ambre · Oud Collection Launch',
    tagline: 'Luxury fragrance exhibition',
    welcomeMessage: 'Catch the falling fragrances in 30 seconds. Score 400+ to unlock a private atelier privilege.',
    venue: 'Fragrance Pavilion, Dubai (fictional)',
    logoUrl: DEMO_LOGOS.maisonAmbre,
    theme: { primary: '#d4af37', accent: '#f3e3c3', style: 'luxury' },
    startDate: daysFromNow(-4),
    endDate: daysFromNow(20),
    game: { durationSec: 30, difficulty: 'normal', scores: { ...DEFAULT_SCORES } },
    reward: {
      enabled: true,
      threshold: 400,
      title: 'Atelier Privilege',
      description: 'Sample offer on the Oud Collection discovery set.',
      discountLabel: '20% OFF',
      codePrefix: 'MAB',
      validDays: 14,
      terms: 'SAMPLE / DEMO ONLY. Fictional brand and offer. Not redeemable for cash.',
    },
    createdAt: created,
    updatedAt: created,
  },
  {
    id: 'demo-winter-festival',
    slug: 'winter-festival',
    environment: 'demo',
    brandName: 'Aurora Winter Festival',
    eventName: 'Aurora Winter Festival Dubai 2026',
    tagline: 'A winter festival under desert stars',
    welcomeMessage: 'Catch as many gifts as you can in 30 seconds. Score 400+ to unlock a festival market treat.',
    venue: 'Festival Promenade, Dubai (fictional)',
    logoUrl: DEMO_LOGOS.auroraFestival,
    theme: { primary: '#f9d36b', accent: '#4cc3ff', style: 'festive' },
    startDate: daysFromNow(-6),
    endDate: daysFromNow(24),
    game: { ...DEFAULT_GAME, scores: { ...DEFAULT_SCORES } },
    reward: {
      enabled: true,
      threshold: 400,
      title: 'Festival Market Treat',
      description: 'Sample discount at participating festival market stalls.',
      discountLabel: '15% OFF',
      codePrefix: 'AWF',
      validDays: 14,
      terms: 'SAMPLE / DEMO ONLY. Not a real offer. Not redeemable for cash.',
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
    tagline: 'Corporate exhibition booth · Stand B-42',
    welcomeMessage: 'Catch the cubes, avoid the errors. Score 300+ to book a complimentary consultation.',
    venue: 'Hall 4, Stand B-42 (fictional)',
    logoUrl: DEMO_LOGOS.novaGrid,
    theme: { primary: '#4c9aff', accent: '#22d3ee', style: 'corporate' },
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
  {
    // Earlier demo, kept so existing links keep working. Not featured on the landing page.
    id: 'demo-retail-brand',
    slug: 'retail-brand',
    environment: 'demo',
    brandName: 'Maison Lumière',
    eventName: 'Maison Lumière Winter Edit',
    tagline: 'Holiday pop-up activation',
    welcomeMessage: 'Play our winter gift catch. Score 420+ to reveal an in-store sample offer.',
    venue: 'Pop-up atrium, Dubai (fictional)',
    logoUrl: null,
    theme: { primary: '#f2b8c6', accent: '#f9d36b', style: 'festive' },
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
];

export const DEMO_SLUGS = new Set(DEMO_EVENTS.map((e) => e.slug));

/** Sales showcase shown in "Choose Demo Experience" on the landing page. */
export const DEMO_SHOWCASE: { slug: string; industry: string; pitch: string }[] = [
  {
    slug: 'luxury-perfume',
    industry: 'Luxury Perfume Exhibition',
    pitch: 'Black-and-gold elegance. Visitors catch perfume bottles to unlock an atelier privilege.',
  },
  {
    slug: 'winter-festival',
    industry: 'Dubai Winter Festival',
    pitch: 'Festive blue, purple and gold. Falling gifts and snow for family crowds.',
  },
  {
    slug: 'exhibition-booth',
    industry: 'Corporate Exhibition Booth',
    pitch: 'Clean and professional. Turns stand traffic into booked consultations.',
  },
];
