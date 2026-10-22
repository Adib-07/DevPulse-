import { GitBranch, GitPullRequest, CheckCircle2, XCircle, AlertTriangle, GitCommit } from 'lucide-react';
import type { RepoState } from '@/sim/types';
import { Card, CardHeader, Badge, Dot } from './ui';

export function GitPulse({ repo }: { repo: RepoState }) {
  const loaded = repo.repo !== '—';
  const failing = repo.build === 'failing';

  return (
    <Card accent={failing ? 'red' : 'green'} className={`h-full ${failing ? 'shadow-red-glow' : 'shadow-card'}`}>
      <CardHeader
        icon={<GitBranch className="h-5 w-5 text-indigo-bright" />}
        title="Git Pulse"
        meta={loaded ? `${repo.repo} · ${repo.branch}` : 'repository · simulated'}
        right={
          loaded ? (
            <Badge tone={failing ? 'red' : 'green'}>
              {failing ? <XCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
              {failing ? 'Build Failing' : 'Build Passing'}
            </Badge>
          ) : (
            <Badge tone="neutral">No repo</Badge>
          )
        }
      />

      <div className="p-4 space-y-3 min-h-[260px]">
        {!loaded && (
          <div className="rounded-xl border border-dashed border-ink-subtle bg-ink-raised/40 px-4 py-8 text-center">
            <GitBranch className="h-6 w-6 mx-auto mb-2 text-slate-500" />
            <p className="text-sm text-slate-300 font-medium">No repository loaded</p>
            <p className="mt-1 text-xs text-slate-500">
              Say <span className="font-mono text-indigo-bright">“Alexa, check repository status”</span> to load pull requests and build health.
            </p>
          </div>
        )}

        {loaded && (
          <>
            {/* Build failing alert */}
            {failing && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-neon-red/40 bg-neon-red/10 px-3.5 py-3 animate-alert-shake"
              >
                <span className="mt-0.5 grid place-items-center h-7 w-7 shrink-0 rounded-lg bg-neon-red/20 text-neon-red">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neon-red">Build Failing on Main</p>
                  <p className="mt-0.5 text-xs text-slate-300/90 font-mono leading-relaxed">{repo.buildDetail}</p>
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Open PRs" value={String(repo.openPrCount)} />
              <Stat
                label="Build"
                value={repo.build === 'failing' ? 'Failing' : repo.build === 'passing' ? 'Passing' : 'Pending'}
                tone={failing ? 'red' : 'green'}
              />
            </div>

            {/* Latest PR */}
            {repo.latestPr && (
              <article className="rounded-xl border border-ink-border bg-ink-raised/50 p-3.5 animate-fade-up">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    <GitPullRequest className="h-3.5 w-3.5 text-indigo-bright" />
                    PR #{repo.latestPr.number}
                  </span>
                  <Badge tone="indigo">{repo.latestPr.status}</Badge>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 leading-snug">{repo.latestPr.title}</h3>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">@{repo.latestPr.author}</span>
                  <span className="font-mono truncate ml-2">{repo.latestPr.branch}</span>
                </div>
              </article>
            )}

            {/* Last commit */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 rounded-lg bg-ink-raised/40 border border-ink-border/60 px-3 py-2">
              <GitCommit className="h-3.5 w-3.5 text-slate-500" />
              <span className="truncate">{repo.lastCommit}</span>
            </div>

            {/* Health footer */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-500">Repository health</span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <Dot tone={failing ? 'red' : 'green'} pulse={failing} />
                {repo.health === 'failing' ? 'Needs attention' : 'Healthy'}
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
    <div className="rounded-xl border border-ink-border bg-ink-raised/40 px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}
