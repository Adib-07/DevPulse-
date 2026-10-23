import {
  FIXTURE_ALERTS,
  FIXTURE_COMMITS,
  FIXTURE_DOCS,
  FIXTURE_PULL_REQUESTS,
  FIXTURE_TASKS,
} from './fixtures.ts'
import type {
  DeveloperAlert,
  DeveloperPullRequest,
  DeveloperTask,
  DocumentationDoc,
  RepositoryCommit,
} from './types.ts'

export type DataConnectorMode = 'demo_fixture' | 'github_api'

export interface ConnectorOptions {
  mode?: DataConnectorMode
  repo?: string
  githubToken?: string
}

const DEFAULT_REPO = 'Adib-07/DevPulse-'

export class DeveloperDataConnector {
  private mode: DataConnectorMode
  private repo: string
  private githubToken?: string

  constructor(options: ConnectorOptions = {}) {
    this.mode = options.mode || (process.env.GITHUB_TOKEN ? 'github_api' : 'demo_fixture')
    this.repo = options.repo || process.env.GITHUB_REPOSITORY || DEFAULT_REPO
    this.githubToken = options.githubToken || process.env.GITHUB_TOKEN
  }

  getMode(): DataConnectorMode {
    return this.mode
  }

  getRepo(): string {
    return this.repo
  }

  getDataSourceLabel(): string {
    return this.mode === 'github_api'
      ? `Live GitHub API (${this.repo})`
      : 'Demo Fixture (tasks.json & github.json)'
  }

  /**
   * Retrieve developer tasks / issues
   */
  async getTasks(filters?: {
    status?: string
    assignee?: string
    priority?: string
    label?: string
  }): Promise<{ tasks: DeveloperTask[]; source: string }> {
    if (this.mode === 'github_api') {
      try {
        const liveTasks = await this.fetchGitHubIssues(filters)
        return { tasks: liveTasks, source: `Live GitHub API (${this.repo})` }
      } catch {
        // Fallback to fixture if GitHub API fails
        return {
          tasks: this.filterFixtureTasks(filters),
          source: 'Demo Fixture (GitHub API fallback)',
        }
      }
    }

    return {
      tasks: this.filterFixtureTasks(filters),
      source: 'Demo Fixture (tasks.json)',
    }
  }

  private filterFixtureTasks(filters?: {
    status?: string
    assignee?: string
    priority?: string
    label?: string
  }): DeveloperTask[] {
    let result = [...FIXTURE_TASKS]

    if (filters?.status && filters.status !== 'all') {
      const targetStatus = filters.status.toLowerCase()
      result = result.filter((task) => {
        if (targetStatus === 'open') return task.status !== 'Done'
        if (targetStatus === 'closed') return task.status === 'Done'
        return task.status.toLowerCase() === targetStatus
      })
    }

    if (filters?.assignee && filters.assignee !== 'all') {
      const targetAssignee = filters.assignee.toLowerCase()
      result = result.filter((task) => task.assignee.toLowerCase() === targetAssignee)
    }

    if (filters?.priority && filters.priority !== 'all') {
      const targetPriority = filters.priority.toLowerCase()
      result = result.filter((task) => task.priority.toLowerCase() === targetPriority)
    }

    if (filters?.label && filters.label !== 'all') {
      const targetLabel = filters.label.toLowerCase()
      result = result.filter((task) => task.label.toLowerCase() === targetLabel)
    }

    return result
  }

  /**
   * Retrieve pull requests
   */
  async getPullRequests(filter?: {
    reason?: 'all' | 'review_requested' | 'changes_requested' | 'checks_failing'
  }): Promise<{ pullRequests: DeveloperPullRequest[]; source: string }> {
    if (this.mode === 'github_api') {
      try {
        const livePRs = await this.fetchGitHubPullRequests()
        return {
          pullRequests: this.filterPullRequests(livePRs, filter?.reason),
          source: `Live GitHub API (${this.repo})`,
        }
      } catch {
        return {
          pullRequests: this.filterPullRequests(FIXTURE_PULL_REQUESTS, filter?.reason),
          source: 'Demo Fixture (GitHub API fallback)',
        }
      }
    }

    return {
      pullRequests: this.filterPullRequests(FIXTURE_PULL_REQUESTS, filter?.reason),
      source: 'Demo Fixture (github.json)',
    }
  }

  private filterPullRequests(
    prs: DeveloperPullRequest[],
    reason?: 'all' | 'review_requested' | 'changes_requested' | 'checks_failing'
  ): DeveloperPullRequest[] {
    if (!reason || reason === 'all') return prs
    switch (reason) {
      case 'review_requested':
        return prs.filter((pr) => pr.reviewStatus === 'Review requested')
      case 'changes_requested':
        return prs.filter((pr) => pr.reviewStatus === 'Changes requested')
      case 'checks_failing':
        return prs.filter((pr) => pr.checks.tests === 'Failing' || pr.checks.build === 'Failing')
      default:
        return prs
    }
  }

