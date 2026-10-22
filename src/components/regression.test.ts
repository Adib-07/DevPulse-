import { describe, it, expect } from 'vitest';
import { MOCK_TASKS, MOCK_REPO, INITIAL_OPS, SECURE_OPS, EXAMPLE_COMMANDS } from '../sim/mockData';
import { recognizeCommand } from '../sim/commandEngine';

describe('Regression & Data Integrity Suite', () => {
  it('verifies all example commands are recognized by command engine', () => {
    for (const cmd of EXAMPLE_COMMANDS) {
      const recognized = recognizeCommand(cmd);
      expect(recognized).not.toBe('UNKNOWN');
      expect(['FETCH_TASKS', 'CHECK_REPO', 'RUN_GUARDRAIL']).toContain(recognized);
    }
  });

  it('verifies mock tasks structure and required fields', () => {
    expect(MOCK_TASKS.length).toBeGreaterThan(0);
    for (const task of MOCK_TASKS) {
      expect(task.id).toMatch(/^DEV-\d+/);
      expect(task.title.length).toBeGreaterThan(0);
      expect(task.description.length).toBeGreaterThan(0);
      expect(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).toContain(task.priority);
      expect(task.assignee.length).toBeGreaterThan(0);
      expect(['To Do', 'In Progress', 'In Review', 'Blocked']).toContain(task.status);
    }
  });

  it('verifies mock repository initial and loaded states', () => {
    expect(MOCK_REPO.repo).toBe('devpulse-mcp');
    expect(MOCK_REPO.branch).toBe('main');
    expect(MOCK_REPO.openPrCount).toBeGreaterThan(0);
    expect(MOCK_REPO.latestPr).not.toBeNull();
    expect(MOCK_REPO.latestPr?.number).toBeGreaterThan(0);
    expect(MOCK_REPO.build).toBe('failing');
  });

  it('verifies Ops Sentinel healthy and secured states', () => {
    expect(INITIAL_OPS.guardrail).toBe('pending');
    expect(INITIAL_OPS.errorCount).toBeGreaterThan(0);
    expect(INITIAL_OPS.alerts.length).toBeGreaterThan(0);

    expect(SECURE_OPS.guardrail).toBe('secure');
    expect(SECURE_OPS.errorCount).toBe(0);
    expect(SECURE_OPS.warningCount).toBe(0);
    expect(SECURE_OPS.alerts.length).toBe(0);
    expect(SECURE_OPS.overall).toBe('healthy');
  });
});
