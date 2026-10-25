import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AnalyticsSummary } from '@/types/analytics';

export const CHART = {
  gold: '#f9d36b',
  blue: '#4cc3ff',
  purple: '#a57bff',
  green: '#34d399',
  rose: '#fb7185',
  grid: 'rgba(255,255,255,0.06)',
  axis: '#8b8fb8',
};

const tooltipStyle = {
  contentStyle: {
    background: 'rgba(12,12,40,0.95)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 12,
    boxShadow: '0 12px 30px rgba(0,0,0,.4)',
  },
  labelStyle: { color: '#cbd5e1', marginBottom: 4 },
  cursor: { fill: 'rgba(255,255,255,0.04)', stroke: 'rgba(255,255,255,0.15)' },
};

const axisProps = {
  stroke: CHART.axis,
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const compact = (n: number) => new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export function EngagementChart({ summary }: { summary: AnalyticsSummary }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={summary.daily} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {(['gold', 'blue', 'purple'] as const).map((c) => (
            <linearGradient key={c} id={`fill-${c}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART[c]} stopOpacity={0.35} />
              <stop offset="100%" stopColor={CHART[c]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="date" tickFormatter={shortDate} {...axisProps} minTickGap={24} />
        <YAxis {...axisProps} width={40} tickFormatter={compact} />
        <Tooltip {...tooltipStyle} labelFormatter={(v) => shortDate(String(v))} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#cbd5e1', paddingTop: 8 }} />
        <Area type="monotone" dataKey="visits" name="Visits" stroke={CHART.gold} strokeWidth={2} fill="url(#fill-gold)" />
        <Area type="monotone" dataKey="started" name="Games started" stroke={CHART.blue} strokeWidth={2} fill="url(#fill-blue)" />
        <Area type="monotone" dataKey="completed" name="Completed" stroke={CHART.purple} strokeWidth={2} fill="url(#fill-purple)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FunnelChart({ summary }: { summary: AnalyticsSummary }) {
  const steps = [
    { name: 'Visits', value: summary.visits, color: CHART.gold },
    { name: 'Started', value: summary.started, color: CHART.blue },
    { name: 'Completed', value: summary.completed, color: CHART.purple },
    { name: 'Vouchers', value: summary.vouchersIssued, color: CHART.green },
    { name: 'Redeemed', value: summary.vouchersRedeemed, color: CHART.rose },
  ];
  const top = steps[0].value || 1;
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const pct = (s.value / top) * 100;
        const prev = i > 0 ? steps[i - 1].value : 0;
        const step = i > 0 && prev ? Math.round((s.value / prev) * 100) : null;
        return (
          <li key={s.name}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-medium text-slate-200">{s.name}</span>
              <span className="tabular-nums text-slate-400">
                <span className="font-semibold text-white">{s.value.toLocaleString()}</span>
                {step !== null && <span className="ml-2">{step}% of previous</span>}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.max(pct, s.value ? 2 : 0)}%`, background: s.color }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ScoreChart({ summary }: { summary: AnalyticsSummary }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={summary.scoreBuckets} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="range" {...axisProps} />
        <YAxis {...axisProps} width={40} tickFormatter={compact} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="players" name="Players" radius={[8, 8, 0, 0]}>
          {summary.scoreBuckets.map((b, i) => (
            <Cell key={b.range} fill={i >= 3 ? CHART.gold : CHART.purple} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VoucherChart({ summary }: { summary: AnalyticsSummary }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={summary.daily} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="date" tickFormatter={shortDate} {...axisProps} minTickGap={24} />
        <YAxis {...axisProps} width={40} tickFormatter={compact} />
        <Tooltip {...tooltipStyle} labelFormatter={(v) => shortDate(String(v))} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#cbd5e1', paddingTop: 8 }} />
        <Bar dataKey="vouchers" name="Issued" fill={CHART.green} radius={[6, 6, 0, 0]} />
        <Bar dataKey="redeemed" name="Redeemed" fill={CHART.blue} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
