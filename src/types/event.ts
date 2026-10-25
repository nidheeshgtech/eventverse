export type Difficulty = 'easy' | 'normal' | 'hard';

export type ItemKind = 'gold' | 'blue' | 'purple' | 'snowball';

export type EventStatus = 'draft' | 'scheduled' | 'live' | 'ended';

/** Where a record lives. Demo records are never mixed with production analytics. */
export type DataEnvironment = 'demo' | 'production';

export interface EventTheme {
  /** Main brand colour, hex (#rrggbb). Used for buttons, glow and the basket. */
  primary: string;
  /** Secondary highlight colour, hex. */
  accent: string;
}

export interface GameSettings {
  durationSec: number;
  difficulty: Difficulty;
  scores: Record<ItemKind, number>;
}

export interface RewardSettings {
  enabled: boolean;
  /** Minimum score needed to earn the voucher. */
  threshold: number;
  title: string;
  description: string;
  /** Short label printed on the voucher, e.g. "15% OFF". */
  discountLabel: string;
  /** Prefix for generated voucher references, e.g. "AWN". */
  codePrefix: string;
  /** Days the voucher stays valid after it is issued. */
  validDays: number;
  terms: string;
}

export interface EventConfig {
  id: string;
  slug: string;
  environment: DataEnvironment;
  brandName: string;
  eventName: string;
  tagline: string;
  welcomeMessage: string;
  venue: string;
  /** Data URL or remote URL. Falls back to a monogram when empty. */
  logoUrl: string | null;
  theme: EventTheme;
  startDate: string; // ISO date
  endDate: string; // ISO date
  game: GameSettings;
  reward: RewardSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Voucher {
  code: string;
  eventId: string;
  eventSlug: string;
  sessionId: string;
  score: number;
  title: string;
  discountLabel: string;
  issuedAt: string;
  expiresAt: string;
  redeemedAt: string | null;
  environment: DataEnvironment;
}

export interface GameSession {
  id: string;
  eventId: string;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  environment: DataEnvironment;
}

export interface DemoRequest {
  name: string;
  email: string;
  company: string;
  phone: string;
  eventType: string;
  message: string;
}
