import { GitBranch, GitPullRequest, CheckCircle2, XCircle, AlertTriangle, GitCommit } from 'lucide-react';
import type { RepoState } from '@/sim/types';
import { EMPTY_REPO } from '@/sim/mockData';
import { Card, CardHeader, Badge, Dot } from './ui';

export function GitPulse({
  repo,
  repository,
  loading = false,
}: {
  repo?: RepoState;
  repository?: RepoState;
  loading?: boolean;
}) {
  const currentRepo = repository ?? repo ?? EMPTY_REPO;
  const isLoaded = !loading && currentRepo.repo !== '—';
  const isFailing = currentRepo.build === 'failing';

  return (
    <Card
      accent={isFailing ? 'red' : 'green'}
      className={`h-full border-white/[0.08] bg-[#161821]/80 backdrop-blur-xl transition-all duration-200 ${
        isFailing ? 'shadow-red-glow' : 'shadow-card'
      }`}
    >
      <CardHeader
        icon={<GitBranch className="h-5 w-5 text-lavender" />}
        title="Git Pulse"
        meta={isLoaded ? `${currentRepo.repo} · ${currentRepo.branch}` : 'repository · simulated'}
        right={
          isLoaded ? (
            <Badge tone={isFailing ? 'red' : 'green'}>
              {isFailing ? <XCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
              {isFailing ? 'Build Failing' : 'Build Passing'}
            </Badge>
          ) : (
            <Badge tone="neutral">No repo</Badge>
          )
        }
      />

      <div className="p-4 space-y-3 min-h-[260px]">
        {!isLoaded && (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-[#111319]/50 px-4 py-8 text-center">
            <GitBranch className="h-6 w-6 mx-auto mb-2 text-slate-500" />
            <p className="text-sm text-slate-300 font-medium">No repository loaded</p>
            <p className="mt-1 text-xs text-slate-500">
              Say <span className="font-mono text-lavender">“Alexa, check repository status”</span> to load pull requests and build health.
            </p>
          </div>
        )}

        {isLoaded && (
          <>
            {/* Build failing alert */}
            {isFailing && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-neon-red/40 bg-neon-red/10 px-3.5 py-3 animate-alert-shake"
              >
                <span className="mt-0.5 grid place-items-center h-7 w-7 shrink-0 rounded-lg bg-neon-red/20 text-neon-red">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neon-red">Build Failing on Main</p>
                  <p className="mt-0.5 text-xs text-slate-300/90 font-mono leading-relaxed">{currentRepo.buildDetail}</p>
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Open PRs" value={String(currentRepo.openPrCount)} />
              <Stat
                label="Build"
                value={currentRepo.build === 'failing' ? 'Failing' : currentRepo.build === 'passing' ? 'Passing' : 'Pending'}
                tone={isFailing ? 'red' : 'green'}
              />
            </div>

            {/* Latest PR */}
            {currentRepo.latestPr && (
              <article className="rounded-xl border border-white/[0.06] bg-[#1C1F2B]/60 hover:border-violet/40 hover:bg-[#1C1F2B] p-3.5 animate-fade-up transition-all duration-200 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300">
                    <GitPullRequest className="h-3.5 w-3.5 text-lavender" />
                    PR #{currentRepo.latestPr.number}
                  </span>
                  <Badge tone="indigo">{currentRepo.latestPr.status}</Badge>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 leading-snug">{currentRepo.latestPr.title}</h3>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/[0.04]">
                  <span className="font-mono text-slate-300">@{currentRepo.latestPr.author}</span>
                  <span className="font-mono truncate ml-2 text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded">{currentRepo.latestPr.branch}</span>
                </div>
              </article>
            )}

            {/* Last commit */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 rounded-lg bg-[#111319]/70 border border-white/[0.06] px-3 py-2">
              <GitCommit className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{currentRepo.lastCommit}</span>
            </div>

            {/* Health footer */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-400 font-medium">Repository health</span>
              <span className="inline-flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                <Dot tone={isFailing ? 'red' : 'green'} pulse={isFailing} />
                {currentRepo.health === 'failing' ? 'Needs attention' : 'Healthy'}
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function Stat({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'red' | 'green' }) {
  const color = tone === 'red' ? 'text-neon-red' : tone === 'green' ? 'text-neon-green' : 'text-slate-100';
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111319]/60 px-3.5 py-2.5">
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold font-mono ${color}`}>{value}</div>
    </div>
  );
}

