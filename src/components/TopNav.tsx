import { Activity, Radio, ShieldCheck } from 'lucide-react';
import type { ConnectionState } from '@/sim/types';
import { Dot } from './ui';

export function TopNav({ connection }: { connection: ConnectionState }) {
  const conn = {
    connected: { label: 'Connected', tone: 'green' as const, pulse: true },
    connecting: { label: 'Connecting', tone: 'amber' as const, pulse: true },
    offline: { label: 'Offline', tone: 'red' as const, pulse: false },
  }[connection];

  return (
    <header className="sticky top-0 z-30 border-b border-ink-border/80 bg-ink-base/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-deep to-violet text-white shadow-indigo-glow">
            <Activity className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-neon-green ring-2 ring-ink-base" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base font-semibold text-white tracking-tight truncate">DevPulse Portal</span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-ink-border text-[10px] font-mono uppercase tracking-widest text-slate-400">
              MCP Workspace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neon-amber/30 bg-neon-amber/10 text-neon-amber text-[11px] font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            Demo Mode
          </span>
          <span
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-ink-border bg-ink-surface text-xs font-medium text-slate-300"
            title={`MCP link: ${conn.label} (simulated)`}
          >
            <Radio className="h-3.5 w-3.5 text-slate-400" />
            <Dot tone={conn.tone} pulse={conn.pulse} />
            <span className="hidden sm:inline">{conn.label}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
