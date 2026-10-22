import { describe, it, expect } from 'vitest';
import { replayHistory } from './persistence';
import { EMPTY_REPO, INITIAL_OPS, NO_TASKS, SECURE_OPS, MOCK_TASKS, MOCK_REPO } from './mockData';
import type { VoiceInteraction, CommandId } from './types';

function makeInteraction(command: string, commandId: CommandId, status: 'ok' | 'unknown' | 'error' = 'ok'): VoiceInteraction {
  return {
    id: `test-${Math.random()}`,
    timestamp: Date.now(),
    command,
    response: 'test response',
    commandId,
    status,
  };
}

describe('persistence: replayHistory', () => {
  it('returns default initial state for empty history', () => {
    const replay = replayHistory([]);
    expect(replay.tasks).toEqual(NO_TASKS);
    expect(replay.tasksLoaded).toBe(false);
    expect(replay.repo).toEqual(EMPTY_REPO);
    expect(replay.ops).toEqual(INITIAL_OPS);
    expect(replay.justSecured).toBe(false);
  });

  it('replays FETCH_TASKS correctly', () => {
    const history = [makeInteraction('Alexa, get assigned tasks', 'FETCH_TASKS')];
    const replay = replayHistory(history);
    expect(replay.tasksLoaded).toBe(true);
    expect(replay.tasks).toEqual(MOCK_TASKS);
    expect(replay.repo).toEqual(EMPTY_REPO);
    expect(replay.ops).toEqual(INITIAL_OPS);
  });

  it('replays CHECK_REPO correctly', () => {
    const history = [makeInteraction('Alexa, check repository status', 'CHECK_REPO')];
    const replay = replayHistory(history);
    expect(replay.tasksLoaded).toBe(false);
    expect(replay.repo).toEqual(MOCK_REPO);
    expect(replay.ops).toEqual(INITIAL_OPS);
  });

  it('replays RUN_GUARDRAIL correctly', () => {
    const history = [makeInteraction('Alexa, run guardrail check', 'RUN_GUARDRAIL')];
    const replay = replayHistory(history);
    expect(replay.justSecured).toBe(true);
    expect(replay.ops).toEqual(SECURE_OPS);
  });

  it('replays multiple interactions in chronological order', () => {
    const history = [
      makeInteraction('Alexa, get assigned tasks', 'FETCH_TASKS'),
      makeInteraction('Alexa, check repository status', 'CHECK_REPO'),
      makeInteraction('Alexa, run guardrail check', 'RUN_GUARDRAIL'),
    ];
    const replay = replayHistory(history);
    expect(replay.tasksLoaded).toBe(true);
    expect(replay.tasks).toEqual(MOCK_TASKS);
    expect(replay.repo).toEqual(MOCK_REPO);
    expect(replay.ops).toEqual(SECURE_OPS);
    expect(replay.justSecured).toBe(true);
  });

  it('handles unknown commands without breaking dashboard state', () => {
    const history = [
      makeInteraction('Alexa, get assigned tasks', 'FETCH_TASKS'),
      makeInteraction('what is the meaning of life', 'UNKNOWN', 'unknown'),
    ];
    const replay = replayHistory(history);
    expect(replay.tasksLoaded).toBe(true);
    expect(replay.tasks).toEqual(MOCK_TASKS);
    expect(replay.justSecured).toBe(false);
  });
});
