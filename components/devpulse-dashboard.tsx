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
  GitPullRequest,
  GitBranch,
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
  UserRound,
  X,
} from 'lucide-react'

export type Task = {
  id: string
  title: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'In Progress' | 'In Review' | 'To Do'
  assignee: string
  label: string
}

export type Alert = {
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
}

const initialTasks: Task[] = [
  { id: 'DEV-241', title: 'Fix authentication timeout', priority: 'Critical', status: 'In Progress', assignee: 'JD', label: 'backend' },
  { id: 'DEV-238', title: 'Investigate API response latency', priority: 'High', status: 'In Review', assignee: 'AK', label: 'performance' },
  { id: 'DEV-235', title: 'Resolve failing unit tests', priority: 'High', status: 'To Do', assignee: 'JD', label: 'testing' },
  { id: 'DEV-229', title: 'Review caching changes', priority: 'Medium', status: 'In Progress', assignee: 'MS', label: 'review' },
]

const initialAlerts: Alert[] = [
  { title: 'API response latency above threshold', detail: 'p95 latency has crossed 800ms for 12 minutes.', severity: 'Critical', time: '2m ago', service: 'api-gateway' },
  { title: 'Unit tests failing in demo build', detail: '3 tests are failing on the latest commit.', severity: 'Warning', time: '18m ago', service: 'ci / build' },
  { title: 'Pull request awaiting review', detail: 'A caching change is ready for your review.', severity: 'Info', time: '42m ago', service: 'github' },
]

