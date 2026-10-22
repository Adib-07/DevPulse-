import type {
  TaskTicket,
  RepoState,
  OpsState,
} from './types';

// Initial empty-state values used before any command runs.
export const NO_TASKS: TaskTicket[] = [];

// STATE A — returned by "Alexa, get assigned tasks".
export const MOCK_TASKS: TaskTicket[] = [
  {
    id: 'DEV-101',
    title: 'Fix API endpoint memory leak',
    description: 'GET /metrics retains response buffers after each request, causing steady RSS growth under load.',
    priority: 'CRITICAL',
    assignee: 'A. Okafor',
    status: 'In Progress',
  },
  {
    id: 'DEV-114',
    title: 'Webhook retry storm on 503 responses',
    description: 'Retry backoff miscalculates jitter, sending bursts to downstream providers during outages.',
    priority: 'HIGH',
    assignee: 'M. Chen',
    status: 'To Do',
  },
  {
    id: 'DEV-122',
    title: 'Dashboard sparkline flickers on resize',
    description: 'SVG path recomputes before layout settles, producing a one-frame visual jitter on breakpoint changes.',
    priority: 'MEDIUM',
    assignee: 'R. Patel',
    status: 'In Review',
  },
];

// Initial (unpopulated) repo state.
export const EMPTY_REPO: RepoState = {
  repo: '—',
  branch: '—',
  openPrCount: 0,
  latestPr: null,
  build: 'pending',
  buildDetail: 'No repository data loaded yet.',
  lastCommit: '—',
  health: 'healthy',
};

// STATE B — returned by "Alexa, check repository status".
export const MOCK_REPO: RepoState = {
  repo: 'devpulse-mcp',
  branch: 'main',
  openPrCount: 3,
  latestPr: {
    number: 247,
    title: 'Refactor MCP tool registry into typed dispatcher',
    author: 'a.okafor',
    branch: 'feat/tool-registry',
    status: 'open',
    build: 'failing',
  },
  build: 'failing',
  buildDetail: 'CI step "test:e2e" failed — 3 timeouts in mcp-dispatcher.spec.ts (exit code 124).',
  lastCommit: '8f3a2c1 · feat: typed tool dispatcher',
  health: 'failing',
};

// Initial Ops Sentinel state with one warning + one error.
export const INITIAL_OPS: OpsState = {
  overall: 'attention',
  apiLatencyMs: 412,
  latencySeries: [240, 285, 310, 290, 360, 410, 395, 440, 412, 430, 388, 412],
  services: [
    { name: 'api-gateway', state: 'degraded', latencyMs: 412 },
    { name: 'auth-service', state: 'operational', latencyMs: 96 },
    { name: 'db-cluster', state: 'operational', latencyMs: 18 },
    { name: 'webhooks', state: 'operational', latencyMs: 142 },
  ],
  alerts: [
    {
      id: 'ops-err-1',
      level: 'error',
      message: 'api-gateway: 5xx error rate above SLO (2.1% over 5m window)',
      source: 'ops-sentinel',
    },
    {
      id: 'ops-warn-1',
      level: 'warning',
      message: 'auth-service: elevated refresh-token latency nearing threshold',
      source: 'ops-sentinel',
    },
  ],
  guardrail: 'pending',
  warningCount: 1,
  errorCount: 1,
};

// STATE C — returned by "Alexa, run guardrail check".
export const SECURE_OPS: OpsState = {
  overall: 'healthy',
  apiLatencyMs: 128,
  latencySeries: [240, 285, 310, 290, 360, 410, 395, 440, 412, 300, 220, 128],
  services: [
    { name: 'api-gateway', state: 'operational', latencyMs: 128 },
    { name: 'auth-service', state: 'operational', latencyMs: 71 },
    { name: 'db-cluster', state: 'operational', latencyMs: 14 },
    { name: 'webhooks', state: 'operational', latencyMs: 88 },
  ],
  alerts: [],
  guardrail: 'secure',
  warningCount: 0,
  errorCount: 0,
};

export const EXAMPLE_COMMANDS: string[] = [
  'Alexa, get assigned tasks',
  'Alexa, check repository status',
  'Alexa, run guardrail check',
];
