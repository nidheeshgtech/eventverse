import type { AnalyticsSummary, DailyMetric } from '@/types/analytics';

/** Deterministic PRNG so sample charts look the same on every load. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const SCORE_RANGES = ['0–99', '100–199', '200–299', '300–399', '400–499', '500+'];

export function bucketIndex(score: number): number {
  return Math.min(5, Math.max(0, Math.floor(score / 100)));
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function lastNDays(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(isoDay(d));
  }
  return out;
}

const SCALE: Record<string, number> = {
  'demo-winter-festival': 1.6,
  'demo-retail-brand': 0.9,
  'demo-exhibition-booth': 0.55,
  'demo-luxury-perfume': 1.1,
};

/** Generated figures for demo mode. Always shown with a "Sample data" label. */
export function sampleAnalytics(eventIds: string[]): AnalyticsSummary {
  const days = lastNDays(14);
  const daily: DailyMetric[] = days.map((date) => ({ date, visits: 0, started: 0, completed: 0, vouchers: 0, redeemed: 0 }));
  const buckets = new Array(6).fill(0);
  let scoreSum = 0;

  for (const id of eventIds) {
    const rand = mulberry32(hash(id));
    const scale = SCALE[id] ?? 0.4 + rand() * 0.4;
    days.forEach((date, i) => {
      const dow = new Date(date).getDay();
      const weekend = dow === 5 || dow === 6 ? 1.45 : 1; // Fri/Sat peak in the UAE
      const ramp = 0.75 + (i / days.length) * 0.4;
      const visits = Math.round((260 + rand() * 140) * scale * weekend * ramp);
      const started = Math.round(visits * (0.72 + rand() * 0.1));
      const completed = Math.round(started * (0.84 + rand() * 0.08));
      const vouchers = Math.round(completed * (0.3 + rand() * 0.1));
      const redeemed = i > days.length - 3 ? Math.round(vouchers * 0.3) : Math.round(vouchers * (0.48 + rand() * 0.15));
      const d = daily[i];
      d.visits += visits;
      d.started += started;
      d.completed += completed;
      d.vouchers += vouchers;
      d.redeemed += redeemed;
      for (let k = 0; k < completed; k += 8) {
        const score = Math.max(0, Math.round(340 + (rand() + rand() + rand() - 1.5) * 240));
        buckets[bucketIndex(score)] += 8;
        scoreSum += score * 8;
      }
    });
  }

  const totals = daily.reduce(
    (acc, d) => ({
      visits: acc.visits + d.visits,
      started: acc.started + d.started,
      completed: acc.completed + d.completed,
      vouchers: acc.vouchers + d.vouchers,
      redeemed: acc.redeemed + d.redeemed,
    }),
    { visits: 0, started: 0, completed: 0, vouchers: 0, redeemed: 0 },
  );
  const scored = buckets.reduce((a, b) => a + b, 0);

  return {
    visits: totals.visits,
    started: totals.started,
    completed: totals.completed,
    averageScore: scored ? Math.round(scoreSum / scored) : 0,
    vouchersIssued: totals.vouchers,
    vouchersRedeemed: totals.redeemed,
    daily,
    scoreBuckets: SCORE_RANGES.map((range, i) => ({ range, players: buckets[i] })),
  };
}

export function emptySummary(): AnalyticsSummary {
  return {
    visits: 0,
    started: 0,
    completed: 0,
    averageScore: 0,
    vouchersIssued: 0,
    vouchersRedeemed: 0,
    daily: lastNDays(14).map((date) => ({ date, visits: 0, started: 0, completed: 0, vouchers: 0, redeemed: 0 })),
    scoreBuckets: SCORE_RANGES.map((range) => ({ range, players: 0 })),
  };
}
