/**
 * DevPulse MCP Protocol & Data Types
 * Target Protocol Specification: MCP 2025-11-25 (backwards compatible with 2024-11-05)
 */

export const MCP_PROTOCOL_VERSION = '2025-11-25'
export const SUPPORTED_PROTOCOL_VERSIONS = ['2025-11-25', '2024-11-05']

export const JSONRPC_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const

export interface JSONRPCRequest {
  jsonrpc: '2.0'
  id?: string | number | null
  method: string
  params?: Record<string, unknown>
}

export interface JSONRPCResponse {
  jsonrpc: '2.0'
  id: string | number | null
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

export interface JSONSchemaProperty {
  type: string
  description?: string
  enum?: readonly string[] | string[]
  items?: { type: string }
  default?: unknown
}

export interface JSONSchemaObject {
  type: 'object'
  properties: Record<string, JSONSchemaProperty>
  required?: readonly string[] | string[]
  additionalProperties?: boolean
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: JSONSchemaObject
}

export interface MCPToolContent {
  type: 'text' | 'image' | 'resource'
  text: string
}

export interface MCPToolResult {
  content: MCPToolContent[]
  isError?: boolean
  structuredData?: Record<string, unknown>
}

export interface SourceReference {
  title: string
  identifier?: string
  url?: string
  detail?: string
}

export interface ExecutionTrace {
  id: string
  timestamp: string
  userQuery: string
  toolName: string
  arguments: Record<string, unknown>
  dataSource: string
  status: 'success' | 'error'
  durationMs: number
  summary: string
  sourceReferences: SourceReference[]
  rawResult?: unknown
}

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low'
export type TaskStatus = 'Open' | 'In Progress' | 'In Review' | 'Done'

export interface DeveloperTask {
  id: string
  title: string
  priority: PriorityLevel
  status: TaskStatus
  assignee: string
  description: string
  label: string
  url: string
}

export interface DeveloperPullRequest {
  id: number
  title: string
  author: string
  status: 'Open' | 'Closed' | 'Merged'
  reviewStatus: 'Approved' | 'Review requested' | 'Changes requested' | 'Draft'
  checks: {
    tests: 'Passing' | 'Failing' | 'Pending' | 'Not reported'
    build: 'Passing' | 'Failing' | 'Pending' | 'Not reported'
  }
  failureReason?: string
  url: string
}

export interface DeveloperAlert {
  id: string
  title: string
  detail: string
  severity: 'Critical' | 'Warning' | 'Info'
  time: string
  service: string
  resolved: boolean
}

export interface RepositoryCommit {
  sha: string
  shortSha: string
  message: string
  author: string
  date: string
  url: string
}

export interface DocumentationDoc {
  id: string
  title: string
  category: string
  snippet: string
  url: string
}
