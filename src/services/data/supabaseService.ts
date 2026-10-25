import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsSummary } from '@/types/analytics';
import type { DataEnvironment, DemoRequest, EventConfig, GameSettings, RewardSettings, VisualStyle, Voucher } from '@/types/event';
import type { GameResult } from '@/types/game';
import { emptySummary } from '../analytics';
import { readSession, writeSession } from '../storage';
import type { AnalyticsResult, DataService, VoucherLookup } from './types';

/* Row shapes as defined in supabase/migrations/0001_eventverse.sql */
interface EventRow {
  id: string;
  slug: string;
  environment: DataEnvironment;
  brand_name: string;
  event_name: string;
  tagline: string;
  welcome_message: string;
  venue: string;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  /** Added in migration 0002; absent on databases that haven't applied it. */
  visual_style?: VisualStyle;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  event_configs: { game: GameSettings; reward: RewardSettings } | { game: GameSettings; reward: RewardSettings }[] | null;
}

interface VoucherRow {
  code: string;
  event_id: string;
  event_slug: string;
  session_id: string;
  score: number;
  title: string;
  discount_label: string;
  issued_at: string;
  expires_at: string;
  redeemed_at: string | null;
  environment: DataEnvironment;
}

function toEvent(r: EventRow): EventConfig {
  const cfg = Array.isArray(r.event_configs) ? r.event_configs[0] : r.event_configs;
  if (!cfg) throw new Error(`Event ${r.slug} has no configuration.`);
  return {
    id: r.id,
    slug: r.slug,
    environment: r.environment,
    brandName: r.brand_name,
    eventName: r.event_name,
    tagline: r.tagline,
    welcomeMessage: r.welcome_message,
    venue: r.venue,
    logoUrl: r.logo_url,
    theme: { primary: r.primary_color, accent: r.accent_color, style: r.visual_style ?? 'festive' },
    startDate: r.start_date,
    endDate: r.end_date,
    game: cfg.game,
    reward: cfg.reward,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toVoucher(r: VoucherRow): Voucher {
  return {
    code: r.code,
    eventId: r.event_id,
    eventSlug: r.event_slug,
    sessionId: r.session_id,
    score: r.score,
    title: r.title,
    discountLabel: r.discount_label,
    issuedAt: r.issued_at,
    expiresAt: r.expires_at,
    redeemedAt: r.redeemed_at,
    environment: r.environment,
  };
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

const EVENT_SELECT = '*, event_configs(game, reward)';

/**
 * Supabase backend. Scores and vouchers go through SECURITY DEFINER RPCs,
 * so visitors (anon role) never write to tables directly and cannot mint vouchers.
 */
export class SupabaseDataService implements DataService {
  readonly mode = 'supabase' as const;

  constructor(private db: SupabaseClient) {}

  async listEvents(): Promise<EventConfig[]> {
    const { data, error } = await this.db.from('events').select(EVENT_SELECT).order('created_at');
    fail(error);
    return (data as EventRow[]).map(toEvent);
  }

  async getEventBySlug(slug: string): Promise<EventConfig | null> {
    const { data, error } = await this.db.from('events').select(EVENT_SELECT).eq('slug', slug).maybeSingle();
    fail(error);
    return data ? toEvent(data as EventRow) : null;
  }

  async saveEvent(event: EventConfig): Promise<EventConfig> {
    const { data, error } = await this.db.rpc('admin_upsert_event', {
      p_event: {
        id: event.id,
        slug: event.slug,
        environment: event.environment,
        brand_name: event.brandName,
        event_name: event.eventName,
        tagline: event.tagline,
        welcome_message: event.welcomeMessage,
        venue: event.venue,
        logo_url: event.logoUrl,
        primary_color: event.theme.primary,
        accent_color: event.theme.accent,
        visual_style: event.theme.style ?? 'festive',
        start_date: event.startDate,
        end_date: event.endDate,
      },
      p_game: event.game,
      p_reward: event.reward,
    });
    fail(error);
    const saved = await this.getEventBySlug((data as { slug: string }).slug);
    if (!saved) throw new Error('Event saved but could not be reloaded.');
    return saved;
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await this.db.from('events').delete().eq('id', id);
    fail(error);
  }

  async registerVisit(event: EventConfig): Promise<string> {
    const key = `visit:${event.id}`;
    const existing = readSession(key);
    if (existing) return existing;
    const { data, error } = await this.db.rpc('register_visit', { p_event_id: event.id });
    fail(error);
    writeSession(key, data as string);
    return data as string;
  }

  async startPlay(_event: EventConfig, sessionId: string): Promise<string> {
    const { data, error } = await this.db.rpc('start_play', { p_session_id: sessionId });
    fail(error);
    return data as string;
  }

  async completePlay(_event: EventConfig, _sessionId: string, playId: string, result: GameResult): Promise<Voucher | null> {
    const { data, error } = await this.db.rpc('complete_play', {
      p_score_id: playId,
      p_score: Math.round(result.score),
      p_caught: result.caught,
    });
    fail(error);
    const row = (Array.isArray(data) ? data[0] : data) as VoucherRow | null;
    return row?.code ? toVoucher(row) : null;
  }

  async getVoucher(code: string): Promise<VoucherLookup | null> {
    const { data, error } = await this.db.rpc('get_voucher', { p_code: code });
    fail(error);
    const row = (Array.isArray(data) ? data[0] : data) as VoucherRow | null;
    if (!row?.code) return null;
    const voucher = toVoucher(row);
    return { voucher, event: await this.getEventBySlug(voucher.eventSlug) };
  }

  async redeemVoucher(code: string): Promise<Voucher> {
    const { data, error } = await this.db.rpc('redeem_voucher', { p_code: code });
    fail(error);
    const row = (Array.isArray(data) ? data[0] : data) as VoucherRow;
    return toVoucher(row);
  }

  async listVouchers(): Promise<Voucher[]> {
    const { data, error } = await this.db
      .from('vouchers')
      .select('*, events(slug), voucher_redemptions(redeemed_at)')
      .order('issued_at', { ascending: false })
      .limit(500);
    fail(error);
    type Row = Omit<VoucherRow, 'event_slug' | 'redeemed_at'> & {
      events: { slug: string } | null;
      voucher_redemptions: { redeemed_at: string }[] | { redeemed_at: string } | null;
    };
    return (data as Row[]).map((r) => {
      const red = Array.isArray(r.voucher_redemptions) ? r.voucher_redemptions[0] : r.voucher_redemptions;
      return toVoucher({ ...r, event_slug: r.events?.slug ?? '', redeemed_at: red?.redeemed_at ?? null });
    });
  }

  async getAnalytics(eventId: string | null): Promise<AnalyticsResult> {
    const { data, error } = await this.db.rpc('event_analytics', { p_event_id: eventId, p_days: 14 });
    fail(error);
    return { source: 'live', summary: { ...emptySummary(), ...(data as Partial<AnalyticsSummary>) } };
  }

  async getDeviceActivity(): Promise<AnalyticsSummary> {
    return emptySummary();
  }

  async submitDemoRequest(request: DemoRequest): Promise<void> {
    const { error } = await this.db.from('demo_requests').insert({
      name: request.name,
      email: request.email,
      company: request.company,
      phone: request.phone || null,
      event_type: request.eventType,
      message: request.message || null,
    });
    fail(error);
  }
}
