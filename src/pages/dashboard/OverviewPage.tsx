import { useState } from 'react';
import { EngagementChart, FunnelChart, ScoreChart, VoucherChart } from '@/components/dashboard/Charts';
import { KpiCard, Panel } from '@/components/dashboard/KpiCard';
import { Icon } from '@/components/ui/Icon';
import { Badge, SampleBadge, Spinner } from '@/components/ui/Misc';
import { useAsync } from '@/hooks/useAsync';
import { data } from '@/services/data';
import type { AnalyticsSummary } from '@/types/analytics';

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : '—');

export default function OverviewPage() {
  const [eventId, setEventId] = useState<string>('');
  const events = useAsync(() => data.listEvents(), []);
  const analytics = useAsync(() => data.getAnalytics(eventId || null), [eventId]);
  const device = useAsync(() => data.getDeviceActivity(eventId || null), [eventId]);

  const sample = analytics.data?.source === 'sample';
  const s = analytics.data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold sm:text-3xl">Overview</h1>
            {sample ? <SampleBadge label="Sample data" /> : analytics.data && <Badge tone="green">Live data</Badge>}
          </div>
          <p className="mt-1 text-sm text-slate-400">Last 14 days · engagement and reward performance</p>
        </div>
        <label className="flex flex-col gap-1 text-xs text-slate-400 sm:w-64">
          Event
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="rounded-xl border border-white/10 bg-midnight-950/60 px-3 py-2.5 text-sm text-white focus:border-electric-400/60 focus:outline-none"
          >
            <option value="">All events</option>
            {events.data?.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.brandName}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sample && (
        <div className="flex gap-3 rounded-2xl border border-gold-400/25 bg-gold-400/[0.07] p-4 text-sm text-gold-200">
          <Icon name="info" size={18} className="mt-0.5 shrink-0 text-gold-300" />
          <p>
            <strong className="text-gold-300">These figures are generated sample data</strong> for demonstrating the dashboard. They do not represent real
            visitors. Real activity from this browser is shown separately below.
          </p>
        </div>
      )}

      {analytics.loading || !s ? (
        <div className="py-20">
          <Spinner label="Loading analytics" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="Total game visits" value={s.visits} icon="users" tone="gold" />
            <KpiCard label="Games started" value={s.started} icon="play" tone="blue" hint={`${pct(s.started, s.visits)} of visits`} />
            <KpiCard label="Completed games" value={s.completed} icon="check" tone="purple" hint={`${pct(s.completed, s.started)} completion`} />
            <KpiCard label="Average score" value={s.averageScore} icon="target" tone="gold" hint="points per round" />
            <KpiCard label="Vouchers issued" value={s.vouchersIssued} icon="gift" tone="green" hint={`${pct(s.vouchersIssued, s.completed)} of players`} />
            <KpiCard label="Vouchers redeemed" value={s.vouchersRedeemed} icon="ticket" tone="rose" hint={`${pct(s.vouchersRedeemed, s.vouchersIssued)} redemption`} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Panel title="Engagement over time">
              <EngagementChart summary={s} />
            </Panel>
            <Panel title="Conversion funnel">
              <FunnelChart summary={s} />
              <p className="mt-5 text-xs text-slate-400">
                Overall conversion from visit to redeemed voucher: <span className="font-semibold text-white">{pct(s.vouchersRedeemed, s.visits)}</span>
              </p>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Score distribution">
              <ScoreChart summary={s} />
            </Panel>
            <Panel title="Vouchers issued vs redeemed">
              <VoucherChart summary={s} />
            </Panel>
          </div>
        </>
      )}

      {data.mode === 'local' && <DeviceActivity summary={device.data} />}
    </div>
  );
}

function DeviceActivity({ summary }: { summary: AnalyticsSummary | undefined }) {
  return (
    <Panel title="Real activity in this browser" action={<Badge tone="green">Live · this device</Badge>}>
      {!summary ? (
        <Spinner />
      ) : summary.visits === 0 ? (
        <p className="text-sm text-slate-400">No plays recorded yet. Open a demo event and play a round — it will appear here.</p>
      ) : (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['Visits', summary.visits],
            ['Started', summary.started],
            ['Completed', summary.completed],
            ['Avg score', summary.averageScore],
            ['Vouchers', summary.vouchersIssued],
            ['Redeemed', summary.vouchersRedeemed],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/5 p-3">
              <dt className="text-xs text-slate-400">{k}</dt>
              <dd className="mt-1 font-display text-xl font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}
