import { twMerge } from './twMerge';

// Decorative animated bar waveform. Purely visual — no audio is captured.
export function Waveform({ active, bars = 24, className }: { active: boolean; bars?: number; className?: string }) {
  const heights = Array.from({ length: bars }, (_, i) => {
    // deterministic pseudo-random heights for idle look
    const v = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * 0.5 + 0.5;
    return Math.max(0.18, Math.min(1, v));
  });
  return (
    <div className={twMerge('flex items-center gap-[3px] h-10', className)} aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          className={twMerge(
            'flex-1 rounded-full origin-center',
            active ? 'bg-gradient-to-t from-violet to-indigo-bright animate-wave' : 'bg-ink-subtle',
            !active && 'opacity-40',
          )}
          style={{
            height: `${Math.round(h * 100)}%`,
            animationDelay: `${(i % 12) * 0.08}s`,
            animationDuration: active ? `${0.9 + (i % 5) * 0.12}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}
