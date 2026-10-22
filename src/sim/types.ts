// Shared domain types for the DevPulse Portal simulation engine.
// These interfaces are intentionally shaped so a future real MCP client
// can replace the local mock engine without touching the UI layer.

export type CommandId =
  | 'FETCH_TASKS'
  | 'CHECK_REPO'
  | 'RUN_GUARDRAIL'
  | 'UNKNOWN';

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Blocked';

export interface TaskTicket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  assignee: string;
  status: TaskStatus;
}

export type BuildStatus = 'passing' | 'failing' | 'pending';

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  branch: string;
  status: 'open' | 'merged' | 'closed';
  build: BuildStatus;
}

export interface RepoState {
  repo: string;
  branch: string;
  openPrCount: number;
  latestPr: PullRequest | null;
  build: BuildStatus;
  buildDetail: string;
  lastCommit: string;
  health: 'healthy' | 'attention' | 'failing';
}

export type ServiceState = 'operational' | 'degraded' | 'down';

export interface ServiceEntry {
  name: string;
  state: ServiceState;
  latencyMs: number;
}

export interface SystemAlert {
  id: string;
  level: 'warning' | 'error';
  message: string;
  source: string;
}

export interface OpsState {
  overall: 'healthy' | 'attention' | 'critical';
  apiLatencyMs: number;
  latencySeries: number[];
  services: ServiceEntry[];
  alerts: SystemAlert[];
  guardrail: 'pending' | 'checking' | 'secure' | 'failed';
  warningCount: number;
  errorCount: number;
}

export interface VoiceInteraction {
  id: string;
  timestamp: number;
  command: string;
  response: string;
  commandId: CommandId;
  status: 'ok' | 'unknown' | 'error';
}

export interface CommandResult {
  response: string;
  commandId: CommandId;
  status: 'ok' | 'unknown' | 'error';
  tasks?: TaskTicket[];
  repo?: RepoState;
  ops?: Partial<OpsState>;
  opsAction?: 'clearErrors' | 'secure';
}

export type ConnectionState = 'connected' | 'connecting' | 'offline';
