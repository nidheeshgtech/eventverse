import { DEMO_EVENTS } from '@/config/demoEvents';
import type { AnalyticsSummary } from '@/types/analytics';
import type { DemoRequest, EventConfig, Voucher } from '@/types/event';
import type { GameResult } from '@/types/game';
import { bucketIndex, emptySummary, sampleAnalytics } from '../analytics';
import { generateVoucherCode, uuid } from '../ids';
import { readJSON, readSession, writeJSON, writeSession } from '../storage';
import type { AnalyticsResult, DataService, VoucherLookup } from './types';

interface Visit {
  id: string;
  eventId: string;
  at: string;
}

interface Play {
  id: string;
  sessionId: string;
  eventId: string;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
}

const KEYS = {
  events: 'events',
  visits: 'visits',
  plays: 'plays',
  vouchers: 'vouchers',
  requests: 'demo-requests',
};

/** Max points a round could plausibly yield; protects the local demo from tampered results. */
function plausibleMax(event: EventConfig): number {
  const best = Math.max(...Object.values(event.game.scores), 0);
  return Math.ceil((event.game.durationSec * 1000) / 300) * best;
}

/**
 * Browser-only backend. Everything is stored in localStorage and tagged as demo data.
 * Edits to built-in demo events are stored as overrides keyed by id.
 */
export class LocalDataService implements DataService {
  readonly mode = 'local' as const;

  private stored(): EventConfig[] {
    return readJSON<EventConfig[]>(KEYS.events, []);
  }

  async listEvents(): Promise<EventConfig[]> {
    const stored = this.stored();
    const byId = new Map(stored.map((e) => [e.id, e]));
    const demos = DEMO_EVENTS.map((d) => {
      const o = byId.get(d.id);
      // Keep demo dates rolling so the built-in events always read as live.
      return o ? { ...o, startDate: d.startDate, endDate: d.endDate } : d;
    });
    const custom = stored.filter((e) => !DEMO_EVENTS.some((d) => d.id === e.id));
    return [...demos, ...custom];
  }

  async getEventBySlug(slug: string): Promise<EventConfig | null> {
    return (await this.listEvents()).find((e) => e.slug === slug) ?? null;
  }

  async saveEvent(event: EventConfig): Promise<EventConfig> {
    const stored = this.stored();
    const next = { ...event, updatedAt: new Date().toISOString() };
    const i = stored.findIndex((e) => e.id === event.id);
    if (i >= 0) stored[i] = next;
    else stored.push(next);
    writeJSON(KEYS.events, stored);
    return next;
  }

  async deleteEvent(id: string): Promise<void> {
    writeJSON(
      KEYS.events,
      this.stored().filter((e) => e.id !== id),
    );
  }

  async registerVisit(event: EventConfig): Promise<string> {
    const key = `visit:${event.id}`;
    const existing = readSession(key);
    if (existing) return existing;
    const visit: Visit = { id: uuid(), eventId: event.id, at: new Date().toISOString() };
    writeJSON(KEYS.visits, [...readJSON<Visit[]>(KEYS.visits, []), visit]);
    writeSession(key, visit.id);
    return visit.id;
  }

  async startPlay(event: EventConfig, sessionId: string): Promise<string> {
    const play: Play = {
      id: uuid(),
      sessionId,
      eventId: event.id,
      startedAt: new Date().toISOString(),
      completedAt: null,
      score: null,
    };
    writeJSON(KEYS.plays, [...readJSON<Play[]>(KEYS.plays, []), play]);
    return play.id;
  }

