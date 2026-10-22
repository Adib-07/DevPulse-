import { useState, useRef, type KeyboardEvent } from 'react';
import { Mic, Send, RotateCcw, CornerDownLeft } from 'lucide-react';
import { EXAMPLE_COMMANDS } from '@/sim/mockData';

export function CommandConsole({
  onSubmit,
  onReset,
  processing,
  isProcessing,
  disabled,
}: {
  onSubmit: (command: string) => void;
  onReset: () => void;
  processing?: boolean;
  isProcessing?: boolean;
  disabled?: boolean;
}) {
  const isBusy = isProcessing ?? processing ?? false;
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const v = value.trim();
    if (!v || isBusy || disabled) return;
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
    <div className="sticky bottom-0 z-20 px-3 sm:px-6 pb-3 sm:pb-6 pointer-events-none">
      <div className="mx-auto max-w-[1100px] pointer-events-auto">
        {/* Example chips */}
        <div className="mb-2.5 flex flex-wrap items-center gap-2" role="region" aria-label="Example voice commands">
          <span className="hidden sm:inline text-[11px] font-mono uppercase tracking-widest text-slate-400 mr-1 font-medium">
            Try:
          </span>
          {EXAMPLE_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              disabled={isBusy || disabled}
              onClick={() => {
                if (isBusy || disabled) return;
                onSubmit(cmd);
                setValue('');
              }}
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#161821]/80 px-3 py-1 text-xs text-slate-300 hover:border-violet/40 hover:text-white hover:bg-[#1C1F2B] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-lavender/70 group-hover:bg-lavender group-hover:shadow-[0_0_8px_rgba(196,181,253,0.6)]" />
              <span>{cmd}</span>
            </button>
          ))}
        </div>

        {/* Console bar */}
        <div className="rounded-2xl border border-white/[0.1] bg-[#161821]/90 backdrop-blur-xl shadow-card hover:shadow-card-hover hover:border-violet/30 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="relative grid place-items-center h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo via-violet to-lavender-glow text-white shadow-violet-glow"
              aria-hidden="true"
            >
              {isBusy && <span className="absolute inline-flex h-full w-full rounded-xl bg-violet/40 animate-pulse-ring" />}
              <Mic className="h-5 w-5" />
            </span>

            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              disabled={disabled || isBusy}
              placeholder="Simulate Alexa Voice Command..."
              aria-label="Simulate Alexa voice command"
              className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-slate-100 placeholder:text-slate-400 outline-none border-none disabled:opacity-50 font-sans selection:bg-lavender/30"
            />

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono bg-white/[0.04] border border-white/[0.06] rounded-md px-1.5 py-0.5" aria-hidden="true">
              <CornerDownLeft className="h-3 w-3" />
              <span>Enter</span>
            </div>

            <button
              type="button"
              onClick={onReset}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#1C1F2B] px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title="Reset demo to initial state"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={!value.trim() || isBusy || disabled}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-indigo via-violet to-lavender px-4 py-2 text-sm font-semibold text-white shadow-indigo-glow hover:brightness-110 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              title="Submit command"
            >
              {isBusy ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{isBusy ? 'Sending' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export FloatingCommandConsole alias for Stitch compatibility
export { CommandConsole as FloatingCommandConsole };

