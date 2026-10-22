import { supabase, persistenceEnabled } from './supabaseClient';
import { processCommand } from './commandEngine';
import { SECURE_OPS, INITIAL_OPS, EMPTY_REPO, NO_TASKS } from './mockData';
import type {
  CommandId,
  OpsState,
  RepoState,
  TaskTicket,
  VoiceInteraction,
} from './types';

interface InteractionRow {
  id: string;
  command: string;
  response: string;
  command_id: CommandId;
  status: 'ok' | 'unknown' | 'error';
  created_at: string;
}

// Race any persistence call against a short timeout so a blocked or
// slow network can never freeze the demo UI. Persistence is best-effort.
// Supabase query builders are thenables but not full Promises, so callers
// wrap them with Promise.resolve() to satisfy the Promise<T> contract.
function withTimeout<T>(p: Promise<T>, ms = 4000, label = 'operation'): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

export async function loadHistory(): Promise<VoiceInteraction[]> {
  if (!supabase) return [];
  const { data, error } = await withTimeout(
    Promise.resolve(
      supabase
        .from('voice_interactions')
        .select('id, command, response, command_id, status, created_at')
        .order('created_at', { ascending: true })
        .limit(50),
    ),
    4000,
    'loadHistory',
  );
  if (error) throw error;
  return (data as InteractionRow[]).map((r) => ({
    id: r.id,
    timestamp: new Date(r.created_at).getTime(),
    command: r.command,
    response: r.response,
    commandId: r.command_id,
    status: r.status,
  }));
}

export async function saveInteraction(it: VoiceInteraction): Promise<void> {
  if (!supabase) return;
  const { error } = await withTimeout(
    Promise.resolve(
      supabase.from('voice_interactions').insert({
        command: it.command,
        response: it.response,
        command_id: it.commandId,
        status: it.status,
      }),
    ),
    4000,
    'saveInteraction',
  );
  if (error) throw error;
}

export async function clearHistory(): Promise<void> {
  if (!supabase) return;
  const { error } = await withTimeout(
    Promise.resolve(
      supabase.from('voice_interactions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ),
    4000,
    'clearHistory',
  );
  if (error) throw error;
}

// Re-derive dashboard state from a replayed interaction list, applying only
// the latest effect per panel (last task fetch, last repo check, last guardrail).
export interface ReplayResult {
  tasks: TaskTicket[];
  tasksLoaded: boolean;
  repo: RepoState;
  ops: OpsState;
  justSecured: boolean;
}

export function replayHistory(history: VoiceInteraction[]): ReplayResult {
  let tasks: TaskTicket[] = NO_TASKS;
  let tasksLoaded = false;
  let repo: RepoState = EMPTY_REPO;
  let ops: OpsState = INITIAL_OPS;
  let justSecured = false;

  // Apply effects in chronological order.
  for (const it of history) {
    const result = processCommand(it.command);
    if (result.tasks) {
      tasks = result.tasks;
      tasksLoaded = true;
    }
    if (result.repo) {
      repo = result.repo;
    }
    if (result.opsAction === 'secure') {
      ops = SECURE_OPS;
      justSecured = true;
    } else {
      justSecured = false;
    }
  }
  return { tasks, tasksLoaded, repo, ops, justSecured };
}

export { persistenceEnabled };
