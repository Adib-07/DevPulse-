'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  ExternalLink,
  GitBranch,
  GitPullRequest,
  Headphones,
  LayoutDashboard,
  Menu,
  Mic,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import type { ExecutionTrace, SourceReference } from '@/lib/mcp/types'

export type Task = {
  id: string
  title: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'In Progress' | 'In Review' | 'To Do'
  assignee: string
  label: string
}

export type Alert = {
  id?: string
  title: string
  detail: string
  severity: 'Critical' | 'Warning' | 'Info'
  time: string
  service: string
  resolved?: boolean
}

export type Message = {
  role: 'user' | 'assistant' | 'processing'
  text: string
  time: string
  trace?: ExecutionTrace
}

const initialTasks: Task[] = [
  { id: 'BUG-101', title: 'Login fails for valid users', priority: 'Critical', status: 'To Do', assignee: 'Alex', label: 'backend' },
  { id: 'BUG-102', title: 'Dashboard API returns error', priority: 'High', status: 'In Progress', assignee: 'Alex', label: 'api' },
  { id: 'DEV-241', title: 'Fix authentication timeout', priority: 'Critical', status: 'In Progress', assignee: 'Jordan', label: 'backend' },
  { id: 'DEV-238', title: 'Investigate API response latency', priority: 'High', status: 'In Review', assignee: 'Alex', label: 'performance' },
  { id: 'DEV-235', title: 'Resolve failing unit tests', priority: 'High', status: 'To Do', assignee: 'Jordan', label: 'testing' },
  { id: 'BUG-103', title: 'Password reset email not delivered', priority: 'Medium', status: 'To Do', assignee: 'Alex', label: 'auth' },
]

const initialAlerts: Alert[] = [
  { id: 'ALT-302', title: 'Unit tests are failing in PR 202', detail: '3 unit tests failed: test_auth_retry, test_query_filter, test_cache_ttl.', severity: 'Critical', time: '2m ago', service: 'ci / build' },
  { id: 'ALT-301', title: 'Database CPU usage is above 80 percent', detail: 'Database CPU sustained at 82% across primary read replicas.', severity: 'Warning', time: '12m ago', service: 'database' },
  { id: 'ALT-303', title: 'API response latency above threshold', detail: 'p95 latency crossed 800ms for 12 minutes.', severity: 'Warning', time: '18m ago', service: 'api-gateway' },
]

const initialTrace: ExecutionTrace = {
  id: 'tr-init-001',
  timestamp: new Date().toISOString(),
  userQuery: 'What are my two highest-priority open bugs?',
  toolName: 'get_my_high_priority_bugs',
  arguments: { assignee: 'Alex', limit: 2 },
  dataSource: 'Demo Fixture (tasks.json)',
  status: 'success',
  durationMs: 14,
  summary: 'Retrieved and ranked 2 open bugs for Alex using explicit severity weights (Critical > High).',
  sourceReferences: [
    {
      title: 'BUG-101: Login fails for valid users',
      identifier: 'BUG-101',
      url: 'https://github.com/Adib-07/DevPulse-/issues/101',
      detail: 'Priority: Critical | Status: Open | Assignee: Alex',
    },
    {
      title: 'BUG-102: Dashboard API returns error',
      identifier: 'BUG-102',
      url: 'https://github.com/Adib-07/DevPulse-/issues/102',
      detail: 'Priority: High | Status: In Progress | Assignee: Alex',
    },
  ],
}

const navItems = [
  ['Overview', LayoutDashboard],
  ['Sprint Tasks', CheckCircle2],
  ['Repository Health', GitBranch],
  ['Pull Requests', GitPullRequest],
  ['System Alerts', AlertTriangle],
  ['Tool Activity', Code2],
] as const

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
}

