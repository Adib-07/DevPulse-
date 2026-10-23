import { DeveloperDataConnector } from './data-connector.ts'
import type {
  ExecutionTrace,
  MCPTool,
  MCPToolResult,
  PriorityLevel,
  SourceReference,
} from './types.ts'

const PRIORITY_RANKS: Record<PriorityLevel, number> = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
}

export const MCP_TOOLS: MCPTool[] = [
  {
    name: 'list_repository_issues',
    description:
      'Retrieve issues for the configured repository with optional status, assignee, and label filters.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['open', 'closed', 'all'],
          description: 'Filter issues by status. Defaults to "open".',
          default: 'open',
        },
        assignee: {
          type: 'string',
          description: 'Filter issues assigned to a specific username (e.g. "Alex" or "Jordan").',
        },
        label: {
          type: 'string',
          description: 'Filter issues by label (e.g. "backend", "api", "auth").',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of issues to return (1-20). Defaults to 10.',
          default: 10,
        },
      },
    },
  },
  {
    name: 'get_my_high_priority_bugs',
    description:
      'Retrieve and rank the highest-priority open bugs assigned to a developer. Ranks deterministically by severity: Critical (rank 1) > High (rank 2) > Medium (rank 3) > Low (rank 4).',
    inputSchema: {
      type: 'object',
      properties: {
        assignee: {
          type: 'string',
          description: 'Developer name to check (defaults to "Alex").',
          default: 'Alex',
        },
        limit: {
          type: 'number',
          description: 'Number of top bugs to retrieve (1-10). Defaults to 2.',
          default: 2,
        },
      },
    },
  },
  {
    name: 'list_pull_requests_needing_attention',
    description:
      'Retrieve open pull requests requiring developer attention, such as requested reviews, requested changes, or failing CI checks.',
    inputSchema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          enum: ['all', 'review_requested', 'changes_requested', 'checks_failing'],
          description: 'Filter by specific attention reason. Defaults to "all".',
          default: 'all',
        },
      },
    },
  },
  {
    name: 'summarize_recent_activity',
    description:
      'Summarize recent commits and engineering activity in the repository with commit hashes, authors, and timestamps.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of recent commits to summarize (1-10). Defaults to 5.',
          default: 5,
        },
      },
    },
  },
  {
    name: 'search_technical_documentation',
    description:
      'Search supported technical documentation (MCP specification, Next.js, GitHub REST API, DevPulse architecture) for keywords or error messages.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search keywords or error message to lookup.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_repository_health_summary',
    description:
      'Calculate and summarize overall repository health metrics including open issues, pull request review states, CI check pass rates, and active alerts.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'recommend_next_action',
    description:
      'Analyze active alerts, failing PR checks, and high-priority bugs to recommend the top read-only next actions for an engineer to investigate.',
    inputSchema: {
      type: 'object',
      properties: {
        focusArea: {
          type: 'string',
          enum: ['all', 'bugs', 'checks', 'alerts'],
          description: 'Focus area for the recommendation. Defaults to "all".',
          default: 'all',
        },
      },
    },
  },
]

export interface ToolExecutionResponse {
  result: MCPToolResult
  trace: ExecutionTrace
}

/**
 * Execute an MCP Tool by name with argument validation and execution tracing.
 */
