import { useEffect, useRef } from 'react';
import { Mic, Sparkles, User, Bot, Clock, Loader2 } from 'lucide-react';
import type { VoiceInteraction } from '@/sim/types';
import { Card, CardHeader, Dot } from './ui';
import { Waveform } from './Waveform';

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function VoiceLinkFeed({
  interactions,
  processing,
}: {
  interactions: VoiceInteraction[];
  processing: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [interactions.length, processing]);

  const last = interactions[interactions.length - 1];

  return (
    <Card accent="violet" className="shadow-violet-glow">
      <CardHeader
        icon={<Mic className="h-5 w-5 text-violet-bright" />}
        title="Alexa+ Voice Link Feed"
        meta="voice → MCP · simulated"
        right={
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Dot tone={processing ? 'amber' : 'green'} pulse={processing} />
            <span className="hidden sm:inline">{processing ? 'Processing' : 'Listening'}</span>
          </div>
        }
      />

      <div className="px-5 py-4 space-y-4">
        {/* Mic + waveform stage */}
        <div className="flex items-center gap-4 rounded-xl bg-ink-raised/60 border border-ink-border/70 px-4 py-3">
          <div className="relative grid place-items-center h-12 w-12 shrink-0">
            {processing && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-violet/40 animate-pulse-ring" />
            )}
            <span className="relative grid place-items-center h-12 w-12 rounded-full bg-gradient-to-br from-violet to-indigo-deep text-white shadow-violet-glow">
              <Mic className="h-5 w-5" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <Waveform active={processing} bars={28} />
          </div>
          <span className="hidden sm:inline text-[11px] font-mono uppercase tracking-widest text-slate-500">
            {processing ? 'simulate' : 'idle'}
          </span>
        </div>

        {/* Conversation transcript */}
        <div
          ref={scrollRef}
          className="space-y-3 max-h-[220px] overflow-y-auto pr-1"
          role="log"
          aria-live="polite"
        >
          {interactions.length === 0 && !processing && (
            <div className="rounded-xl border border-dashed border-ink-subtle bg-ink-raised/40 px-4 py-6 text-center">
              <Sparkles className="h-5 w-5 mx-auto mb-2 text-violet-bright/80" />
              <p className="text-sm text-slate-300 font-medium">No voice commands yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Issue a command below — try “Alexa, get assigned tasks” — and the assistant response will appear here.
              </p>
            </div>
          )}

          {interactions.map((it) => (
            <div key={it.id} className="space-y-2 animate-fade-up">
              {/* user */}
              <div className="flex gap-2.5">
                <span className="mt-0.5 grid place-items-center h-6 w-6 shrink-0 rounded-md bg-ink-raised border border-ink-border text-slate-300">
                  <User className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>You</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(it.timestamp)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-100 break-words">{it.command}</p>
                </div>
              </div>
              {/* assistant */}
              <div className="flex gap-2.5">
                <span className="mt-0.5 grid place-items-center h-6 w-6 shrink-0 rounded-md bg-violet/15 border border-violet/30 text-violet-bright">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>DevPulse</span>
                    {it.status === 'ok' && <span className="text-neon-green/80">resolved</span>}
                    {it.status === 'unknown' && <span className="text-neon-amber/80">unrecognized</span>}
                    {it.status === 'error' && <span className="text-neon-red/80">error</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-300 whitespace-pre-line break-words">{it.response}</p>
                </div>
              </div>
            </div>
          ))}

          {processing && (
            <div className="flex gap-2.5">
              <span className="mt-0.5 grid place-items-center h-6 w-6 shrink-0 rounded-md bg-violet/15 border border-violet/30 text-violet-bright">
                <Bot className="h-3.5 w-3.5" />
              </span>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Routing command through MCP…
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
