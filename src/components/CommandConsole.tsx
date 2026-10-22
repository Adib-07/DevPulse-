import { useState, useRef, type KeyboardEvent } from 'react';
import { Mic, Send, RotateCcw, CornerDownLeft } from 'lucide-react';
import { EXAMPLE_COMMANDS } from '@/sim/mockData';

export function CommandConsole({
  onSubmit,
  onReset,
  processing,
  disabled,
}: {
  onSubmit: (command: string) => void;
  onReset: () => void;
  processing: boolean;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const v = value.trim();
    if (!v || processing || disabled) return;
    onSubmit(v);
    setValue('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="sticky bottom-0 z-20 px-3 sm:px-6 pb-3 sm:pb-5">
      <div className="mx-auto max-w-[1100px]">
        {/* Example chips */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="hidden sm:inline text-[11px] font-mono uppercase tracking-widest text-slate-500 mr-1">
            Try:
          </span>
          {EXAMPLE_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              disabled={processing || disabled}
              onClick={() => {
                if (processing || disabled) return;
                onSubmit(cmd);
                setValue('');
              }}
              className="group inline-flex items-center gap-1.5 rounded-full border border-ink-border bg-ink-surface/80 px-3 py-1 text-xs text-slate-300 hover:border-indigo/40 hover:text-white hover:bg-ink-raised transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-bright/70 group-hover:bg-indigo-bright" />
              {cmd}
            </button>
          ))}
        </div>

        {/* Console bar */}
        <div className="rounded-2xl border border-ink-border bg-ink-surface/90 backdrop-blur-md shadow-card px-2.5 py-2.5 sm:px-3 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="relative grid place-items-center h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-violet to-indigo-deep text-white shadow-violet-glow">
              {processing && <span className="absolute inline-flex h-full w-full rounded-xl bg-violet/40 animate-pulse-ring" />}
              <Mic className="h-5 w-5" />
            </span>

            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              disabled={disabled}
              placeholder="Simulate Alexa Voice Command..."
              aria-label="Simulate Alexa voice command"
              className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-slate-100 placeholder:text-slate-500 outline-none border-none disabled:opacity-50"
            />

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              <CornerDownLeft className="h-3.5 w-3.5" />
              <span>Enter</span>
            </div>

            <button
              type="button"
              onClick={onReset}
              disabled={processing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-border bg-ink-raised px-2.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset demo to initial state"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={!value.trim() || processing || disabled}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-indigo to-violet px-3.5 py-2 text-sm font-semibold text-white shadow-indigo-glow hover:from-indigo-bright hover:to-violet-bright transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              title="Submit command"
            >
              {processing ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{processing ? 'Sending' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
