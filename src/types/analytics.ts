export interface DailyMetric {
  date: string; // YYYY-MM-DD
  visits: number;
  started: number;
  completed: number;
  vouchers: number;
  redeemed: number;
}

export interface AnalyticsSummary {
  visits: number;
  started: number;
  completed: number;
  averageScore: number;
  vouchersIssued: number;
  vouchersRedeemed: number;
  daily: DailyMetric[];
  scoreBuckets: { range: string; players: number }[];
}