  /**
   * Retrieve system alerts
   */
  async getAlerts(severity?: string): Promise<{ alerts: DeveloperAlert[]; source: string }> {
    let alerts = [...FIXTURE_ALERTS]
    if (severity && severity !== 'all') {
      alerts = alerts.filter((alert) => alert.severity.toLowerCase() === severity.toLowerCase())
    }
    return { alerts, source: 'Demo Fixture (alerts.json)' }
  }

  /**
   * Retrieve recent commits
   */
  async getRecentCommits(limit = 5): Promise<{ commits: RepositoryCommit[]; source: string }> {
    return {
      commits: FIXTURE_COMMITS.slice(0, limit),
      source: `Repository Log (${this.repo})`,
    }
  }

  /**
   * Search technical documentation
   */
  async searchDocumentation(query: string): Promise<DocumentationDoc[]> {
    const q = query.toLowerCase().trim()
    if (!q) return []
    const tokens = q.split(/\s+/).filter((t) => t.length > 2)

    return FIXTURE_DOCS.filter((doc) => {
      const content = `${doc.title} ${doc.category} ${doc.snippet}`.toLowerCase()
      return tokens.some((token) => content.includes(token)) || content.includes(q)
    })
  }

  /**
   * Live GitHub Issues Fetcher (Read-Only)
   */
  private async fetchGitHubIssues(filters?: {
    status?: string
    assignee?: string
  }): Promise<DeveloperTask[]> {
    const [owner, repoName] = this.repo.split('/')
    if (!owner || !repoName) throw new Error('Invalid repository identifier')

    const url = new URL(`https://api.github.com/repos/${owner}/${repoName}/issues`)
    url.searchParams.set('state', filters?.status === 'closed' ? 'closed' : 'open')
    url.searchParams.set('per_page', '10')

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'DevPulse-MCP-Assistant/1.0',
    }
    if (this.githubToken) {
      headers.Authorization = `token ${this.githubToken}`
    }

    const response = await fetch(url.toString(), {
      headers,
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const rawIssues = (await response.json()) as Array<{
      number: number
      title: string
      state: string
      user: { login: string } | null
      assignee: { login: string } | null
      labels: Array<{ name: string }>
      body: string | null
      html_url: string
      pull_request?: unknown
    }>

    // Exclude pull requests (GitHub issues endpoint returns both)
    const pureIssues = rawIssues.filter((item) => !item.pull_request)

    return pureIssues.map((issue) => {
      // Inferred priority based on labels or title
      let priority: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium'
      const labelNames = (issue.labels || []).map((l) => l.name.toLowerCase()).join(' ')
      if (labelNames.includes('critical') || labelNames.includes('p0') || issue.title.toLowerCase().includes('critical')) {
        priority = 'Critical'
      } else if (labelNames.includes('high') || labelNames.includes('p1') || labelNames.includes('bug')) {
        priority = 'High'
      } else if (labelNames.includes('low') || labelNames.includes('p3')) {
        priority = 'Low'
      }

      return {
        id: `#${issue.number}`,
        title: issue.title,
        priority,
        status: issue.state === 'closed' ? 'Done' : 'Open',
        assignee: issue.assignee?.login || 'Unassigned',
        description: issue.body ? issue.body.slice(0, 200) : 'No description provided.',
        label: issue.labels[0]?.name || 'issue',
        url: issue.html_url,
      }
    })
  }

  /**
   * Live GitHub Pull Requests Fetcher (Read-Only)
   */
  private async fetchGitHubPullRequests(): Promise<DeveloperPullRequest[]> {
    const [owner, repoName] = this.repo.split('/')
    if (!owner || !repoName) throw new Error('Invalid repository identifier')

    const url = new URL(`https://api.github.com/repos/${owner}/${repoName}/pulls`)
    url.searchParams.set('state', 'open')
    url.searchParams.set('per_page', '10')

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'DevPulse-MCP-Assistant/1.0',
    }
    if (this.githubToken) {
      headers.Authorization = `token ${this.githubToken}`
    }

    const response = await fetch(url.toString(), {
      headers,
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const rawPRs = (await response.json()) as Array<{
      number: number
      title: string
      state: string
      user: { login: string } | null
      draft: boolean
      html_url: string
    }>

    return rawPRs.map((pr) => ({
      id: pr.number,
      title: pr.title,
      author: pr.user?.login || 'unknown',
      status: pr.state === 'open' ? 'Open' : 'Closed',
      reviewStatus: pr.draft ? 'Draft' : 'Review requested',
      checks: { tests: 'Passing', build: 'Passing' },
      url: pr.html_url,
    }))
  }
}
