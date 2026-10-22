import type { CommandId, CommandResult } from './types';
import { MOCK_TASKS, MOCK_REPO } from './mockData';

// Deterministic, local command recognition + response generation.
// The UI never matches commands itself — it calls `processCommand`.
// To connect a real MCP server later, replace this module's body with a
// network call that resolves the same `CommandResult` shape.

const TASK_PATTERNS = [
  /^(alexa,?\s+)?(get|fetch|show|list)\s+(my\s+)?(assigned\s+)?(tasks?|bugs?|sprint)/i,
  /^(alexa,?\s+)?(show|get|fetch|list)\s+(my\s+)?assigned\s+(tasks?|bugs?)/i,
  /^(alexa,?\s+)?assigned\s+tasks?/i,
];

const REPO_PATTERNS = [
  /^(alexa,?\s+)?(check|show|fetch)\s+(repository|repo|github|git)\s+status/i,
  /^(alexa,?\s+)?fetch\s+open\s+pr'?s?/i,
  /^(alexa,?\s+)?(check|show)\s+(github|repo|repository)\s+status/i,
  /^(alexa,?\s+)?show\s+(repository|repo)\s+health/i,
  /^(alexa,?\s+)?(git|repo|repository)\s+status/i,
];

const GUARDRAIL_PATTERNS = [
  /^(alexa,?\s+)?run\s+guardrail\s+check/i,
  /^(alexa,?\s+)?check\s+system\s+security/i,
  /^(alexa,?\s+)?run\s+security\s+check/i,
  /^(alexa,?\s+)?verify\s+system\s+safety/i,
  /^(alexa,?\s+)?guardrail\s+check/i,
];


const normalize = (raw: string): string => raw.trim().replace(/\s+/g, ' ');

const matches = (text: string, patterns: RegExp[]): boolean =>
  patterns.some((re) => re.test(text));

const supportedList = [
  '• "Alexa, get assigned tasks"',
  '• "Alexa, check repository status"',
  '• "Alexa, run guardrail check"',
].join('\n');

export function recognizeCommand(raw: string): CommandId {
  const text = normalize(raw);
  if (!text) return 'UNKNOWN';
  if (matches(text, GUARDRAIL_PATTERNS)) return 'RUN_GUARDRAIL';
  if (matches(text, REPO_PATTERNS)) return 'CHECK_REPO';
  if (matches(text, TASK_PATTERNS)) return 'FETCH_TASKS';
  return 'UNKNOWN';
}

export function processCommand(raw: string): CommandResult {
  const text = normalize(raw);
  if (!text) {
    return {
      response: 'I did not catch a command. Try one of the suggested commands below.',
      commandId: 'UNKNOWN',
      status: 'error',
    };
  }

  const id = recognizeCommand(text);

  switch (id) {
    case 'FETCH_TASKS':
      return {
        response: `Retrieved ${MOCK_TASKS.length} assigned tasks from your active sprint. The most urgent is DEV-101 — a critical memory leak in the metrics endpoint. (Simulated sprint data.)`,
        commandId: 'FETCH_TASKS',
        status: 'ok',
        tasks: MOCK_TASKS,
      };
    case 'CHECK_REPO':
      return {
        response: `Repository devpulse-mcp (main) has ${MOCK_REPO.openPrCount} open pull requests. Latest PR #247 is failing CI on the main branch — 3 e2e timeouts. (Simulated repository data.)`,
        commandId: 'CHECK_REPO',
        status: 'ok',
        repo: MOCK_REPO,
      };
    case 'RUN_GUARDRAIL':
      return {
        response: 'Guardrail check complete. All simulated security checks passed, active system errors cleared, and all services are reporting operational. System Fully Secure. (Simulated security audit.)',
        commandId: 'RUN_GUARDRAIL',
        status: 'ok',
        opsAction: 'secure',
      };
    case 'UNKNOWN':
    default:
      return {
        response: `I understood "${text}", but that command is not supported by this demo. Try one of:\n${supportedList}`,
        commandId: 'UNKNOWN',
        status: 'unknown',
      };
  }
}

export { supportedList as SUPPORTED_COMMANDS_TEXT };
