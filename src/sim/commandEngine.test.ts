import { describe, it, expect } from 'vitest';
import { recognizeCommand, processCommand, SUPPORTED_COMMANDS_TEXT } from './commandEngine';
import { MOCK_TASKS, MOCK_REPO } from './mockData';

describe('commandEngine: recognizeCommand', () => {
  it('recognizes task commands with Alexa prefix', () => {
    expect(recognizeCommand('Alexa, get assigned tasks')).toBe('FETCH_TASKS');
    expect(recognizeCommand('Alexa, fetch my assigned bugs')).toBe('FETCH_TASKS');
    expect(recognizeCommand('alexa show tasks')).toBe('FETCH_TASKS');
    expect(recognizeCommand('Alexa, list my sprint')).toBe('FETCH_TASKS');
  });

  it('recognizes task commands without Alexa prefix', () => {
    expect(recognizeCommand('get assigned tasks')).toBe('FETCH_TASKS');
    expect(recognizeCommand('show my assigned bugs')).toBe('FETCH_TASKS');
    expect(recognizeCommand('fetch assigned tasks')).toBe('FETCH_TASKS');
    expect(recognizeCommand('assigned tasks')).toBe('FETCH_TASKS');
  });

  it('recognizes repo commands with Alexa prefix', () => {
    expect(recognizeCommand('Alexa, check repository status')).toBe('CHECK_REPO');
    expect(recognizeCommand('alexa, show repo status')).toBe('CHECK_REPO');
    expect(recognizeCommand('Alexa, fetch open PRs')).toBe('CHECK_REPO');
    expect(recognizeCommand('alexa check github status')).toBe('CHECK_REPO');
  });

  it('recognizes repo commands without Alexa prefix', () => {
    expect(recognizeCommand('check repository status')).toBe('CHECK_REPO');
    expect(recognizeCommand('check repo status')).toBe('CHECK_REPO');
    expect(recognizeCommand('show repo health')).toBe('CHECK_REPO');
    expect(recognizeCommand('repo status')).toBe('CHECK_REPO');
  });

  it('recognizes guardrail / security commands with Alexa prefix', () => {
    expect(recognizeCommand('Alexa, run guardrail check')).toBe('RUN_GUARDRAIL');
    expect(recognizeCommand('alexa, check system security')).toBe('RUN_GUARDRAIL');
  });

  it('recognizes guardrail / security commands without Alexa prefix', () => {
    expect(recognizeCommand('run guardrail check')).toBe('RUN_GUARDRAIL');
    expect(recognizeCommand('run security check')).toBe('RUN_GUARDRAIL');
    expect(recognizeCommand('verify system safety')).toBe('RUN_GUARDRAIL');
    expect(recognizeCommand('guardrail check')).toBe('RUN_GUARDRAIL');
  });

  it('returns UNKNOWN for empty or unrecognized input', () => {
    expect(recognizeCommand('')).toBe('UNKNOWN');
    expect(recognizeCommand('   ')).toBe('UNKNOWN');
    expect(recognizeCommand('what is the weather')).toBe('UNKNOWN');
    expect(recognizeCommand('play some music')).toBe('UNKNOWN');
  });
});

describe('commandEngine: processCommand', () => {
  it('handles empty input gracefully with error status', () => {
    const result = processCommand('');
    expect(result.status).toBe('error');
    expect(result.commandId).toBe('UNKNOWN');
    expect(result.response).toContain('I did not catch a command');
  });

  it('handles FETCH_TASKS and returns mock tasks and ok status', () => {
    const result = processCommand('Alexa, get assigned tasks');
    expect(result.status).toBe('ok');
    expect(result.commandId).toBe('FETCH_TASKS');
    expect(result.tasks).toEqual(MOCK_TASKS);
    expect(result.tasks?.length).toBeGreaterThan(0);
    expect(result.response).toContain(String(MOCK_TASKS.length));
  });

  it('handles CHECK_REPO and returns repo status and ok status', () => {
    const result = processCommand('Alexa, check repository status');
    expect(result.status).toBe('ok');
    expect(result.commandId).toBe('CHECK_REPO');
    expect(result.repo).toEqual(MOCK_REPO);
    expect(result.repo?.build).toBe('failing');
    expect(result.response).toContain(MOCK_REPO.repo);
  });

  it('handles RUN_GUARDRAIL and returns secure opsAction and ok status', () => {
    const result = processCommand('Alexa, run guardrail check');
    expect(result.status).toBe('ok');
    expect(result.commandId).toBe('RUN_GUARDRAIL');
    expect(result.opsAction).toBe('secure');
    expect(result.response).toContain('System Fully Secure');
  });

  it('handles UNKNOWN command with helpful suggestions', () => {
    const result = processCommand('open the pod bay doors');
    expect(result.status).toBe('unknown');
    expect(result.commandId).toBe('UNKNOWN');
    expect(result.response).toContain('not supported');
    expect(result.response).toContain('Alexa, get assigned tasks');
  });

  it('exports SUPPORTED_COMMANDS_TEXT', () => {
    expect(SUPPORTED_COMMANDS_TEXT).toContain('Alexa, get assigned tasks');
    expect(SUPPORTED_COMMANDS_TEXT).toContain('Alexa, check repository status');
    expect(SUPPORTED_COMMANDS_TEXT).toContain('Alexa, run guardrail check');
  });
});
