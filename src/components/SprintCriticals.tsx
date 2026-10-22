import { ListChecks, AlertOctagon, User } from 'lucide-react';
import type { TaskTicket } from '@/sim/types';
import { Card, CardHeader, Badge } from './ui';

const priorityTone: Record<string, 'red' | 'amber' | 'indigo' | 'neutral'> = {
  CRITICAL: 'red',
  HIGH: 'amber',
  MEDIUM: 'indigo',
  LOW: 'neutral',
};

export function SprintCriticals({
  tasks,
  loaded,
  loading,
}: {
  tasks: TaskTicket[];
  loaded?: boolean;
  loading?: boolean;
}) {
  const isLoaded = loaded ?? (loading !== undefined ? !loading : tasks.length > 0);
  const count = tasks.length;
  const criticalCount = tasks.filter((t) => t.priority === 'CRITICAL').length;

  return (
    <Card accent="indigo" className="h-full shadow-indigo-glow border-white/[0.08] bg-[#161821]/80 backdrop-blur-xl">
      <CardHeader
        icon={<ListChecks className="h-5 w-5 text-lavender" />}
        title="Sprint Criticals"
        meta="issue tracker · simulated"
        right={
          isLoaded ? (
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <Badge tone="red">
                  <AlertOctagon className="h-3 w-3" />
                  {criticalCount} critical
                </Badge>
              )}
              <Badge tone="indigo">{count} tasks</Badge>
            </div>
          ) : (
            <Badge tone="neutral">0 tasks</Badge>
          )
        }
      />

      <div className="p-4 space-y-3 min-h-[260px]">
        {!isLoaded && (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-[#111319]/50 px-4 py-8 text-center">
            <ListChecks className="h-6 w-6 mx-auto mb-2 text-slate-500" />
            <p className="text-sm text-slate-300 font-medium">No tasks loaded</p>
            <p className="mt-1 text-xs text-slate-500">
              Say <span className="font-mono text-lavender">“Alexa, get assigned tasks”</span> to pull your active sprint tickets.
            </p>
          </div>
        )}

        {isLoaded &&
          tasks.map((t, i) => (
            <article
              key={t.id}
              className="group relative rounded-xl border border-white/[0.06] bg-[#1C1F2B]/60 hover:border-violet/40 hover:bg-[#1C1F2B] transition-all duration-200 p-3.5 animate-fade-up shadow-sm"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] text-slate-400 font-medium">{t.id}</span>
                    <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 leading-snug">{t.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-2">{t.description}</p>
                </div>
                {t.priority === 'CRITICAL' && (
                  <span className="relative flex h-2.5 w-2.5 mt-1 shrink-0" aria-label="Critical alert">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-neon-red/60 animate-pulse-ring" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neon-red" />
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/[0.04]">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  {t.assignee}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded">{t.status}</span>
              </div>
            </article>
          ))}
      </div>
    </Card>
  );
}

