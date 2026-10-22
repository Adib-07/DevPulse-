import { useState, useCallback, useRef } from 'react';
import type { DashboardState, VoiceInteraction, CommandAction } from './types';
import { initialSystemMetrics } from './data/mockData';
import { processCommand, generateCommandResult, simulateProcessingDelay } from './engine/commandEngine';
import { TopNav } from './components/TopNav';
import { VoiceLinkFeed } from './components/VoiceLinkFeed';
import { SprintCriticals } from './components/SprintCriticals';
import { GitPulse } from './components/GitPulse';
import { OpsSentinel } from './components/OpsSentinel';
import { FloatingCommandConsole } from './components/FloatingCommandConsole';
import { Icons } from './components/Icons';

const INITIAL_STATE: DashboardState = {
  tasks: [],
  tasksLoading: false,
  repository: null,
  repositoryLoading: false,
  systemMetrics: initialSystemMetrics,
  voiceHistory: [],
  isProcessing: false,
  connectionStatus: 'connected',
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function App() {
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);
  const [waveformLevel, setWaveformLevel] = useState(0);
  const waveformIntervalRef = useRef<number | null>(null);

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

  const addVoiceInteraction = useCallback((
    userCommand: string,
    assistantResponse: string,
    action: CommandAction,
    processing: boolean = false
  ) => {
    const interaction: VoiceInteraction = {
      id: generateId(),
      timestamp: new Date(),
      userCommand,
      assistantResponse,
      action,
      processing,
    };
    setState((prev) => ({
      ...prev,
      voiceHistory: [...prev.voiceHistory, interaction],
    }));
    return interaction.id;
  }, []);

  const updateVoiceInteraction = useCallback((id: string, updates: Partial<VoiceInteraction>) => {
    setState((prev) => ({
      ...prev,
      voiceHistory: prev.voiceHistory.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    }));
  }, []);

  const handleCommandSubmit = useCallback(async (command: string) => {
    if (state.isProcessing) return;

    setState((prev) => ({ ...prev, isProcessing: true }));
    startWaveform();

    const interactionId = addVoiceInteraction(command, '', 'UNKNOWN', true);

    try {
      const processed = processCommand(command);
      await simulateProcessingDelay();

      const result = generateCommandResult(processed);

      updateVoiceInteraction(interactionId, {
        assistantResponse: result.response,
        action: result.action,
        processing: false,
      });

      if (result.success && result.data) {
        setState((prev) => {
          const nextState = { ...prev };
          const data = result.data!;

          if (result.action === 'FETCH_TASKS' && data.tasks) {
            nextState.tasks = data.tasks;
            nextState.tasksLoading = false;
          } else if (result.action === 'CHECK_REPO_STATUS' && data.repository) {
            nextState.repository = data.repository;
            nextState.repositoryLoading = false;
          } else if (result.action === 'RUN_GUARDRAIL_CHECK' && data.systemMetrics) {
            nextState.systemMetrics = {
              ...prev.systemMetrics,
              ...data.systemMetrics,
            };
          }

          return nextState;
        });
      }
    } catch (error) {
      updateVoiceInteraction(interactionId, {
        assistantResponse: 'An unexpected error occurred during command processing. Please try again.',
        action: 'UNKNOWN',
        processing: false,
      });
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
      stopWaveform();
    }
  }, [state.isProcessing, addVoiceInteraction, updateVoiceInteraction, startWaveform, stopWaveform]);

  const handleReset = useCallback(() => {
    stopWaveform();
    setState(INITIAL_STATE);
  }, [stopWaveform]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-primary)]">
      <TopNav connectionStatus={state.connectionStatus} />

      <main className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 sm:py-6 pb-40">
        <VoiceLinkFeed
          interactions={state.voiceHistory}
          isProcessing={state.isProcessing}
          currentWaveformLevel={waveformLevel}
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SprintCriticals tasks={state.tasks} loading={state.tasksLoading} />
          <GitPulse repository={state.repository} loading={state.repositoryLoading} />
          <OpsSentinel metrics={state.systemMetrics} />
        </div>
      </main>

      <FloatingCommandConsole
        onSubmit={handleCommandSubmit}
        onReset={handleReset}
        isProcessing={state.isProcessing}
      />

      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-white/5 bg-[var(--color-bg-deep)]/95 backdrop-blur-xl px-4 py-2 sm:px-6">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between gap-4 text-[11px] text-[var(--color-text-muted)]">
          <span>DevPulse Portal · Hackathon Demo · Simulated Data Only</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1" aria-hidden="true">
              <Icons.mic size={12} />
              <span>Voice Simulated</span>
            </span>
            <span className="flex items-center gap-1" aria-hidden="true">
              <Icons.link size={12} />
              <span>MCP Ready</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}