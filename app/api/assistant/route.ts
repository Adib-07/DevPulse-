import { GoogleGenAI } from '@google/genai'
import { MCP_TOOLS, executeTool } from '../../../lib/mcp/tools.ts'
import { DeveloperDataConnector } from '../../../lib/mcp/data-connector.ts'

export const dynamic = 'force-dynamic'

const MAX_COMMAND_LENGTH = 500

interface ClassificationResult {
  toolName: string
  args: Record<string, unknown>
  uiAction: string
  filter?: string
  confidence: 'deterministic' | 'gemini' | 'fallback'
}

/**
 * Deterministic intent classifier for Alexa+ and developer voice queries.
 * Provides 100% reliable offline/airgapped fallback routing for target queries.
 */
function classifyIntentDeterministically(query: string): ClassificationResult {
  const q = query.toLowerCase().trim()

  // 1. Tool B: get_my_high_priority_bugs
  if (
    q.includes('high-priority') ||
    q.includes('high priority') ||
    (q.includes('priority') && q.includes('bug')) ||
    (q.includes('top') && (q.includes('bug') || q.includes('task'))) ||
    q.includes('critical bug') ||
    q.includes('critical task')
  ) {
    const limit = q.includes('two') || q.includes(' 2') ? 2 : q.includes('three') || q.includes(' 3') ? 3 : 2
    const assignee = q.includes('jordan') ? 'Jordan' : 'Alex'
    return {
      toolName: 'get_my_high_priority_bugs',
      args: { assignee, limit },
      uiAction: 'filter_tasks',
      filter: 'High',
      confidence: 'deterministic',
    }
  }

  // 2. Tool C: list_pull_requests_needing_attention
  if (
    q.includes('pull request') ||
    q.includes('pull requests') ||
    q.includes('pr ') ||
    q.includes('prs') ||
    q.includes('attention') ||
    q.includes('code review')
  ) {
    let reason: 'all' | 'review_requested' | 'changes_requested' | 'checks_failing' = 'all'
    if (q.includes('review')) reason = 'review_requested'
    else if (q.includes('failing') || q.includes('failed') || q.includes('check')) reason = 'checks_failing'
    else if (q.includes('change')) reason = 'changes_requested'

    return {
      toolName: 'list_pull_requests_needing_attention',
      args: { reason },
      uiAction: 'pull_requests',
      filter: reason === 'all' ? 'All' : reason,
      confidence: 'deterministic',
    }
  }

  // 3. Tool D: summarize_recent_activity
  if (
    q.includes('recent changes') ||
    q.includes('recent commit') ||
    q.includes('activity') ||
    q.includes('git log') ||
    q.includes('commit history') ||
    q.includes('what changed')
  ) {
    return {
      toolName: 'summarize_recent_activity',
      args: { limit: 5 },
      uiAction: 'activity',
      confidence: 'deterministic',
    }
  }

  // 4. Tool E: search_technical_documentation
  if (
    q.includes('documentation') ||
    q.includes('docs') ||
    q.includes('error') ||
    q.includes('how to') ||
    q.includes('specification') ||
    q.includes('guide')
  ) {
    const cleanedQuery = q
      .replace(/find|search|for|documentation|docs|relevant|to|about/gi, '')
      .trim() || 'MCP Specification'
    return {
      toolName: 'search_technical_documentation',
      args: { query: cleanedQuery },
      uiAction: 'overview',
      confidence: 'deterministic',
    }
  }

  // 5. Tool F: get_repository_health_summary
  if (
    q.includes('health') ||
    q.includes('status') ||
    q.includes('overview') ||
    q.includes('telemetry') ||
    q.includes('dashboard')
  ) {
    return {
      toolName: 'get_repository_health_summary',
      args: {},
      uiAction: 'repository',
      confidence: 'deterministic',
    }
  }

  // 6. Tool G: recommend_next_action
  if (
    q.includes('next') ||
    q.includes('investigate') ||
    q.includes('recommend') ||
    q.includes('what should i do') ||
    q.includes('suggest')
  ) {
    return {
      toolName: 'recommend_next_action',
      args: { focusArea: 'all' },
      uiAction: 'overview',
      confidence: 'deterministic',
    }
  }

  // 7. Tool A: list_repository_issues (General tasks/issues query)
  if (
    q.includes('issue') ||
    q.includes('task') ||
    q.includes('sprint') ||
    q.includes('assigned') ||
    q.includes('todo')
  ) {
    const assignee = q.includes('jordan') ? 'Jordan' : q.includes('alex') ? 'Alex' : undefined
    return {
      toolName: 'list_repository_issues',
      args: { status: 'open', assignee },
      uiAction: 'tasks',
      confidence: 'deterministic',
    }
  }

  // Default fallback recommendation
  return {
    toolName: 'recommend_next_action',
    args: { focusArea: 'all' },
    uiAction: 'overview',
    confidence: 'fallback',
  }
}