export async function executeTool(
  toolName: string,
  rawArgs: Record<string, unknown> = {},
  userQuery = '',
  connector = new DeveloperDataConnector()
): Promise<ToolExecutionResponse> {
  const startTime = Date.now()
  const traceId = `tr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const dataSource = connector.getDataSourceLabel()

  try {
    switch (toolName) {
      case 'get_my_high_priority_bugs': {
        const assignee = typeof rawArgs.assignee === 'string' && rawArgs.assignee.trim()
          ? rawArgs.assignee.trim()
          : 'Alex'
        const limit = typeof rawArgs.limit === 'number' && rawArgs.limit > 0 ? Math.min(rawArgs.limit, 10) : 2

        const { tasks, source } = await connector.getTasks({ assignee, status: 'open' })

        // Explicit deterministic ranking: Critical (1) > High (2) > Medium (3) > Low (4)
        const rankedBugs = tasks
          .filter((t) => t.status !== 'Done')
          .sort((a, b) => {
            const rankA = PRIORITY_RANKS[a.priority] ?? 99
            const rankB = PRIORITY_RANKS[b.priority] ?? 99
            if (rankA !== rankB) return rankA - rankB
            return a.id.localeCompare(b.id)
          })
          .slice(0, limit)

        const sourceReferences: SourceReference[] = rankedBugs.map((bug) => ({
          title: `${bug.id}: ${bug.title}`,
          identifier: bug.id,
          url: bug.url,
          detail: `Priority: ${bug.priority} | Status: ${bug.status} | Assignee: ${bug.assignee}`,
        }))

        let textOutput = ''
        if (rankedBugs.length === 0) {
          textOutput = `No open bugs found assigned to ${assignee}. All tasks are resolved or none match.`
        } else {
          const bugList = rankedBugs
            .map(
              (b, idx) =>
                `${idx + 1}. [${b.id}] "${b.title}" — Priority: ${b.priority} (${b.status}). Link: ${b.url}`
            )
            .join('\n')
          textOutput = `Found ${rankedBugs.length} high-priority bug(s) assigned to ${assignee} (ranked by explicit severity rule: Critical > High > Medium > Low):\n${bugList}\n\nRanking rationale: Evaluated open issue tickets assigned to ${assignee}; ordered by priority weight and issue identifier.`
        }

        const durationMs = Date.now() - startTime
        const trace: ExecutionTrace = {
          id: traceId,
          timestamp: new Date().toISOString(),
          userQuery: userQuery || `Get ${limit} high-priority bugs for ${assignee}`,
          toolName,
          arguments: { assignee, limit },
          dataSource: source,
          status: 'success',
          durationMs,
          summary: `Retrieved and ranked ${rankedBugs.length} open bugs for ${assignee}.`,
          sourceReferences,
        }

        return {
          result: {
            content: [{ type: 'text', text: textOutput }],
            isError: false,
            structuredData: {
              assignee,
              count: rankedBugs.length,
              rankingRule: 'Critical (rank 1) > High (rank 2) > Medium (rank 3) > Low (rank 4)',
              bugs: rankedBugs,
            },
          },
          trace,
        }
      }

      case 'list_repository_issues': {
        const status = typeof rawArgs.status === 'string' ? rawArgs.status : 'open'
        const assignee = typeof rawArgs.assignee === 'string' ? rawArgs.assignee : undefined
        const label = typeof rawArgs.label === 'string' ? rawArgs.label : undefined
        const limit = typeof rawArgs.limit === 'number' ? Math.min(rawArgs.limit, 20) : 10

        const { tasks, source } = await connector.getTasks({ status, assignee, label })
        const sliced = tasks.slice(0, limit)

        const sourceReferences: SourceReference[] = sliced.map((t) => ({
          title: `${t.id}: ${t.title}`,
          identifier: t.id,
          url: t.url,
          detail: `Priority: ${t.priority} | Status: ${t.status}`,
        }))

        const textOutput =
          sliced.length === 0
            ? 'No issues found matching the specified filters.'
            : `Repository issues (${sliced.length} shown, status: ${status}):\n` +
              sliced
                .map((t) => `- [${t.id}] ${t.title} (${t.priority}, ${t.status}, Assignee: ${t.assignee})`)
                .join('\n')

        const durationMs = Date.now() - startTime
        return {
          result: {
            content: [{ type: 'text', text: textOutput }],
            isError: false,
            structuredData: { total: sliced.length, issues: sliced },
          },
          trace: {
            id: traceId,
            timestamp: new Date().toISOString(),
            userQuery: userQuery || `List repository issues (${status})`,
            toolName,
            arguments: { status, assignee: assignee || null, label: label || null, limit },
            dataSource: source,
            status: 'success',
            durationMs,
            summary: `Retrieved ${sliced.length} issues with status "${status}".`,
            sourceReferences,
          },
        }
      }

      case 'list_pull_requests_needing_attention': {
        const reason = (
          typeof rawArgs.reason === 'string' && ['all', 'review_requested', 'changes_requested', 'checks_failing'].includes(rawArgs.reason)
            ? rawArgs.reason
            : 'all'
        ) as 'all' | 'review_requested' | 'changes_requested' | 'checks_failing'

        const { pullRequests, source } = await connector.getPullRequests({ reason })

        const sourceReferences: SourceReference[] = pullRequests.map((pr) => ({
          title: `PR #${pr.id}: ${pr.title}`,
          identifier: `#${pr.id}`,
          url: pr.url,
          detail: `Review: ${pr.reviewStatus} | Tests: ${pr.checks.tests}${pr.failureReason ? ` (${pr.failureReason})` : ''}`,
        }))

        let textOutput = ''
        if (pullRequests.length === 0) {
          textOutput = 'No pull requests currently require attention.'
        } else {
          textOutput =
            `Pull requests needing attention (${pullRequests.length} found):\n` +
            pullRequests
              .map((pr) => {
                const checksSummary = `Tests: ${pr.checks.tests}, Build: ${pr.checks.build}`
                const failNote = pr.failureReason ? ` | Blocker: ${pr.failureReason}` : ''
                return `- PR #${pr.id} "${pr.title}" (Author: ${pr.author}) — State: ${pr.reviewStatus}. ${checksSummary}${failNote}. Link: ${pr.url}`
              })
              .join('\n')
        }

        const durationMs = Date.now() - startTime
        return {
          result: {
            content: [{ type: 'text', text: textOutput }],
            isError: false,
            structuredData: { count: pullRequests.length, pullRequests },
          },
          trace: {
            id: traceId,
            timestamp: new Date().toISOString(),
            userQuery: userQuery || 'List pull requests needing attention',
            toolName,
            arguments: { reason },
            dataSource: source,
            status: 'success',
            durationMs,
            summary: `Identified ${pullRequests.length} pull requests requiring attention.`,
            sourceReferences,
          },
        }
      }

      case 'summarize_recent_activity': {
        const limit = typeof rawArgs.limit === 'number' ? Math.min(rawArgs.limit, 10) : 5
        const { commits, source } = await connector.getRecentCommits(limit)

        const sourceReferences: SourceReference[] = commits.map((c) => ({
          title: `Commit ${c.shortSha}: ${c.message}`,
          identifier: c.shortSha,
          url: c.url,
          detail: `Author: ${c.author} | Date: ${c.date}`,
        }))

        const textOutput =
          `Recent repository commits (${commits.length} shown):\n` +
          commits
            .map((c) => `- [${c.shortSha}] ${c.message} (by ${c.author} at ${c.date})`)
            .join('\n')

        const durationMs = Date.now() - startTime
        return {
          result: {
            content: [{ type: 'text', text: textOutput }],
            isError: false,
            structuredData: { count: commits.length, commits },
          },
          trace: {
            id: traceId,
            timestamp: new Date().toISOString(),
            userQuery: userQuery || 'Summarize recent repository activity',
            toolName,
            arguments: { limit },
            dataSource: source,
            status: 'success',
            durationMs,
            summary: `Summarized ${commits.length} recent commits.`,
            sourceReferences,
          },
        }
      }

      case 'search_technical_documentation': {
        const query = typeof rawArgs.query === 'string' ? rawArgs.query.trim() : ''
        if (!query) {
          throw new Error('A valid "query" string parameter is required.')
        }

        const docs = await connector.searchDocumentation(query)
        const sourceReferences: SourceReference[] = docs.map((d) => ({
          title: d.title,
          identifier: d.id,
          url: d.url,
          detail: `Category: ${d.category} — ${d.snippet}`,
        }))

        const textOutput =
          docs.length === 0
            ? `No documentation found matching "${query}". Try searching for "MCP", "Next.js", "Alexa", or "GitHub".`
            : `Found ${docs.length} documentation article(s) matching "${query}":\n` +
              docs
                .map((d, i) => `${i + 1}. [${d.category}] ${d.title}\n   ${d.snippet}\n   URL: ${d.url}`)
                .join('\n\n')

        const durationMs = Date.now() - startTime
        return {
          result: {
            content: [{ type: 'text', text: textOutput }],
            isError: false,
            structuredData: { query, resultsCount: docs.length, results: docs },
          },
          trace: {
            id: traceId,
            timestamp: new Date().toISOString(),
            userQuery: userQuery || `Search documentation for "${query}"`,
            toolName,
            arguments: { query },
            dataSource: 'Curated Documentation Store',
            status: 'success',
            durationMs,
            summary: `Matched ${docs.length} articles for query "${query}".`,
            sourceReferences,
          },
        }
      }

      case 'get_repository_health_summary': {
        const { tasks } = await connector.getTasks()
        const { pullRequests } = await connector.getPullRequests()
        const { alerts } = await connector.getAlerts()
        const { commits } = await connector.getRecentCommits(1)

        const openBugs = tasks.filter((t) => t.status !== 'Done')
        const criticalBugs = openBugs.filter((t) => t.priority === 'Critical')
        const failingPRs = pullRequests.filter((pr) => pr.checks.tests === 'Failing')
        const unresolvedAlerts = alerts.filter((a) => !a.resolved)
        const criticalAlerts = unresolvedAlerts.filter((a) => a.severity === 'Critical')

        const healthStatus =
          criticalAlerts.length > 0 || failingPRs.length > 0 ? 'Needs Attention' : 'Healthy'
        const score = Math.max(50, 100 - criticalAlerts.length * 15 - failingPRs.length * 10 - openBugs.length * 2)

        const summaryText =
          `Repository Health Summary for ${connector.getRepo()}:\n` +
          `• Health Status: ${healthStatus} (${score}/100)\n` +
          `• Open Issues / Tasks: ${openBugs.length} (${criticalBugs.length} critical)\n` +
          `• Pull Requests: ${pullRequests.length} (${failingPRs.length} with failing checks)\n` +
          `• Active Telemetry Alerts: ${unresolvedAlerts.length} (${criticalAlerts.length} critical)\n` +
          `• Latest Commit: ${commits[0]?.shortSha || 'unknown'} ("${commits[0]?.message || 'N/A'}")\n` +
          (failingPRs.length > 0 ? `• Immediate Blocker: PR #${failingPRs[0].id} has failing unit tests.\n` : '')

        const sourceReferences: SourceReference[] = [
          ...failingPRs.map((pr) => ({
            title: `PR #${pr.id} Failing: ${pr.title}`,
            url: pr.url,
            identifier: `#${pr.id}`,
          })),
          ...criticalAlerts.map((alt) => ({
            title: `Alert ${alt.id}: ${alt.title}`,
            identifier: alt.id,
            detail: alt.detail,
          })),
        ]

        const durationMs = Date.now() - startTime
        return {
          result: {
            content: [{ type: 'text', text: summaryText }],
            isError: false,
            structuredData: {
              healthStatus,
              score,
              openBugsCount: openBugs.length,
              failingPRCount: failingPRs.length,
              alertsCount: unresolvedAlerts.length,
            },
          },
          trace: {
            id: traceId,
            timestamp: new Date().toISOString(),
            userQuery: userQuery || 'Get repository health summary',
            toolName,
            arguments: {},
            dataSource,
            status: 'success',
            durationMs,
            summary: `Repository health computed as "${healthStatus}" (${score}/100).`,
            sourceReferences,
          },
        }
      }

      case 'recommend_next_action': {
        const focusArea = typeof rawArgs.focusArea === 'string' ? rawArgs.focusArea : 'all'
        const { pullRequests } = await connector.getPullRequests()
        const { alerts } = await connector.getAlerts()
        const { tasks } = await connector.getTasks()

        const recommendations: string[] = []
        const sourceReferences: SourceReference[] = []

        // 1. Check failing checks
        const failingPR = pullRequests.find((pr) => pr.checks.tests === 'Failing')
        if (failingPR && (focusArea === 'all' || focusArea === 'checks')) {
          recommendations.push(
            `1. Fix failing unit tests in PR #${failingPR.id} ("${failingPR.title}"). Blocker: ${failingPR.failureReason || 'test suite failure'}.`
          )
          sourceReferences.push({
            title: `PR #${failingPR.id}`,
            url: failingPR.url,
            detail: failingPR.failureReason,
          })
        }

        // 2. Check critical alerts
        const critAlert = alerts.find((a) => a.severity === 'Critical' && !a.resolved)
        if (critAlert && (focusArea === 'all' || focusArea === 'alerts')) {
          recommendations.push(
            `2. Triage Critical Alert [${critAlert.id}] "${critAlert.title}" in service "${critAlert.service}".`
          )
          sourceReferences.push({
            title: `Alert ${critAlert.id}: ${critAlert.title}`,
            detail: critAlert.detail,
          })
        }

        // 3. Check critical bugs
        const critBug = tasks.find((t) => t.priority === 'Critical' && t.status !== 'Done')
        if (critBug && (focusArea === 'all' || focusArea === 'bugs')) {
          recommendations.push(
            `3. Address Critical Bug [${critBug.id}] "${critBug.title}" (assigned to ${critBug.assignee}).`
          )
          sourceReferences.push({
            title: `Issue ${critBug.id}: ${critBug.title}`,
            url: critBug.url,
            detail: critBug.description,
          })
        }

        if (recommendations.length === 0) {
          recommendations.push('All critical alerts and checks are passing! Next step: review open pull requests.')
        }

        const textOutput =
          `Recommended Next Actions (Read-Only):\n` + recommendations.join('\n')

        const durationMs = Date.now() - startTime
        return {
          result: {
            content: [{ type: 'text', text: textOutput }],
            isError: false,
            structuredData: { recommendations, focusArea },
          },
          trace: {
            id: traceId,
            timestamp: new Date().toISOString(),
            userQuery: userQuery || 'Recommend next action',
            toolName,
            arguments: { focusArea },
            dataSource,
            status: 'success',
            durationMs,
            summary: `Generated ${recommendations.length} action recommendations.`,
            sourceReferences,
          },
        }
      }

      default:
        throw new Error(`Tool "${toolName}" is not registered on this MCP server.`)
    }
  } catch (error) {
    const durationMs = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown tool execution error.'
    return {
      result: {
        content: [{ type: 'text', text: `Error executing tool "${toolName}": ${errorMessage}` }],
        isError: true,
      },
      trace: {
        id: traceId,
        timestamp: new Date().toISOString(),
        userQuery: userQuery || `Execute ${toolName}`,
        toolName,
        arguments: rawArgs,
        dataSource,
        status: 'error',
        durationMs,
        summary: `Execution failed: ${errorMessage}`,
        sourceReferences: [],
      },
    }
  }
}
