import type { AnalyticsSummary } from '@/types/analytics';
import type { DemoRequest, EventConfig, Voucher } from '@/types/event';
import type { GameResult } from '@/types/game';

export interface VoucherLookup {
  voucher: Voucher;
  event: EventConfig | null;
}

export interface AnalyticsResult {
  /** "sample" = generated demo figures; "live" = real recorded activity. */
  source: 'sample' | 'live';
  summary: AnalyticsSummary;
}

/**
 * One interface, two backends: browser-only demo mode and Supabase.
 * Pages never talk to storage or Supabase directly.
 */
export interface DataService {
  readonly mode: 'local' | 'supabase';
  listEvents(): Promise<EventConfig[]>;
  getEventBySlug(slug: string): Promise<EventConfig | null>;
  saveEvent(event: EventConfig): Promise<EventConfig>;
  deleteEvent(id: string): Promise<void>;

  /** One visit per visitor per tab. Returns the game-session id. */
  registerVisit(event: EventConfig): Promise<string>;
  /** One play per round. Returns the play (score) id. */
  startPlay(event: EventConfig, sessionId: string): Promise<string>;
  /** Records the final score; returns a voucher when the threshold is met. */
  completePlay(event: EventConfig, sessionId: string, playId: string, result: GameResult): Promise<Voucher | null>;

  getVoucher(code: string): Promise<VoucherLookup | null>;
  redeemVoucher(code: string): Promise<Voucher>;
  listVouchers(): Promise<Voucher[]>;

  /** Dashboard figures. Local mode returns clearly-labelled sample data. */
  getAnalytics(eventId: string | null): Promise<AnalyticsResult>;
  /** Activity actually recorded in this browser (local mode) — never mixed with sample data. */
  getDeviceActivity(eventId: string | null): Promise<AnalyticsSummary>;

  submitDemoRequest(request: DemoRequest): Promise<void>;
}
