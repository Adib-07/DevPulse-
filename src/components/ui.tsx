import type { ReactNode } from 'react';
import { twMerge } from './twMerge';

export function Card({
  children,
  className,
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: 'indigo' | 'violet' | 'green' | 'red' | 'none';
}) {
  const accentBorder =
    accent === 'indigo'
      ? 'before:bg-indigo/60'
      : accent === 'violet'
        ? 'before:bg-violet/60'
        : accent === 'green'
          ? 'before:bg-neon-green/60'
          : accent === 'red'
            ? 'before:bg-neon-red/60'
            : 'before:bg-transparent';
  return (
    <section
      className={twMerge(
        'relative rounded-2xl bg-ink-surface/80 backdrop-blur-sm border border-ink-border shadow-card overflow-hidden',
        'before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:rounded-l-2xl',
        accentBorder,
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  icon,
  title,
  meta,
  right,
}: {
  icon?: ReactNode;
  title: string;
  meta?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-ink-border/70">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-ink-raised border border-ink-border text-slate-200">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">{title}</h2>
          {meta && <div className="mt-0.5 text-xs text-slate-400 font-mono truncate">{meta}</div>}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'indigo' | 'green' | 'red' | 'amber';
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-ink-raised text-slate-300 border-ink-subtle',
    indigo: 'bg-indigo/10 text-indigo-bright border-indigo/30',
    green: 'bg-neon-green/10 text-neon-green border-neon-green/30',
    red: 'bg-neon-red/10 text-neon-red border-neon-red/30',
    amber: 'bg-neon-amber/10 text-neon-amber border-neon-amber/30',
  };
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase tracking-wider',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = 'green', pulse = false }: { tone?: 'green' | 'red' | 'amber' | 'indigo' | 'slate'; pulse?: boolean }) {
  const colors: Record<string, string> = {
    green: 'bg-neon-green',
    red: 'bg-neon-red',
    amber: 'bg-neon-amber',
    indigo: 'bg-indigo-bright',
    slate: 'bg-slate-500',
  };
  return (
    <span className="relative inline-flex h-2 w-2">
      {pulse && <span className={twMerge('absolute inline-flex h-full w-full rounded-full opacity-60 animate-pulse-ring', colors[tone])} />}
      <span className={twMerge('relative inline-flex h-2 w-2 rounded-full', colors[tone])} />
    </span>
  );
}