export function DevPulseDashboard() {
  const [tasks, setTasks] = useState(initialTasks)
  const [alerts, setAlerts] = useState(initialAlerts)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'user',
      text: 'What are my two highest-priority open bugs?',
      time: '09:41 AM',
    },
    {
      role: 'assistant',
      text: 'Found 2 high-priority bugs assigned to Alex (ranked by explicit severity rule: Critical > High > Medium > Low):\n1. [BUG-101] "Login fails for valid users" — Priority: Critical (Open)\n2. [BUG-102] "Dashboard API returns error" — Priority: High (In Progress)',
      time: '09:41 AM',
      trace: initialTrace,
    },
  ])
  const [latestTrace, setLatestTrace] = useState<ExecutionTrace | null>(initialTrace)
  const [traces, setTraces] = useState<ExecutionTrace[]>([initialTrace])
  const [selectedTraceForJson, setSelectedTraceForJson] = useState<ExecutionTrace | null>(null)

  const [input, setInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [voiceError, setVoiceError] = useState('')
  const [muted, setMuted] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const mountedRef = useRef(true)

  const [activeNav, setActiveNav] = useState('Overview')
  const [taskFilter, setTaskFilter] = useState('All')
  const [taskStatusFilter, setTaskStatusFilter] = useState('All')
  const [taskSearch, setTaskSearch] = useState('')
  const [alertFilter, setAlertFilter] = useState('All')
  const [pullRequestFilter, setPullRequestFilter] = useState('All')
  const [showAllTasks, setShowAllTasks] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)
  const [mobileNav, setMobileNav] = useState(false)

  // Settings Modal State
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [dataMode, setDataMode] = useState<'demo_fixture' | 'github_api'>('demo_fixture')
  const [mcpPingStatus, setMcpPingStatus] = useState<string>('Online (/api/mcp ready)')

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchPriority = taskFilter === 'All' || task.priority === taskFilter
      const matchStatus = taskStatusFilter === 'All' || task.status === taskStatusFilter
      const matchSearch =
        !taskSearch ||
        `${task.id} ${task.title} ${task.label} ${task.assignee}`
          .toLowerCase()
          .includes(taskSearch.toLowerCase())
      return matchPriority && matchStatus && matchSearch
    })
  }, [tasks, taskFilter, taskStatusFilter, taskSearch])

  const filteredAlerts = alerts.filter((alert) => {
    if (alertFilter === 'All') return true
    if (alertFilter === 'Resolved') return alert.resolved
    return alert.severity === alertFilter && !alert.resolved
  })

  const criticalCount = alerts.filter((alert) => alert.severity === 'Critical' && !alert.resolved).length

  function speak(text: string) {
    if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300))
      utterance.lang = 'en-US'
      utterance.onstart = () => {
        if (mountedRef.current) setSpeaking(true)
      }
      utterance.onend = () => {
        if (mountedRef.current) setSpeaking(false)
      }
      utterance.onerror = () => {
        if (mountedRef.current) setSpeaking(false)
      }
      window.speechSynthesis.speak(utterance)
    } catch {
      if (mountedRef.current) setSpeaking(false)
    }
  }

  async function testMcpPing() {
    setMcpPingStatus('Testing JSON-RPC ping…')
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' }),
      })
      const data = await res.json()
      if (data.result !== undefined) {
        setMcpPingStatus('Ping Success: 200 OK (JSON-RPC 2.0 valid)')
      } else {
        setMcpPingStatus('Ping responded with error.')
      }
    } catch (err) {
      setMcpPingStatus(`Ping failed: ${err instanceof Error ? err.message : 'network error'}`)
    }
  }

  async function executeCommand(raw: string) {
    const command = raw.trim()
    if (!command || processing) return
    setInput('')
    setProcessing(true)
    setMessages((current) => [
      ...current,
      { role: 'user', text: command, time: now() },
      { role: 'processing', text: 'Executing MCP request pipeline…', time: now() },
    ])

    try {
      const result = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      })

      const payload = (await result.json()) as {
        action?: string
        filter?: string
        response?: string
        tool?: string
        trace?: ExecutionTrace
        sourceReferences?: SourceReference[]
        error?: string
      }

      if (!result.ok) {
        throw new Error(payload.error || 'Assistant request failed.')
      }

      // Handle UI navigation triggered by tool invocation
      switch (payload.action) {
        case 'overview':
          setActiveNav('Overview')
          break
        case 'tasks':
        case 'filter_tasks':
          setActiveNav('Sprint Tasks')
          if (payload.filter && ['All', 'Critical', 'High', 'Medium'].includes(payload.filter)) {
            setTaskFilter(payload.filter)
          }
          break
        case 'repository':
          setActiveNav('Repository Health')
          break
        case 'pull_requests':
          setActiveNav('Pull Requests')
          if (payload.filter) setPullRequestFilter(payload.filter)
          break
        case 'alerts':
          setActiveNav('System Alerts')
          break
        case 'activity':
          setActiveNav('Tool Activity')
          break
      }

      const response = payload.response || 'Operation executed successfully.'
      if (payload.trace) {
        setLatestTrace(payload.trace)
        setTraces((prev) => [payload.trace!, ...prev])
      }

      setMessages((current) => [
        ...current.filter((message) => message.role !== 'processing'),
        { role: 'assistant', text: response, time: now(), trace: payload.trace },
      ])
      setProcessing(false)
      speak(response)
    } catch (error) {
      const response =
        error instanceof Error ? error.message : 'The assistant could not process that request.'
      setMessages((current) => [
        ...current.filter((message) => message.role !== 'processing'),
        { role: 'assistant', text: response, time: now() },
      ])
      setProcessing(false)
      speak(response)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    const Recognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!Recognition) {
      setVoiceSupported(false)
      return () => {
        mountedRef.current = false
      }
    }

    try {
      const recognition = new Recognition()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.continuous = false

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim()
        setListening(false)
        if (transcript) {
          executeCommand(transcript)
        } else {
          setVoiceError('No speech detected. Try again.')
        }
      }

      recognition.onerror = (event) => {
        setListening(false)
        setVoiceError(
          event.error === 'not-allowed'
            ? 'Microphone permission was denied.'
            : `Voice input error: ${event.error}.`
        )
      }

      recognition.onend = () => {
        if (mountedRef.current) setListening(false)
      }

      recognitionRef.current = recognition
    } catch {
      setVoiceSupported(false)
    }

    return () => {
      mountedRef.current = false
      try {
        recognitionRef.current?.stop()
      } catch {
        // Safe ignore
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  function toggleListening() {
    if (!voiceSupported || !recognitionRef.current) return
    setVoiceError('')
    if (listening) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Safe ignore
      }
      setListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setListening(true)
      } catch {
        setVoiceError('Voice input is already active.')
      }
    }
  }

  function scrollTo(section: string) {
    setActiveNav(section)
    setMobileNav(false)
    const target = document.getElementById(section.toLowerCase().replaceAll(' ', '-'))
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f3f4f6] selection:bg-violet-500/30">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-white/[0.07] bg-[#0e1015] px-4 py-5 transition-transform lg:translate-x-0 ${
          mobileNav ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-3">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
            <Activity className="size-5" />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight">DevPulse MCP</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Alexa+ Track Hub
            </div>
          </div>
        </div>

        <div className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
          Navigation
        </div>
        <nav className="mt-3 flex flex-col gap-1" aria-label="Main navigation">
          {navItems.map(([label, Icon]) => (
            <button
              key={label}
              onClick={() => scrollTo(label)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${
                activeNav === label
                  ? 'bg-violet-500/12 text-violet-300 font-medium'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
              }`}
            >
              <Icon className="size-4" />
              {label}
              {label === 'System Alerts' && criticalCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] text-red-300 font-semibold">
                  {criticalCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Workspace Mode Badge */}
        <div className="mt-auto rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${dataMode === 'demo_fixture' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {dataMode === 'demo_fixture' ? 'Demo Fixture Mode' : 'GitHub Live Mode'}
            </span>
            <span className="font-mono text-[9px] text-zinc-500">MCP 2025-11-25</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
            {dataMode === 'demo_fixture'
              ? 'Using deterministic mock Jira & GitHub data (tasks.json & github.json).'
              : 'Connecting to live GitHub REST API for Adib-07/DevPulse-.'}
          </p>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
          aria-label="Workspace Settings"
        >
          <Settings2 className="size-4" /> Settings & Protocols
        </button>
      </aside>

      {mobileNav && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="lg:ml-[248px]">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-white/[0.07] bg-[#0b0c10]/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-zinc-500 hover:bg-white/[0.06] lg:hidden"
              onClick={() => setMobileNav(true)}
              aria-label="Open mobile menu"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold">{activeNav}</h1>
              <p className="text-[11px] text-zinc-500">
                Voice-driven developer operations via Model Context Protocol
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Adib-07/DevPulse-"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-zinc-400 transition hover:border-violet-500/40 hover:text-zinc-200 sm:flex"
            >
              <Code2 className="size-3.5 text-violet-400" /> Adib-07/DevPulse-
              <ExternalLink className="size-3 text-zinc-600" />
            </a>

            <div className="flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-2.5 py-1.5 text-[10px] font-medium text-violet-300">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Streamable HTTP MCP
            </div>

            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-lg border border-white/[0.08] p-2 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
              aria-label="Settings"
            >
              <Settings2 className="size-4" />
            </button>

            <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold">
              AL
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1420px] space-y-6 p-5 sm:p-8">
          {/* Welcome and Reset Bar */}
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-300">
                <Sparkles className="size-3.5 text-violet-400" /> DevPulse MCP · Amazon Alexa+ Track
              </p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Good morning, Alex.
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Ask a voice command to retrieve developer context or inspect MCP tool execution traces.
              </p>
            </div>
            <button
              onClick={() => {
                setTasks(initialTasks)
                setAlerts(initialAlerts)
                setTaskFilter('All')
                setAlertFilter('All')
                setTaskSearch('')
                setPullRequestFilter('All')
                setLatestTrace(initialTrace)
              }}
              className="flex items-center gap-2 self-start rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-200 sm:self-auto"
              aria-label="Reset workspace"
            >
              <RefreshCw className="size-3.5" /> Reset workspace
            </button>
          </section>

          {/* Metric Statistics Cards */}
          <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Metric statistics">
            <Metric
              icon={CheckCircle2}
              label="Assigned tasks"
              value={tasks.length}
              detail="2 high-priority"
              tone="violet"
              onClick={() => scrollTo('Sprint Tasks')}
            />
            <Metric
              icon={AlertCircle}
              label="Highest-priority bugs"
              value={tasks.filter((t) => t.priority === 'Critical' || t.priority === 'High').length}
              detail="1 critical, 2 high"
              tone="red"
              onClick={() => {
                setTaskFilter('High')
                scrollTo('Sprint Tasks')
              }}
            />
            <Metric
              icon={GitPullRequest}
              label="Open pull requests"
              value="3"
              detail="PR #202 checks failing"
              tone="blue"
              onClick={() => scrollTo('Pull Requests')}
            />
            <Metric
              icon={Bell}
              label="Active system alerts"
              value={criticalCount}
              detail={criticalCount ? '1 critical alert' : 'All clear'}
              tone="amber"
              onClick={() => scrollTo('System Alerts')}
            />
          </section>

          {/* Primary Demonstration & Command Surface (Split Grid: Assistant + Execution Trace) */}
          <section id="overview" className="grid gap-6 xl:grid-cols-2">
            {/* Left: Alexa Voice Assistant Simulator */}
            <div className="overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-br from-[#171424] via-[#12121c] to-[#101116] shadow-2xl shadow-violet-950/10">
              <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-4">
                <div className="flex gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                    <Headphones className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">DevPulse Voice Assistant</h3>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      Simulated Alexa+ Natural Language Interface
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md border px-2 py-1 text-[10px] ${
                      listening
                        ? 'border-red-400/30 bg-red-400/10 text-red-300'
                        : speaking
                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                        : processing
                        ? 'border-violet-400/30 bg-violet-400/10 text-violet-300'
                        : voiceSupported
                        ? 'border-violet-400/15 bg-violet-400/10 text-violet-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {listening
                      ? 'Listening…'
                      : speaking
                      ? 'Speaking…'
                      : processing
                      ? 'Processing MCP…'
                      : voiceSupported
                      ? 'Voice ready'
                      : 'Voice unavailable'}
                  </span>
                  <button
                    onClick={() => setMuted(!muted)}
                    className="rounded-md p-1.5 text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
                    aria-label={muted ? 'Unmute responses' : 'Mute responses'}
                  >
                    {muted ? 'Unmute' : 'Mute'}
                  </button>
                  <button
                    onClick={() => setMessages([])}
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
                    aria-label="Clear voice log"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Message Transcript */}
              <div className="max-h-[300px] min-h-[240px] space-y-4 overflow-y-auto p-5">
                {messages.length === 0 ? (
                  <div className="grid h-full place-items-center py-12 text-center text-xs text-zinc-500">
                    No voice commands yet.
                    <br />
                    Click an example below or ask: "What are my two highest-priority open bugs?"
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={`${message.time}-${index}`}
                      className={`flex gap-3 ${message.role === 'user' ? '' : 'pl-4'}`}
                    >
                      <div
                        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                          message.role === 'user'
                            ? 'bg-zinc-800 text-zinc-400'
                            : message.role === 'processing'
                            ? 'bg-violet-500/15 text-violet-300'
                            : 'bg-emerald-500/15 text-emerald-300'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <UserRound className="size-3" />
                        ) : message.role === 'processing' ? (
                          <Bot className="size-3 animate-pulse" />
                        ) : (
                          <Check className="size-3" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
                          <span>{message.role === 'user' ? 'Developer' : 'DevPulse Assistant'}</span>
                          <span>·</span>
                          <span>{message.time}</span>
                        </div>
                        <p
                          className={`whitespace-pre-line text-[13px] leading-relaxed ${
                            message.role === 'processing' ? 'text-violet-300' : 'text-zinc-300'
                          }`}
                        >
                          {message.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-white/[0.07] p-4">
                <div className="mb-2 flex items-center justify-between px-1">
                  <label htmlFor="command" className="text-[11px] font-medium text-zinc-400">
                    Simulate Alexa Voice Command or Enter Query
                  </label>
                  <span className="text-[10px] text-zinc-500">Enter to send · Protocol: MCP</span>
                </div>
                <div className="flex items-end gap-2 rounded-xl border border-white/[0.1] bg-black/20 p-2 focus-within:border-violet-400/40">
                  <textarea
                    id="command"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault()
                        executeCommand(input)
                      }
                    }}
                    placeholder="Ask DevPulse: 'What are my two highest-priority open bugs?', 'Which PRs need attention?'…"
                    className="min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
                    rows={1}
                  />
                  <button
                    onClick={toggleListening}
                    disabled={!voiceSupported || processing}
                    aria-label={listening ? 'Stop listening' : 'Start voice input'}
                    className={`grid size-9 place-items-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      listening
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'border border-white/[0.08] text-zinc-400 hover:bg-white/[0.06] hover:text-violet-300'
                    }`}
                  >
                    <Mic className="size-4" />
                  </button>
                  <button
                    onClick={() => executeCommand(input)}
                    disabled={processing || !input.trim()}
                    aria-label="Send command"
                    className="grid size-9 place-items-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send className="size-4" />
                  </button>
                </div>

                {/* Quick Demonstration Chips */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    'What are my two highest-priority open bugs?',
                    'Which pull requests need my attention?',
                    'Summarize recent changes in this repository',
                    'Check repository health',
                    'What should I investigate next?',
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => executeCommand(example)}
                      className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] text-zinc-400 transition hover:border-violet-400/40 hover:bg-violet-500/[0.06] hover:text-violet-200"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Visible MCP Execution Trace (Phase 5 Requirement) */}
            <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#101116] shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                    <Terminal className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Visible MCP Execution Trace</h3>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Transparent tool resolution & data provenance
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] text-violet-300">
                    MCP 2025-11-25
                  </span>
                  {latestTrace && (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                      <Zap className="size-3" /> {latestTrace.durationMs}ms
                    </span>
                  )}
                </div>
              </div>

              {latestTrace ? (
                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                        User Request
                      </div>
                      <div className="mt-1 font-mono text-xs text-zinc-200 bg-white/[0.03] p-2 rounded-lg border border-white/[0.05]">
                        "{latestTrace.userQuery}"
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                          Selected MCP Tool
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 font-mono text-xs text-violet-300 bg-violet-500/10 p-2 rounded-lg border border-violet-500/20">
                          <Code2 className="size-3.5" /> {latestTrace.toolName}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                          Data Source Queried
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-300 bg-white/[0.03] p-2 rounded-lg border border-white/[0.05]">
                          {latestTrace.dataSource}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                        Validated Tool Arguments
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-emerald-300 bg-black/40 p-2 rounded-lg border border-white/[0.05] overflow-x-auto">
                        {JSON.stringify(latestTrace.arguments, null, 2)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                        Execution Summary
                      </div>
                      <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                        {latestTrace.summary}
                      </p>
                    </div>

                    {latestTrace.sourceReferences.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                          Source References & Links
                        </div>
                        <div className="mt-1 space-y-1.5">
                          {latestTrace.sourceReferences.map((ref, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-300 hover:border-violet-500/30"
                            >
                              <div className="truncate pr-2">
                                <span className="font-semibold text-violet-300 mr-2">
                                  {ref.identifier || `Ref ${idx + 1}`}
                                </span>
                                <span>{ref.title}</span>
                              </div>
                              {ref.url && (
                                <a
                                  href={ref.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-violet-400 hover:text-violet-200 shrink-0 flex items-center gap-1 text-[11px]"
                                >
                                  View <ExternalLink className="size-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.07] pt-3 text-xs">
                    <button
                      onClick={() => setSelectedTraceForJson(latestTrace)}
                      className="flex items-center gap-1.5 text-violet-300 hover:text-violet-200 text-xs font-medium"
                    >
                      <Terminal className="size-3.5" /> Inspect Raw JSON-RPC Response
                    </button>
                    <span className="text-[11px] text-zinc-500">
                      ID: {latestTrace.id}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid flex-1 place-items-center p-8 text-center text-xs text-zinc-500">
                  Execute any command to inspect its MCP tool selection, arguments, and provenance trace.
                </div>
              )}
            </div>
          </section>

          {/* Section: Sprint Tasks / Issues */}
          <section id="sprint-tasks" className="rounded-2xl border border-white/[0.07] bg-[#101116]">
            <div className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">Active Developer Tasks & Issues</h3>
                  <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-400">
                    Jira / GitHub Telemetry
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {filteredTasks.length} task(s) matching current filter · Ranking deterministic by severity
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] px-2.5 py-1.5">
                  <Search className="size-3.5 text-zinc-500" />
                  <input
                    aria-label="Search tasks"
                    value={taskSearch}
                    onChange={(event) => setTaskSearch(event.target.value)}
                    placeholder="Search tasks…"
                    className="w-28 bg-transparent text-xs outline-none placeholder:text-zinc-600"
                  />
                </div>
                <select
                  value={taskFilter}
                  onChange={(event) => setTaskFilter(event.target.value)}
                  className="rounded-lg border border-white/[0.07] bg-[#101116] px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
                  aria-label="Filter tasks by priority"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
                <button
                  onClick={() => setShowAllTasks(!showAllTasks)}
                  className="hidden items-center gap-1 text-xs text-violet-300 hover:text-violet-200 sm:flex"
                >
                  {showAllTasks ? 'Collapse' : 'View all'} <ArrowUpRight className="size-3" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {filteredTasks.slice(0, showAllTasks ? undefined : 6).map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/[0.02]">
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      task.priority === 'Critical'
                        ? 'bg-red-400 shadow-sm shadow-red-500/50'
                        : task.priority === 'High'
                        ? 'bg-amber-400'
                        : 'bg-blue-400'
                    }`}
                  />
                  <span className="w-16 shrink-0 font-mono text-[11px] text-zinc-400">{task.id}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-zinc-300 font-medium">
                    {task.title}
                  </span>
                  <span className="hidden rounded-md bg-white/[0.05] px-2 py-1 text-[10px] text-zinc-400 md:block">
                    {task.label}
                  </span>
                  <span
                    className={`hidden rounded-md px-2 py-1 text-[10px] sm:block ${
                      task.status === 'In Progress'
                        ? 'bg-violet-400/10 text-violet-300'
                        : task.status === 'In Review'
                        ? 'bg-blue-400/10 text-blue-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {task.status}
                  </span>
                  <span className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-[9px] font-medium text-zinc-200">
                    {task.assignee}
                  </span>
                  <a
                    href={`https://github.com/Adib-07/DevPulse-/issues/${task.id.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-500 hover:text-violet-300"
                    aria-label={`Open issue ${task.id}`}
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Repository Health & System Alerts */}
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Repository Health */}
            <div id="repository-health" className="rounded-2xl border border-white/[0.07] bg-[#101116]">
              <PanelHeader
                icon={GitBranch}
                title="Repository Health"
                subtitle="Adib-07/DevPulse- · Git Telemetry"
                action={
                  <a
                    href="https://github.com/Adib-07/DevPulse-"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
                    aria-label="View on GitHub"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                }
              />
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-300">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">Healthy</span>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300 font-medium">
                        92 / 100
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-400">1 unit test blocker on PR #202</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-y-4 border-y border-white/[0.06] py-4">
                  <RepoStat label="Default branch" value="main" />
                  <RepoStat label="Latest commit" value="4e827ed" />
                  <RepoStat label="Open issues" value="6" />
                  <RepoStat label="CI checks" value="12 / 15 passed (PR #202 failing)" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span className="size-1.5 rounded-full bg-amber-400" /> Blocker: PR #202 has 3 failing unit tests
                  </div>
                  <button
                    onClick={() => executeCommand('What should I investigate next?')}
                    className="flex items-center gap-1 text-[11px] text-violet-300 hover:text-violet-200 font-medium"
                  >
                    Triage with MCP <ArrowUpRight className="size-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Pull Requests */}
            <PullRequests filter={pullRequestFilter} onFilterChange={setPullRequestFilter} />
          </section>

          {/* Section: Live System Alerts */}
          <section id="system-alerts" className="rounded-2xl border border-white/[0.07] bg-[#101116]">
            <PanelHeader
              icon={Bell}
              title="Live System Alerts"
              subtitle="Ops Sentinel · Real-time Telemetry"
              action={
                <select
                  value={alertFilter}
                  onChange={(event) => setAlertFilter(event.target.value)}
                  className="rounded-lg border border-white/[0.07] bg-[#101116] px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
                  aria-label="Filter alerts"
                >
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical Only</option>
                  <option value="Warning">Warning Only</option>
                  <option value="Resolved">Resolved</option>
                </select>
              }
            />
            <div className="divide-y divide-white/[0.05]">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.title}
                  onClick={() => setSelectedAlert(alert.title)}
                  className={`flex cursor-pointer gap-3 px-5 py-4 transition ${
                    selectedAlert === alert.title ? 'bg-violet-500/[0.06]' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div
                    className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${
                      alert.severity === 'Critical'
                        ? 'bg-red-500/10 text-red-300'
                        : alert.severity === 'Warning'
                        ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-blue-500/10 text-blue-300'
                    }`}
                  >
                    {alert.severity === 'Critical' ? (
                      <AlertCircle className="size-3.5" />
                    ) : alert.severity === 'Warning' ? (
                      <AlertTriangle className="size-3.5" />
                    ) : (
                      <Bell className="size-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`text-xs font-medium ${
                            alert.resolved ? 'line-through text-zinc-500' : 'text-zinc-200'
                          }`}
                        >
                          {alert.title}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{alert.detail}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-zinc-500">{alert.time}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-400">
                      <span className="rounded bg-white/[0.05] px-1.5 py-0.5">{alert.service}</span>
                      {!alert.resolved && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setAlerts((current) =>
                              current.map((item) =>
                                item.title === alert.title ? { ...item, resolved: true } : item
                              )
                            )
                          }}
                          className="ml-auto text-zinc-400 hover:text-emerald-300 font-medium"
                        >
                          Resolve Alert
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/[0.07] px-5 py-3 flex justify-between items-center text-xs">
              <button
                onClick={() => setAlerts((current) => current.filter((alert) => !alert.resolved))}
                className="text-zinc-400 hover:text-zinc-200"
              >
                Clear resolved alerts
              </button>
              <button
                onClick={() => setAlerts(initialAlerts)}
                className="text-violet-300 hover:text-violet-200"
              >
                Restore sample alerts
              </button>
            </div>
          </section>

          {/* Section: Tool Activity & MCP Audit Log */}
          <section id="tool-activity" className="rounded-2xl border border-white/[0.07] bg-[#101116]">
            <PanelHeader
              icon={Code2}
              title="MCP Tool Activity & Audit Log"
              subtitle="Chronological trace of Model Context Protocol tool invocations"
              action={
                <span className="font-mono text-[11px] text-violet-300">
                  {traces.length} execution(s) logged
                </span>
              }
            />
            <div className="divide-y divide-white/[0.05]">
              {traces.map((trace) => (
                <div key={trace.id} className="p-5 transition hover:bg-white/[0.02]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-violet-300">
                        {trace.toolName}
                      </span>
                      <span className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                        {trace.dataSource}
                      </span>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                        ⚡ {trace.durationMs}ms
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(trace.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                    {trace.summary}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="font-mono text-[11px] text-zinc-500">
                      Query: "{trace.userQuery}"
                    </div>
                    <button
                      onClick={() => setSelectedTraceForJson(trace)}
                      className="text-violet-400 hover:text-violet-200 text-xs font-medium"
                    >
                      View Arguments & Trace JSON
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Activity Footer */}
          <footer className="flex flex-col sm:flex-row items-center justify-between border-t border-white/[0.07] py-6 gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Activity className="size-3.5 text-violet-400" />
              <span>DevPulse MCP Assistant · Built for Amazon Developer Hackathon (Alexa+ Track)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono">
              <span>Target Protocol: MCP 2025-11-25</span>
              <span>Next.js 16.4.2</span>
              <span>Gemini 2.5 Flash / Deterministic Fallback</span>
            </div>
          </footer>
        </div>
      </main>

      {/* Floating Voice Microphone Action Button */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 sm:bottom-7 sm:right-7">
        {(listening || processing || speaking || voiceError) && (
          <div
            role="status"
            className="max-w-[260px] rounded-lg border border-white/[0.1] bg-[#171424]/95 px-3 py-2 text-right text-[11px] text-zinc-200 shadow-xl backdrop-blur"
          >
            {voiceError ||
              (listening
                ? 'Listening to microphone…'
                : processing
                ? 'Executing MCP tool pipeline…'
                : 'Speaking response…')}
          </div>
        )}
        <button
          onClick={toggleListening}
          disabled={!voiceSupported || processing}
          aria-label={listening ? 'Stop listening' : voiceSupported ? 'Click to speak' : 'Voice input unavailable'}
          title={voiceSupported ? 'Click to speak' : 'Voice input unavailable'}
          className={`group relative grid size-14 place-items-center rounded-full border shadow-2xl transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${
            listening
              ? 'border-red-300/50 bg-red-500 text-white shadow-red-500/30'
              : 'border-violet-300/30 bg-violet-600 text-white shadow-violet-600/30'
          }`}
        >
          {listening && (
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400/30 motion-reduce:hidden" />
          )}
          <Mic className="relative size-5" />
        </button>
      </div>

      {/* Modal: Raw JSON-RPC Payload Inspector */}
      {selectedTraceForJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.1] bg-[#101116] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-violet-400" />
                <h3 className="text-sm font-semibold">
                  MCP Protocol Trace — {selectedTraceForJson.toolName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTraceForJson(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <pre className="font-mono text-xs text-emerald-300 bg-black/60 p-4 rounded-xl border border-white/[0.06] overflow-x-auto">
                {JSON.stringify(selectedTraceForJson, null, 2)}
              </pre>
            </div>
            <div className="border-t border-white/[0.08] px-5 py-3 flex justify-end">
              <button
                onClick={() => setSelectedTraceForJson(null)}
                className="rounded-lg bg-white/[0.08] px-4 py-2 text-xs font-medium text-white hover:bg-white/[0.12]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Settings & Protocols */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.1] bg-[#101116] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div className="flex items-center gap-2">
                <Settings2 className="size-4 text-violet-400" />
                <h3 className="text-sm font-semibold">DevPulse MCP Workspace Settings</h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto text-xs">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Data Connection Mode
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDataMode('demo_fixture')}
                    className={`rounded-xl border p-3 text-left transition ${
                      dataMode === 'demo_fixture'
                        ? 'border-violet-500 bg-violet-500/10 text-white'
                        : 'border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="font-semibold text-xs">Demo Fixture Mode</div>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      Standardized reproducible datasets (tasks.json & github.json).
                    </p>
                  </button>
                  <button
                    onClick={() => setDataMode('github_api')}
                    className={`rounded-xl border p-3 text-left transition ${
                      dataMode === 'github_api'
                        ? 'border-violet-500 bg-violet-500/10 text-white'
                        : 'border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="font-semibold text-xs">Live GitHub API</div>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      Live public queries to Adib-07/DevPulse-.
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  MCP Server Endpoint
                </label>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <div>
                    <div className="font-mono text-xs text-violet-300">/api/mcp</div>
                    <div className="mt-0.5 text-[11px] text-zinc-500">
                      Protocol: MCP 2025-11-25 · Streamable HTTP & SSE
                    </div>
                    <div className="mt-1 text-[11px] text-emerald-400 font-mono">
                      {mcpPingStatus}
                    </div>
                  </div>
                  <button
                    onClick={testMcpPing}
                    className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs text-white hover:bg-violet-500"
                  >
                    Test Ping
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  AI Intent Router
                </label>
                <div className="mt-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-zinc-200">
                      Deterministic MCP Router + Gemini 2.5 Flash
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                    Deterministic pattern classifier guarantees zero downtime for core developer queries.
                    If GEMINI_API_KEY is configured on the server, Gemini is used to refine ambiguous inputs.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/[0.08] px-5 py-3 flex justify-end">
              <button
                onClick={() => setSettingsOpen(false)}
                className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-500"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
  tone,
  onClick,
}: {
  icon: typeof Activity
  label: string
  value: number | string
  detail: string
  tone: string
  onClick: () => void
}) {
  const toneClasses: Record<string, string> = {
    violet: 'bg-violet-500/10 text-violet-300',
    red: 'bg-red-500/10 text-red-300',
    blue: 'bg-blue-500/10 text-blue-300',
    amber: 'bg-amber-500/10 text-amber-300',
  }
  const toneClass = toneClasses[tone] || 'bg-violet-500/10 text-violet-300'

  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-white/[0.07] bg-[#101116] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/[0.14]"
    >
      <div className="flex items-start justify-between">
        <span className={`grid size-8 place-items-center rounded-lg ${toneClass}`}>
          <Icon className="size-4" />
        </span>
        <ArrowUpRight className="size-3.5 text-zinc-500 transition group-hover:text-zinc-300" />
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-[11px] text-zinc-400">{label}</div>
      <div className="mt-2 text-[10px] text-zinc-500">{detail}</div>
    </button>
  )
}

function PanelHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: typeof Activity
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="grid size-8 place-items-center rounded-lg bg-white/[0.05] text-zinc-400">
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-[11px] text-zinc-400">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

function RepoStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 font-mono text-xs text-zinc-300">{value}</div>
    </div>
  )
}

function PullRequests({
  filter,
  onFilterChange,
}: {
  filter: string
  onFilterChange: (val: string) => void
}) {
  const prs = [
    {
      id: 201,
      title: 'Fix login authentication bug',
      author: 'Alex',
      status: 'Approved',
      checks: 'Tests passing',
      tone: 'emerald',
    },
    {
      id: 202,
      title: 'Optimize dashboard API',
      author: 'Alex',
      status: 'Changes requested',
      checks: '3 unit tests failed',
      tone: 'red',
    },
    {
      id: 184,
      title: 'Add response cache layer',
      author: 'Morgan',
      status: 'Review requested',
      checks: 'Tests passing',
      tone: 'amber',
    },
  ]

  const visible =
    filter === 'All'
      ? prs
      : prs.filter(
          (pr) =>
            pr.status.toLowerCase().includes(filter.toLowerCase()) ||
            pr.checks.toLowerCase().includes(filter.toLowerCase())
        )

  return (
    <div id="pull-requests" className="rounded-2xl border border-white/[0.07] bg-[#101116]">
      <PanelHeader
        icon={GitPullRequest}
        title="Open Pull Requests"
        subtitle={`${visible.length} pull request(s) shown · GitHub Telemetry`}
        action={
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="rounded-lg border border-white/[0.07] bg-[#101116] px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
            aria-label="Filter pull requests"
          >
            <option value="All">All PRs</option>
            <option value="Review requested">Review requested</option>
            <option value="Changes requested">Changes requested</option>
            <option value="failed">Failing checks</option>
          </select>
        }
      />
      <div className="divide-y divide-white/[0.05]">
        {visible.map((pr) => (
          <div key={pr.id} className="flex items-center gap-3 px-5 py-4 transition hover:bg-white/[0.02]">
            <div className="grid size-7 place-items-center rounded-lg bg-white/[0.04] text-zinc-400">
              <GitPullRequest className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex gap-2 items-center">
                <span className="font-mono text-[10px] text-zinc-500">#{pr.id}</span>
                <p className="truncate text-xs text-zinc-300 font-medium">{pr.title}</p>
              </div>
              <p className="mt-1 text-[10px] text-zinc-400">
                Author: {pr.author} · Review: {pr.status} ·{' '}
                <span className={pr.tone === 'red' ? 'text-red-400 font-medium' : 'text-zinc-400'}>
                  {pr.checks}
                </span>
              </p>
            </div>
            <a
              href={`https://github.com/Adib-07/DevPulse-/pull/${pr.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-violet-300"
              aria-label={`View pull request #${pr.id}`}
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="px-5 py-6 text-xs text-zinc-500">No pull requests match this filter.</p>
      )}
    </div>
  )
}
