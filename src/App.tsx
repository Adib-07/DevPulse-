import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Radio } from 'lucide-react';
import { TopNav } from '@/components/TopNav';
import { VoiceLinkFeed } from '@/components/VoiceLinkFeed';
import { SprintCriticals } from '@/components/SprintCriticals';
import { GitPulse } from '@/components/GitPulse';
import { OpsSentinel } from '@/components/OpsSentinel';
import { CommandConsole } from '@/components/CommandConsole';
import { processCommand } from '@/sim/commandEngine';
import { EMPTY_REPO, INITIAL_OPS, NO_TASKS, SECURE_OPS } from '@/sim/mockData';
import { loadHistory, saveInteraction, clearHistory, replayHistory } from '@/sim/persistence';
import type {
  ConnectionState,
  OpsState,
  RepoState,
  TaskTicket,
  VoiceInteraction,
} from '@/sim/types';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function App() {
  const [connection, setConnection] = useState<ConnectionState>('connecting');
  const [interactions, setInteractions] = useState<VoiceInteraction[]>([]);
  const [processing, setProcessing] = useState(false);
  const [waveformLevel, setWaveformLevel] = useState(0);
  const [tasks, setTasks] = useState<TaskTicket[]>(NO_TASKS);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [repo, setRepo] = useState<RepoState>(EMPTY_REPO);
  const [ops, setOps] = useState<OpsState>(INITIAL_OPS);
  const [justSecured, setJustSecured] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const timer = useRef<number | null>(null);
  const waveformIntervalRef = useRef<number | null>(null);
  const interactionsRef = useRef<VoiceInteraction[]>([]);
  interactionsRef.current = interactions;

  const startWaveform = useCallback(() => {
    if (waveformIntervalRef.current) return;
    waveformIntervalRef.current = window.setInterval(() => {
      setWaveformLevel(0.3 + Math.random() * 0.7);
    }, 80);
  }, []);

  const stopWaveform = useCallback(() => {
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
    }
    setWaveformLevel(0);
  }, []);

  // Load persisted history + replay dashboard state on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let history = await loadHistory();
        if (cancelled) return;

        // Support '?demo=active' query parameter for live hackathon presentations and instant inspection
        const params = new URLSearchParams(window.location.search);
        if (history.length === 0 && (params.get('demo') === 'active' || params.get('populated') === 'true')) {
          history = [
            {
              id: 'demo-seed-1',
              timestamp: Date.now() - 150000,
              command: 'Alexa, get assigned tasks',
              response: processCommand('Alexa, get assigned tasks').response,
              commandId: 'FETCH_TASKS',
              status: 'ok',
            },
            {
              id: 'demo-seed-2',
              timestamp: Date.now() - 80000,
              command: 'Alexa, check repository status',
              response: processCommand('Alexa, check repository status').response,
              commandId: 'CHECK_REPO',
              status: 'ok',
            },
            {
              id: 'demo-seed-3',
              timestamp: Date.now() - 20000,
              command: 'Alexa, run guardrail check',
              response: processCommand('Alexa, run guardrail check').response,
              commandId: 'RUN_GUARDRAIL',
              status: 'ok',
            },
          ];
        }

        // Merge saved history with any interactions the user already issued
        // while loading was in flight, so a slow load never clobbers live input.
        setInteractions((prev) => [...history, ...prev]);
        const replay = replayHistory([...history, ...interactionsRef.current]);
        setTasks(replay.tasks);
        setTasksLoaded(replay.tasksLoaded);
        setRepo(replay.repo);
        setOps(replay.ops);
        setJustSecured(replay.justSecured);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load saved history.');
      } finally {
        if (!cancelled) {
          setConnection('connected');
        }
      }
    })();
    return () => {
      cancelled = true;
      window.clearTimeout(timer.current ?? undefined);
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
    };
  }, []);

  const handleSubmit = useCallback(
    (raw: string) => {
      if (processing) return;
      const command = raw.trim();
      if (!command) return;

      setProcessing(true);
      setJustSecured(false);
      startWaveform();

      window.clearTimeout(timer.current ?? undefined);
      timer.current = window.setTimeout(() => {
        const result = processCommand(command);
        const interaction: VoiceInteraction = {
          id: uid(),
          timestamp: Date.now(),
          command,
          response: result.response,
          commandId: result.commandId,
          status: result.status,
        };

        setInteractions((prev) => [...prev, interaction]);

        if (result.tasks) {
          setTasks(result.tasks);
          setTasksLoaded(true);
        }
        if (result.repo) {
          setRepo(result.repo);
        }
        if (result.opsAction === 'secure') {
          setOps(SECURE_OPS);
          setJustSecured(true);
        }

        setProcessing(false);
        stopWaveform();

        // Best-effort persistence — a failure shouldn't break the live demo.
        void saveInteraction(interaction).catch((err) => {
          console.error('Failed to persist interaction:', err);
        });
      }, 750);
    },
    [processing, startWaveform, stopWaveform],
  );

  const handleReset = useCallback(() => {
    if (processing) return;
    window.clearTimeout(timer.current ?? undefined);
    stopWaveform();
    setInteractions([]);
    setProcessing(false);
    setTasks(NO_TASKS);
    setTasksLoaded(false);
    setRepo(EMPTY_REPO);
    setOps(INITIAL_OPS);
    setJustSecured(false);
    setLoadError(null);
    void clearHistory().catch((err) => {
      console.error('Failed to clear history:', err);
    });
  }, [processing, stopWaveform]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#090A0F] text-[#F8FAFC] antialiased selection:bg-lavender/30 selection:text-white">
      {/* Subtle top ambient glow for depth and premium hierarchy */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[340px] opacity-35 blur-[120px] bg-gradient-to-b from-indigo/30 via-violet/10 to-transparent"
        aria-hidden="true"
      />

      {/* Top Navigation */}
      <TopNav connectionStatus={connection} />

      {/* Main Content Workspace */}
      <main className="relative z-1 flex-1 mx-auto w-full max-w-[1400px] px-4 sm:px-6 py-5 sm:py-8 space-y-6 pb-44 transition-all duration-300">
        {loadError && (
          <div className="rounded-xl border border-neon-amber/30 bg-neon-amber/10 px-4 py-3 text-sm text-neon-amber font-mono">
            Couldn’t load saved history ({loadError}). The demo will continue with an empty state.
          </div>
        )}

        {/* Voice Link Feed with live audio simulation */}
        <VoiceLinkFeed
          interactions={interactions}
          isProcessing={processing}
          currentWaveformLevel={waveformLevel}
        />

        {/* Triple Grid Cards for Sprint Criticals, Git Pulse, Ops Sentinel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SprintCriticals tasks={tasks} loaded={tasksLoaded} />
          <GitPulse repo={repo} />
          <OpsSentinel ops={ops} justSecured={justSecured} />
        </div>
      </main>

      {/* Floating Command Console */}
      <CommandConsole onSubmit={handleSubmit} onReset={handleReset} processing={processing} />

      {/* Polished Glassmorphism Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/[0.06] bg-[#090A0F]/85 backdrop-blur-xl px-4 py-2.5 sm:px-6">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between gap-4 text-[11px] font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="font-mono text-[11px]">DevPulse Portal · JC&E · All systems operational</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-lavender" aria-hidden="true">
              <Mic className="h-3.5 w-3.5 text-lavender" />
              <span className="font-mono text-[11px]">Voice Simulated</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-neon-green" aria-hidden="true">
              <Radio className="h-3.5 w-3.5 text-neon-green" />
              <span className="font-mono text-[11px]">MCP Ready</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

