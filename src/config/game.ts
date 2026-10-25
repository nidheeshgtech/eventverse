import type { Difficulty, GameSettings, ItemKind, RewardSettings } from '@/types/event';

export const DEFAULT_SCORES: Record<ItemKind, number> = {
  gold: 30,
  blue: 20,
  purple: 10,
  snowball: -10,
};

export const ITEM_LABELS: Record<ItemKind, string> = {
  gold: 'Gold Gift',
  blue: 'Blue Gift',
  purple: 'Purple Gift',
  snowball: 'Snowball',
};

/** Relative spawn weights for gifts. Gold is rarer and falls a little faster. */
export const GIFT_WEIGHTS: Record<Exclude<ItemKind, 'snowball'>, number> = {
  purple: 45,
  blue: 32,
  gold: 16,
};

export interface DifficultyCurve {
  /** Milliseconds between spawns at the start and end of the round. */
  spawnStart: number;
  spawnEnd: number;
  /** Fall speed as a fraction of screen height per second. */
  speedStart: number;
  speedEnd: number;
  /** Probability that a spawn is a snowball. */
  snowStart: number;
  snowEnd: number;
}

export const DIFFICULTY: Record<Difficulty, DifficultyCurve> = {
  easy: { spawnStart: 1000, spawnEnd: 600, speedStart: 0.26, speedEnd: 0.46, snowStart: 0.1, snowEnd: 0.18 },
  normal: { spawnStart: 850, spawnEnd: 430, speedStart: 0.3, speedEnd: 0.6, snowStart: 0.12, snowEnd: 0.24 },
  hard: { spawnStart: 700, spawnEnd: 330, speedStart: 0.36, speedEnd: 0.76, snowStart: 0.15, snowEnd: 0.3 },
};

export const DEFAULT_GAME: GameSettings = {
  durationSec: 30,
  difficulty: 'normal',
  scores: { ...DEFAULT_SCORES },
};

export const DEFAULT_REWARD: RewardSettings = {
  enabled: true,
  threshold: 400,
  title: 'Festival Treat',
  description: 'A sample discount voucher for participating partners.',
  discountLabel: '15% OFF',
  codePrefix: 'EVT',
  validDays: 14,
  terms: 'Sample voucher for demonstration only. Not redeemable for cash.',
};

export const LIMITS = {
  durationSec: { min: 15, max: 90 },
  threshold: { min: 0, max: 2000 },
  validDays: { min: 1, max: 365 },
  score: { min: -100, max: 200 },
};
