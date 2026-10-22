import { ShieldCheck, ShieldAlert, Activity, Server, AlertTriangle, AlertOctagon, Gauge } from 'lucide-react';
import type { OpsState } from '@/sim/types';
import { Card, CardHeader, Badge, Dot } from './ui';
import { Sparkline } from './Sparkline';

export function OpsSentinel({ ops, justSecured }: { ops: OpsState; justSecured: boolean }) {
  const secure = ops.guardrail === 'secure';
  const overallTone = ops.overall === 'healthy' ? 'green' : ops.overall === 'attention' ? 'amber' : 'red';

  return (
    <Card accent={secure ? 'green' : ops.overall === 'critical' ? 'red' : 'none'} className={`h-full ${justSecured ? 'shadow-green-glow' : ''}`}>
      <CardHeader
        icon={<Activity className="h-5 w-5 text-indigo-bright" />}
        title="Ops Sentinel"
        meta="system health · simulated"
        right={
          <Badge tone={secure ? 'green' : ops.guardrail === 'pending' ? 'neutral' : 'amber'}>
            {secure ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
            {secure ? 'Secure' : ops.guardrail === 'pending' ? 'Pending' : 'Checking'}
          </Badge>
        }
      />

      <div className="p-4 space-y-3 min-h-[260px]">
        {/* Guardrail success banner */}
        {secure && (
          <div
            className={`flex items-center gap-3 rounded-xl border border-neon-green/40 bg-neon-green/10 px-3.5 py-3 ${justSecured ? 'animate-secure-sweep' : ''}`}
          >
            <span className="grid place-items-center h-9 w-9 shrink-0 rounded-xl bg-neon-green/20 text-neon-green">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-neon-green">System Fully Secure</p>
              <p className="text-xs text-slate-300/90">All simulated checks passed · errors cleared</p>
            </div>
          </div>
        )}

        {/* Latency + health */}
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3 rounded-xl border border-ink-border bg-ink-raised/40 p-3">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500">
              <span className="inline-flex items-center gap-1"><Gauge className="h-3 w-3" /> API Latency</span>
              <span className={`font-mono ${ops.apiLatencyMs > 350 ? 'text-neon-amber' : 'text-neon-green'}`}>{ops.apiLatencyMs}ms</span>
            </div>
            <div className="mt-2">
              <Sparkline data={ops.latencySeries} healthy={ops.apiLatencyMs < 300} />
            </div>
          </div>
          <div className="col-span-2 grid grid-rows-2 gap-3">
            <div className="rounded-xl border border-ink-border bg-ink-raised/40 p-3">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Overall</div>
              <div className={`mt-0.5 text-sm font-semibold inline-flex items-center gap-1.5 ${overallTone === 'green' ? 'text-neon-green' : overallTone === 'amber' ? 'text-neon-amber' : 'text-neon-red'}`}>
                <Dot tone={overallTone} pulse={overallTone !== 'green'} />
                {ops.overall === 'healthy' ? 'Healthy' : ops.overall === 'attention' ? 'Attention' : 'Critical'}
              </div>
            </div>
            <div className="rounded-xl border border-ink-border bg-ink-raised/40 p-3">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">Alerts</div>
              <div className="mt-0.5 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-neon-amber"><AlertTriangle className="h-3.5 w-3.5" />{ops.warningCount}</span>
                <span className="inline-flex items-center gap-1 text-neon-red"><AlertOctagon className="h-3.5 w-3.5" />{ops.errorCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="rounded-xl border border-ink-border bg-ink-raised/40 p-3">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 mb-2">
            <Server className="h-3 w-3" /> Services
          </div>
          <ul className="space-y-1.5">
            {ops.services.map((s) => (
              <li key={s.name} className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">{s.name}</span>
                <span className="inline-flex items-center gap-2">
                  <span className={`font-mono ${s.latencyMs > 300 ? 'text-neon-amber' : 'text-slate-400'}`}>{s.latencyMs}ms</span>
                  <Dot tone={s.state === 'operational' ? 'green' : s.state === 'degraded' ? 'amber' : 'red'} pulse={s.state !== 'operational'} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Active alerts */}
        {ops.alerts.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Active alerts</div>
            {ops.alerts.map((a) => (
              <div
                key={a.id}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs animate-fade-in ${
                  a.level === 'error'
                    ? 'border-neon-red/30 bg-neon-red/5 text-slate-300'
                    : 'border-neon-amber/30 bg-neon-amber/5 text-slate-300'
                }`}
              >
                {a.level === 'error'
                  ? <AlertOctagon className="h-3.5 w-3.5 mt-0.5 text-neon-red shrink-0" />
                  : <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-neon-amber shrink-0" />}
                <span className="leading-relaxed">{a.message}</span>
              </div>
            ))}
          </div>
        )}

        {secure && ops.alerts.length === 0 && (
          <p className="text-xs text-slate-500 text-center pt-1">
            Guardrail simulation complete — no active alerts remain.
          </p>
        )}
      </div>
    </Card>
  );
}