  async completePlay(event: EventConfig, sessionId: string, playId: string, result: GameResult): Promise<Voucher | null> {
    const plays = readJSON<Play[]>(KEYS.plays, []);
    const play = plays.find((p) => p.id === playId);
    if (!play || play.completedAt) return null;
    const score = Math.max(0, Math.min(Math.round(result.score), plausibleMax(event)));
    play.completedAt = new Date().toISOString();
    play.score = score;
    writeJSON(KEYS.plays, plays);

    if (!event.reward.enabled || score < event.reward.threshold) return null;
    // One voucher per visit, matching the server-side rule in complete_play().
    const vouchers = readJSON<Voucher[]>(KEYS.vouchers, []);
    if (vouchers.some((v) => v.sessionId === sessionId)) return null;
    const issued = new Date();
    const expires = new Date(issued);
    expires.setDate(issued.getDate() + event.reward.validDays);
    const voucher: Voucher = {
      code: generateVoucherCode(event.reward.codePrefix),
      eventId: event.id,
      eventSlug: event.slug,
      sessionId,
      score,
      title: event.reward.title,
      discountLabel: event.reward.discountLabel,
      issuedAt: issued.toISOString(),
      expiresAt: expires.toISOString(),
      redeemedAt: null,
      environment: 'demo',
    };
    writeJSON(KEYS.vouchers, [...vouchers, voucher]);
    return voucher;
  }

  async getVoucher(code: string): Promise<VoucherLookup | null> {
    const voucher = readJSON<Voucher[]>(KEYS.vouchers, []).find((v) => v.code === code);
    if (!voucher) return null;
    const event = (await this.listEvents()).find((e) => e.id === voucher.eventId) ?? null;
    return { voucher, event };
  }

  async redeemVoucher(code: string): Promise<Voucher> {
    const vouchers = readJSON<Voucher[]>(KEYS.vouchers, []);
    const v = vouchers.find((x) => x.code === code);
    if (!v) throw new Error('Voucher not found on this device.');
    if (v.redeemedAt) throw new Error('This voucher has already been redeemed.');
    if (new Date(v.expiresAt) < new Date()) throw new Error('This voucher has expired.');
    v.redeemedAt = new Date().toISOString();
    writeJSON(KEYS.vouchers, vouchers);
    return v;
  }

  async listVouchers(): Promise<Voucher[]> {
    return readJSON<Voucher[]>(KEYS.vouchers, []).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  }

  async getAnalytics(eventId: string | null): Promise<AnalyticsResult> {
    const ids = eventId ? [eventId] : (await this.listEvents()).map((e) => e.id);
    return { source: 'sample', summary: sampleAnalytics(ids) };
  }

  async getDeviceActivity(eventId: string | null): Promise<AnalyticsSummary> {
    const match = <T extends { eventId: string }>(x: T) => !eventId || x.eventId === eventId;
    const visits = readJSON<Visit[]>(KEYS.visits, []).filter(match);
    const plays = readJSON<Play[]>(KEYS.plays, []).filter(match);
    const vouchers = readJSON<Voucher[]>(KEYS.vouchers, []).filter(match);
    const s = emptySummary();
    const byDay = new Map(s.daily.map((d) => [d.date, d]));
    const day = (iso: string) => byDay.get(iso.slice(0, 10));

    visits.forEach((v) => {
      const d = day(v.at);
      if (d) d.visits++;
    });
    plays.forEach((p) => {
      const d = day(p.startedAt);
      if (d) d.started++;
      if (p.completedAt && p.score !== null) {
        const c = day(p.completedAt);
        if (c) c.completed++;
        s.scoreBuckets[bucketIndex(p.score)].players++;
      }
    });
    vouchers.forEach((v) => {
      const d = day(v.issuedAt);
      if (d) d.vouchers++;
      if (v.redeemedAt) {
        const r = day(v.redeemedAt);
        if (r) r.redeemed++;
      }
    });

    const completed = plays.filter((p) => p.completedAt && p.score !== null);
    s.visits = visits.length;
    s.started = plays.length;
    s.completed = completed.length;
    s.averageScore = completed.length
      ? Math.round(completed.reduce((a, p) => a + (p.score ?? 0), 0) / completed.length)
      : 0;
    s.vouchersIssued = vouchers.length;
    s.vouchersRedeemed = vouchers.filter((v) => v.redeemedAt).length;
    return s;
  }

  async submitDemoRequest(request: DemoRequest): Promise<void> {
    const list = readJSON<(DemoRequest & { at: string })[]>(KEYS.requests, []);
    writeJSON(KEYS.requests, [...list, { ...request, at: new Date().toISOString() }]);
  }
}