const navItems = [
  ['Overview', LayoutDashboard],
  ['Sprint Tasks', CheckCircle2],
  ['Repository Health', GitBranch],
  ['Pull Requests', GitPullRequest],
  ['System Alerts', AlertTriangle],
  ['Activity Log', Activity],
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
    { role: 'user', text: 'Alexa, what are the top two high-priority bugs assigned to me?', time: '09:41 AM' },
    { role: 'assistant', text: 'I found 2 high-priority items assigned to you. DEV-241 is critical and currently in progress; DEV-235 is ready to start.', time: '09:41 AM' },
  ])
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

  const filteredTasks = useMemo(() => tasks.filter((task) => (
    (taskFilter === 'All' || task.priority === taskFilter) &&
    (taskStatusFilter === 'All' || task.status === taskStatusFilter) &&
    (!taskSearch || `${task.id} ${task.title} ${task.label}`.toLowerCase().includes(taskSearch.toLowerCase()))
  )), [tasks, taskFilter, taskStatusFilter, taskSearch])

  const filteredAlerts = alerts.filter((alert) => (
    alertFilter === 'All' ||
    alert.severity === alertFilter ||
    (alertFilter === 'Resolved' && alert.resolved)
  ))

  const criticalCount = alerts.filter((alert) => alert.severity === 'Critical' && !alert.resolved).length

  function speak(text: string) {
    if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
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

  async function executeCommand(raw: string) {
    const command = raw.trim()
    if (!command || processing) return
    setInput('')
    setProcessing(true)
    setMessages((current) => [
      ...current,
      { role: 'user', text: command, time: now() },
      { role: 'processing', text: 'Interpreting workspace command…', time: now() },
    ])

    try {
      const result = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          workspace: {
            tasks,
            alerts,
            activeNav,
            taskFilter,
            taskStatusFilter,
            taskSearch,
            alertFilter,
            pullRequestFilter,
            selectedAlert,
          },
        }),
      })

      const payload = (await result.json()) as {
        action?: string
        filter?: string
        query?: string
        response?: string
        error?: string
      }

      if (!result.ok) {
        throw new Error(payload.error || 'Assistant request failed.')
      }

      switch (payload.action) {
        case 'overview':
          setActiveNav('Overview')
          setTaskFilter('All')
          setTaskStatusFilter('All')
          setTaskSearch('')
          setAlertFilter('All')
          break
        case 'tasks':
        case 'filter_tasks':
          setActiveNav('Sprint Tasks')
          if (payload.filter && ['All', 'Critical', 'High', 'Medium'].includes(payload.filter)) {
            setTaskFilter(payload.filter)
          }
          if (payload.filter === 'In Progress') {
            setTaskStatusFilter(payload.filter)
          }
          break
        case 'search_tasks':
          setActiveNav('Sprint Tasks')
          setTaskSearch(payload.query || '')
          break
        case 'repository':
          setActiveNav('Repository Health')
          break
        case 'pull_requests':
        case 'filter_pull_requests':
          setActiveNav('Pull Requests')
          if (payload.filter) {
            setPullRequestFilter(payload.filter)
          }
          break
        case 'alerts':
        case 'filter_alerts':
          setActiveNav('System Alerts')
          if (payload.filter && ['All', 'Critical', 'Warning', 'Info', 'Resolved'].includes(payload.filter)) {
            setAlertFilter(payload.filter)
          }
          break
        case 'resolve_alert':
          if (selectedAlert) {
            setAlerts((current) =>
              current.map((alert) => (alert.title === selectedAlert ? { ...alert, resolved: true } : alert))
            )
          }
          break
        case 'clear_filters':
          setTaskFilter('All')
          setTaskStatusFilter('All')
          setTaskSearch('')
          setAlertFilter('All')
          setPullRequestFilter('All')
          break
      }

      const response = payload.response || 'Action processed.'
      setMessages((current) => [
        ...current.filter((message) => message.role !== 'processing'),
        { role: 'assistant', text: response, time: now() },
      ])
      setProcessing(false)
      speak(response)
    } catch (error) {
      const response = error instanceof Error ? error.message : 'The assistant could not process that request.'
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
    const Recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
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
        setVoiceError(event.error === 'not-allowed' ? 'Microphone permission was denied.' : `Voice input error: ${event.error}.`)
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

  useEffect(() => {
    if (activeNav === 'Overview') return
    const target = document.getElementById(activeNav.toLowerCase().replaceAll(' ', '-'))
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activeNav])

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f3f4f6] selection:bg-violet-500/30">
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
            <div className="text-[15px] font-semibold tracking-tight">DevPulse</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Command center</div>
          </div>
        </div>
        <div className="mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Workspace</div>
        <nav className="mt-3 flex flex-col gap-1" aria-label="Main navigation">
          {navItems.map(([label, Icon]) => (
            <button
              key={label}
              onClick={() => scrollTo(label)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${
                activeNav === label ? 'bg-violet-500/12 text-violet-300 font-medium' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
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
        <div className="mt-auto rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="size-2 rounded-full bg-amber-400" /> Demo workspace
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
            Local sample data is active. Connect Python MCP services or Gemini AI to unlock live telemetry.
          </p>
        </div>
        <button
          className="mt-4 flex items-center gap-3 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-200"
          aria-label="Workspace Settings"
        >
          <Settings2 className="size-4" /> Settings
        </button>
      </aside>
      {mobileNav && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}

      <main className="lg:ml-[248px]">
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
              <p className="text-[11px] text-zinc-500">Developer operations at a glance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-zinc-400 sm:flex">
              <Code2 className="size-3.5 text-violet-400" /> devpulse-mcp
              <ChevronDown className="size-3 text-zinc-600" />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-400/15 bg-amber-400/[0.06] px-2.5 py-1.5 text-[10px] font-medium text-amber-300">
              <span className="size-1.5 rounded-full bg-amber-400" /> Demo mode
            </div>
            <button
              className="relative rounded-lg p-2 text-zinc-500 hover:bg-white/[0.06]"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-violet-400" />
            </button>
            <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 text-xs font-semibold">
              JD
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1420px] space-y-5 p-5 sm:p-8">
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs text-violet-300">
                <Sparkles className="size-3.5" /> DevPulse Command Surface
              </p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Good morning, Jordan.</h2>
              <p className="mt-1 text-sm text-zinc-500">Here’s what needs your engineering attention today.</p>
            </div>
            <button
              onClick={() => {
                setTasks(initialTasks)
                setAlerts(initialAlerts)
                setTaskFilter('All')
                setAlertFilter('All')
                setTaskSearch('')
              }}
              className="flex items-center gap-2 self-start rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.05] sm:self-auto"
              aria-label="Refresh workspace"
            >
              <RefreshCw className="size-3.5" /> Reset workspace
            </button>
          </section>

          <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Metric statistics">
            <Metric
              icon={CheckCircle2}
              label="Open sprint tasks"
              value={tasks.length}
              detail="2 due this week"
              tone="violet"
              onClick={() => scrollTo('Sprint Tasks')}
            />
            <Metric
              icon={AlertCircle}
              label="High-priority bugs"
              value={tasks.filter((task) => task.priority === 'High' || task.priority === 'Critical').length}
              detail="1 critical"
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
              detail="1 needs your review"
              tone="blue"
              onClick={() => scrollTo('Pull Requests')}
            />
            <Metric
              icon={Bell}
              label="Critical alerts"
              value={criticalCount}
              detail={criticalCount ? 'Needs attention' : 'All clear'}
              tone="amber"
              onClick={() => scrollTo('System Alerts')}
            />
          </section>

          <section id="overview" className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-br from-[#171424] via-[#12121c] to-[#101116] shadow-2xl shadow-violet-950/10">
              <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-4">
                <div className="flex gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                    <Headphones className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">DevPulse Voice Log</h3>
                    <p className="mt-0.5 text-xs text-zinc-500">Your commands and assistant responses</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md border px-2 py-1 text-[10px] ${
                      listening
                        ? 'border-red-400/30 bg-red-400/10 text-red-300'
                        : speaking
                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                        : 'border-violet-400/15 bg-violet-400/10 text-violet-300'
                    }`}
                  >
                    {listening ? 'Listening…' : speaking ? 'Speaking…' : processing ? 'Processing…' : voiceSupported ? 'Voice ready' : 'Voice unavailable'}
                  </span>
                  <button
                    onClick={() => setMuted(!muted)}
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 text-xs"
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
              <div className="max-h-[282px] min-h-[230px] space-y-4 overflow-y-auto p-5">
                {messages.length === 0 ? (
                  <div className="grid h-full place-items-center py-12 text-center text-xs text-zinc-500">
                    No commands yet.
                    <br />
                    Ask DevPulse anything about your sprint tasks, pull requests, or alerts.
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={`${message.time}-${index}`}
                      className={`flex gap-3 ${message.role === 'user' ? '' : 'pl-5'}`}
                    >
                      <div
                        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                          message.role === 'user'
                            ? 'bg-zinc-800 text-zinc-400'
                            : message.role === 'processing'
                            ? 'bg-violet-500/15 text-violet-300'
                            : 'bg-emerald-500/12 text-emerald-300'
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
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
                          <span>{message.role === 'user' ? 'You' : 'DevPulse'}</span>
                          <span>·</span>
                          <span>{message.time}</span>
                        </div>
                        <p
                          className={`text-[13px] leading-relaxed ${
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
              <div className="border-t border-white/[0.07] p-4">
                <div className="mb-2 flex items-center justify-between px-1">
                  <label htmlFor="command" className="text-[11px] font-medium text-zinc-400">
                    Simulate Alexa Voice Command
                  </label>
                  <span className="text-[10px] text-zinc-500">Enter to send</span>
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
                    placeholder="Ask DevPulse: 'Show critical tasks', 'Filter alerts', 'Check repository health'…"
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
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Show my active sprint tasks', 'Check repository health', 'Show critical alerts'].map((example) => (
                    <button
                      key={example}
                      onClick={() => executeCommand(example)}
                      className="rounded-md border border-white/[0.07] px-2 py-1 text-[10px] text-zinc-400 hover:border-violet-400/30 hover:text-violet-300"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <RepositoryCard onOpen={() => scrollTo('Repository Health')} />
          </section>

          <section id="sprint-tasks" className="rounded-2xl border border-white/[0.07] bg-[#101116]">
            <div className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">Active sprint tasks</h3>
                  <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-400">SPRINT 24</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">{filteredTasks.length} tasks in progress · Jira telemetry</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] px-2.5 py-1.5">
                  <Search className="size-3.5 text-zinc-500" />
                  <input
                    aria-label="Search tasks"
                    value={taskSearch}
                    onChange={(event) => setTaskSearch(event.target.value)}
                    placeholder="Search tasks"
                    className="w-24 bg-transparent text-xs outline-none placeholder:text-zinc-600"
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
              {filteredTasks.slice(0, showAllTasks ? undefined : 4).map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/[0.02]">
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${
                      task.priority === 'Critical' ? 'bg-red-400' : task.priority === 'High' ? 'bg-amber-400' : 'bg-blue-400'
                    }`}
                  />
                  <span className="w-16 shrink-0 font-mono text-[11px] text-zinc-400">{task.id}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-zinc-300">{task.title}</span>
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
                  <span className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 text-[9px] font-medium text-zinc-200">
                    {task.assignee}
                  </span>
                  <button className="text-zinc-600 hover:text-zinc-300" aria-label={`Task options for ${task.id}`}>
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Unified 2-column grid for Alerts and Pull Requests (No duplicates) */}
          <section className="grid gap-5 lg:grid-cols-2">
            <div id="system-alerts" className="rounded-2xl border border-white/[0.07] bg-[#101116]">
              <PanelHeader
                icon={Bell}
                title="Live system alerts"
                subtitle="Ops Sentinel · Telemetry events"
                action={
                  <select
                    value={alertFilter}
                    onChange={(event) => setAlertFilter(event.target.value)}
                    className="rounded-lg border border-white/[0.07] bg-[#101116] px-2 py-1.5 text-[11px] text-zinc-300 outline-none"
                    aria-label="Filter alerts"
                  >
                    <option value="All">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="Warning">Warning</option>
                    <option value="Info">Info</option>
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
                          <p className={`text-xs font-medium ${alert.resolved ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
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
                                current.map((item) => (item.title === alert.title ? { ...item, resolved: true } : item))
                              )
                            }}
                            className="ml-auto text-zinc-400 hover:text-emerald-300 font-medium"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.07] px-5 py-3">
                <button
                  onClick={() => setAlerts((current) => current.filter((alert) => !alert.resolved))}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200"
                >
                  Clear resolved alerts
                </button>
              </div>
            </div>

            <PullRequests filter={pullRequestFilter} />
          </section>

          <section id="activity-log" className="flex items-center justify-between border-t border-white/[0.07] py-5">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Activity className="size-3.5 text-violet-400" />
              <span>Last activity: DevPulse assistant processed sprint & telemetry queries</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>Model: Gemini 2.5 Flash · Protocol: MCP 2.0</span>
            </div>
          </section>
        </div>
      </main>

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 sm:bottom-7 sm:right-7">
        {(listening || processing || speaking || voiceError) && (
          <div
            role="status"
            className="max-w-[240px] rounded-lg border border-white/[0.1] bg-[#171424]/95 px-3 py-2 text-right text-[11px] text-zinc-200 shadow-xl backdrop-blur"
          >
            {voiceError || (listening ? 'Listening…' : processing ? 'Understanding command…' : 'Speaking…')}
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
          {listening && <span className="absolute inset-0 animate-ping rounded-full bg-red-400/30 motion-reduce:hidden" />}
          <Mic className="relative size-5" />
        </button>
      </div>
    </div>
  )
}

const metricToneStyles: Record<string, string> = {
  violet: 'bg-violet-500/10 text-violet-300',
  red: 'bg-red-500/10 text-red-300',
  blue: 'bg-blue-500/10 text-blue-300',
  amber: 'bg-amber-500/10 text-amber-300',
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
  const toneClass = metricToneStyles[tone] || 'bg-violet-500/10 text-violet-300'
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

function RepositoryCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div id="repository-health" className="rounded-2xl border border-white/[0.07] bg-[#101116]">
      <PanelHeader
        icon={GitBranch}
        title="Repository health"
        subtitle="devpulse-mcp · Git telemetry"
        action={
          <button
            onClick={onOpen}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
            aria-label="Refresh repository health"
          >
            <RefreshCw className="size-3.5" />
          </button>
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
                86 / 100
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">One CI check needs attention</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-y-4 border-y border-white/[0.06] py-4">
          <RepoStat label="Default branch" value="main" />
          <RepoStat label="Latest commit" value="4ee4bc9" />
          <RepoStat label="Open issues" value="8" />
          <RepoStat label="CI checks" value="11 / 12 passing" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="size-1.5 rounded-full bg-amber-400" /> Failing check: unit-tests
          </div>
          <button onClick={onOpen} className="flex items-center gap-1 text-[11px] text-violet-300 hover:text-violet-200">
            View details <ArrowUpRight className="size-3" />
          </button>
        </div>
      </div>
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

const prToneStyles: Record<string, string> = {
  amber: 'text-amber-300',
  emerald: 'text-emerald-300',
  red: 'text-red-300',
}

function PullRequests({ filter }: { filter: string }) {
  const prs = [
    { id: '#184', title: 'Add response cache layer', status: 'Review requested', tone: 'amber' },
    { id: '#181', title: 'Improve auth retry handling', status: 'Approved', tone: 'emerald' },
    { id: '#179', title: 'Update CI matrix', status: 'Checks failing', tone: 'red' },
  ]
  const visible = filter === 'All' ? prs : prs.filter((pr) => pr.status === filter)

  return (
    <div id="pull-requests" className="rounded-2xl border border-white/[0.07] bg-[#101116]">
      <PanelHeader
        icon={GitPullRequest}
        title="Pull requests"
        subtitle={`${visible.length} shown · GitHub telemetry`}
        action={<span className="text-[11px] text-zinc-400">{filter}</span>}
      />
      <div className="divide-y divide-white/[0.05]">
        {visible.map((pr) => (
          <div key={pr.id} className="flex items-center gap-3 px-5 py-4 transition hover:bg-white/[0.02]">
            <div className="grid size-7 place-items-center rounded-lg bg-white/[0.04] text-zinc-400">
              <GitPullRequest className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex gap-2">
                <span className="font-mono text-[10px] text-zinc-500">{pr.id}</span>
                <p className="truncate text-xs text-zinc-300">{pr.title}</p>
              </div>
              <p className={`mt-1 text-[10px] ${prToneStyles[pr.tone] || 'text-zinc-400'}`}>{pr.status}</p>
            </div>
            <Clock3 className="size-3.5 text-zinc-600" />
          </div>
        ))}
      </div>
      {visible.length === 0 && <p className="px-5 py-6 text-xs text-zinc-500">No pull requests match this filter.</p>}
    </div>
  )
}
