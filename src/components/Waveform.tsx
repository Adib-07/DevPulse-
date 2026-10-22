import { twMerge } from './twMerge';

// Decorative animated bar waveform with dynamic audio-level support.
export function Waveform({
  active,
  level = 0,
  bars = 28,
  className,
}: {
  active: boolean;
  level?: number;
  bars?: number;
  className?: string;
}) {
  const heights = Array.from({ length: bars }, (_, i) => {
    // deterministic pseudo-random heights for idle look
    const v = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * 0.5 + 0.5;
    return Math.max(0.18, Math.min(1, v));
  });

  return (
    <div className={twMerge('flex items-center gap-[3px] h-10', className)} aria-hidden="true">
      {heights.map((h, i) => {
        const dynamicScale = active && level > 0 ? Math.min(1, Math.max(0.2, h * (0.6 + level * 0.8))) : h;
        return (
          <span
            key={i}
            className={twMerge(
              'flex-1 rounded-full origin-center transition-all duration-75',
              active ? 'bg-gradient-to-t from-violet to-lavender animate-wave' : 'bg-slate-700/60',
              !active && 'opacity-40',
            )}
            style={{
              height: `${Math.round(dynamicScale * 100)}%`,
              animationDelay: `${(i % 12) * 0.08}s`,
              animationDuration: active ? `${0.9 + (i % 5) * 0.12}s` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