export async function GET() {
  const isConfigured = Boolean(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY
  )
  return Response.json({
    status: 'online',
    endpoint: '/api/assistant',
    model: isConfigured ? 'gemini-2.5-flash (active)' : 'deterministic-mcp-router (active)',
    geminiConfigured: isConfigured,
    mcpEndpoint: '/api/mcp',
    registeredTools: MCP_TOOLS.map((t) => t.name),
  })
}

export async function POST(request: Request) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid JSON request payload.' }, { status: 400 })
    }

    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Request body must be a valid JSON object.' }, { status: 400 })
    }

    const { command } = body as { command?: unknown }

    if (typeof command !== 'string' || !command.trim()) {
      return Response.json({ error: 'A valid non-empty command string is required.' }, { status: 400 })
    }

    const trimmedCommand = command.trim()
    if (trimmedCommand.length > MAX_COMMAND_LENGTH) {
      return Response.json(
        { error: `Command exceeds maximum permitted length of ${MAX_COMMAND_LENGTH} characters.` },
        { status: 400 }
      )
    }

    // Step 1: Classify intent (deterministic first for speed and offline resilience)
    let classification = classifyIntentDeterministically(trimmedCommand)

    // Step 2: If Gemini key is available and query was ambiguous fallback, use Gemini to refine
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY
    if (apiKey && classification.confidence === 'fallback') {
      try {
        const ai = new GoogleGenAI({ apiKey })
        const prompt = `You are the DevPulse MCP Assistant router.
Available tools:
${MCP_TOOLS.map((t) => `- ${t.name}: ${t.description}`).join('\n')}

Classify the user command into exactly one tool and JSON arguments:
User query: "${trimmedCommand}"

Respond strictly with valid JSON:
{
  "toolName": string,
  "arguments": object,
  "uiAction": "overview" | "tasks" | "repository" | "pull_requests" | "alerts" | "activity"
}`

        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            temperature: 0.1,
            responseMimeType: 'application/json',
            abortSignal: AbortSignal.timeout(6000),
          },
        })

        const parsed = JSON.parse(res.text || '{}')
        if (parsed.toolName && MCP_TOOLS.some((t) => t.name === parsed.toolName)) {
          classification = {
            toolName: parsed.toolName,
            args: parsed.arguments || {},
            uiAction: parsed.uiAction || 'overview',
            confidence: 'gemini',
          }
        }
      } catch {
        // Safe ignore - fall back cleanly to deterministic classification
      }
    }

    // Step 3: Execute the MCP tool via the developer data connector
    const connector = new DeveloperDataConnector()
    const { result, trace } = await executeTool(
      classification.toolName,
      classification.args,
      trimmedCommand,
      connector
    )

    const assistantResponse =
      result.content[0]?.text || 'Tool executed successfully but produced no text output.'

    return Response.json({
      action: classification.uiAction,
      filter: classification.filter || '',
      response: assistantResponse,
      tool: classification.toolName,
      trace,
      sourceReferences: trace.sourceReferences,
      confidence: classification.confidence,
    })
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'TimeoutError'
    return Response.json(
      {
        error: isTimeout
          ? 'Assistant request timed out. Please try again.'
          : 'The assistant could not process that request.',
      },
      { status: isTimeout ? 504 : 500 }
    )
  }
}
