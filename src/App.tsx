import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [tasks, setTasks] = useState<TaskTicket[]>(NO_TASKS);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [repo, setRepo] = useState<RepoState>(EMPTY_REPO);
  const [ops, setOps] = useState<OpsState>(INITIAL_OPS);
  const [justSecured, setJustSecured] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const timer = useRef<number | null>(null);
  const interactionsRef = useRef<VoiceInteraction[]>([]);
  interactionsRef.current = interactions;

  // Load persisted history + replay dashboard state on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const history = await loadHistory();
        if (cancelled) return;
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
    };
  }, []);

  const handleSubmit = useCallback(
    (raw: string) => {
      if (processing) return;
      const command = raw.trim();
      if (!command) return;

      setProcessing(true);
      setJustSecured(false);

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

        // Best-effort persistence — a failure shouldn't break the live demo.
        void saveInteraction(interaction).catch((err) => {
          console.error('Failed to persist interaction:', err);
        });
      }, 750);
    },
    [processing],
  );

  const handleReset = useCallback(() => {
    if (processing) return;
    window.clearTimeout(timer.current ?? undefined);
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
  }, [processing]);

  return (
    <div className="min-h-screen flex flex-col bg-ink-base">
      <TopNav connection={connection} />

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 sm:px-6 py-5 space-y-5 pb-32">
        {loadError && (
          <div className="rounded-xl border border-neon-amber/30 bg-neon-amber/10 px-4 py-3 text-sm text-neon-amber">
            Couldn’t load saved history ({loadError}). The demo will continue with an empty state.
          </div>
        )}

        <VoiceLinkFeed interactions={interactions} processing={processing} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SprintCriticals tasks={tasks} loaded={tasksLoaded} />
          <GitPulse repo={repo} />
          <OpsSentinel ops={ops} justSecured={justSecured} />
        </div>

        <footer className="pt-2 pb-1 text-center text-[11px] text-slate-600 font-mono">
          DevPulse Portal · simulated demo data · no live services connected
        </footer>
      </main>

      <CommandConsole onSubmit={handleSubmit} onReset={handleReset} processing={processing} />
    </div>
  );
}

export default App;
