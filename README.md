# DevPulse MCP

<div align="center">

**The Voice-Driven Developer Dashboard & Model Context Protocol (MCP) Server**  
*Built for the Amazon Developer Hackathon — Alexa+ Track*

[![CI Status](https://github.com/Adib-07/DevPulse-/actions/workflows/ci.yml/badge.svg)](https://github.com/Adib-07/DevPulse-/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/Tests-39%20Passed-10B981?style=flat&logo=node.js&logoColor=white)](https://github.com/Adib-07/DevPulse-)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-8E75B2?style=flat&logo=google-gemini&logoColor=white)](https://aistudio.google.com/)
[![Protocol](https://img.shields.io/badge/Protocol-MCP%202025--11--25-8B5CF6?style=flat)](https://modelcontextprotocol.io/)
[![Transport](https://img.shields.io/badge/Transport-Streamable%20HTTP%20%26%20SSE-3B82F6?style=flat)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11.17-F69220?style=flat&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel%20Live-000000?style=flat&logo=vercel&logoColor=white)](https://dev-pulse-wine-eta.vercel.app/)

[Overview](#product-overview) • [Primary Demonstration](#primary-demonstration-walkthrough) • [Visual Showcase](#visual-product-showcase) • [Architecture](#system-architecture) • [MCP Protocol & Tools](#mcp-protocol-server--tools) • [Quickstart](#installation--local-development) • [Verification & Testing](#testing--quality-assurance)

</div>

---

## Hero Presentation

DevPulse is an engineering-grade developer operations command center and **Model Context Protocol (MCP)** server designed for the **Amazon Developer Hackathon’s Alexa+ track**.

Instead of navigating fragmented browser tabs across Jira backlogs, GitHub pull requests, and infrastructure monitoring dashboards, DevPulse provides:
1. An **Alexa-style conversational voice and text assistant** that understands developer intent.
2. A compliant **Streamable HTTP MCP Server (`/api/mcp`)** implementing the official **MCP 2025-11-25** specification with JSON-RPC 2.0 and Server-Sent Events (SSE).
3. A **Visible MCP Execution Trace** that displays the selected tool, validated arguments, data provenance, duration, and direct links to original issue and PR records.
4. An offline-resilient **Deterministic Intent Router** paired with optional Google Gemini 2.5 Flash semantic classification.

![DevPulse Dashboard Overview](docs/images/devpulse-dashboard.png)
*Figure 1: DevPulse Command Center running on the Obsidian Pulse dark design system, displaying active sprint tickets, system alerts, repository health, and visible MCP execution traces.*

---

## Product Overview

### The Problem
Modern software engineers lose up to **23 minutes refocusing** every time they are interrupted by dashboard fragmentation. Traditional web dashboards require manual navigation across multiple services, while standard voice assistants lack structured access to a developer’s actual repository information.

### Core Value Proposition
> *"The developer’s workflow, accessible through natural conversation."*

### Request-to-Result Data Flow
```
USER REQUEST (Voice or Text Input)
    ↓
INTENT UNDERSTANDING (Deterministic Pattern Router + Optional Gemini 2.5)
    ↓
TOOL SELECTION (1 of 7 Registered Developer MCP Tools)
    ↓
MCP CLIENT REQUEST (JSON-RPC 2.0 / Streamable HTTP)
    ↓
MCP SERVER (`/api/mcp` or `server.py`)
    ↓
VALIDATED TOOL EXECUTION & DATA RETRIEVAL (Demo Fixture or Live GitHub REST API)
    ↓
STRUCTURED RESULT (Typed JSON Payload with Ranking & Links)
    ↓
HUMAN-READABLE ANSWER + SPOKEN SYNTHESIS
    ↓
VISIBLE EXECUTION TRACE (Tool, Arguments, Source, Duration, References)
```

---

## Primary Demonstration Walkthrough

### The Flagship Interaction
A developer asks:
> **"What are my two highest-priority open bugs?"**

1. **Intent Understanding:** DevPulse classifies the request into `get_my_high_priority_bugs` with arguments `{ "assignee": "Alex", "limit": 2 }`.
2. **MCP Invocation:** Dispatches a JSON-RPC 2.0 call to the MCP server.
3. **Data Retrieval:** Retrieves developer issue tickets from the active data source (`tasks.json` or live GitHub API).
4. **Deterministic Ranking Rule:** Ranks tickets by explicit priority weight:  
   $$\text{Critical (1)} > \text{High (2)} > \text{Medium (3)} > \text{Low (4)}$$
5. **Human-Readable Answer:**
   ```
   Found 2 high-priority bug(s) assigned to Alex (ranked by explicit severity rule: Critical > High > Medium > Low):
   1. [BUG-101] "Login fails for valid users" — Priority: Critical (Open)
   2. [BUG-102] "Dashboard API returns error" — Priority: High (In Progress)

   Ranking rationale: Evaluated open tickets; ordered by severity weight.
   ```
6. **Visible Execution Trace:** Rendered in the UI with execution latency (⚡ 14ms), data source provenance, and direct clickable links to `#BUG-101` and `#BUG-102`.

### Other Target Interactions
* *"Which pull requests need my attention?"* → Invokes `list_pull_requests_needing_attention` to flag PR #202 (failing unit tests) and PR #184 (review requested).
* *"Summarize recent changes in this repository."* → Invokes `summarize_recent_activity` to inspect recent git commits and authors.
* *"Check repository health."* → Invokes `get_repository_health_summary` to compute health score (92/100) and identify failing CI checks.
* *"Find documentation relevant to this error."* → Invokes `search_technical_documentation` to search MCP and Next.js specifications.
* *"What should I investigate next?"* → Invokes `recommend_next_action` to prioritize unit test fixes and critical alert triage.

---

## Visual Product Showcase

### 1. Active Workspace & Visible Execution Trace
When commands are executed, DevPulse renders the conversational transcript, synthesized voice playback, and the live MCP Execution Trace showing tool arguments, latency, and source references.

![DevPulse Voice Feed Active](docs/images/devpulse-voice-feed.png)
*Figure 2: Active DevPulse session showing conversation history, live task prioritization (`DEV-241`), and incident triage feed.*

### 2. Mobile Responsive Layout
DevPulse is fully responsive, maintaining touch-target ergonomics, legible telemetry, and collapsible mobile sidebar navigation across viewports as small as 390px width.

<div align="center">
  <img src="docs/images/devpulse-mobile.png" alt="DevPulse Mobile Layout" width="380" />
  <p><em>Figure 3: DevPulse responsive layout running on mobile viewport (390px × 844px).</em></p>
</div>

---

## Tech Stack

| Layer | Technology | Version | Purpose in DevPulse |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `16.4.2` | Server rendering, streaming API routes, and client orchestration |
| **UI Library** | React | `19.2.4` | Component state tree, concurrent rendering, and reactive hooks |
| **Styling & Theme** | Tailwind CSS / Lucide React | `4.3.3` / `1.17.0` | Custom Obsidian pulse palette, glowing borders, and reactive states |
| **Protocol / Transport** | Model Context Protocol (MCP) | `2025-11-25` | Streamable HTTP endpoint (`/api/mcp`) with JSON-RPC 2.0 & SSE |
| **Python MCP Server** | Python MCP SDK v2 | `3.11+` / `mcp[cli]` | Standalone stdio MCP server (`server.py`) for Claude Desktop & Cursor |
| **AI Routing Engine** | Deterministic + Gemini 2.5 Flash | `@google/genai` `2.30.0` | Zero-downtime deterministic pattern routing with Gemini semantic fallback |
| **Package Manager** | pnpm | `11.17.0` | Deterministic lockfile dependency isolation |
| **Test Runner** | Node.js Native Test Runner | Node 20+ (`node:test`) | 39 automated tests across 7 test suites (155ms) |
| **Deployment** | Vercel | Production | Serverless Edge routing with Next.js build delegation ([`vercel.json`](vercel.json)) |

---

## MCP Protocol Server & Tools

DevPulse implements the official **Model Context Protocol (MCP) 2025-11-25** specification over **Streamable HTTP transport** at `/api/mcp` and via **stdio transport** in Python `server.py`.

### Supported Protocol Operations
* `initialize`: Negotiates protocol version (`2025-11-25` or `2024-11-05`), capabilities, and server info.
* `ping`: Liveness probe returning `{}`.
* `tools/list`: Returns schemas for all 7 registered developer tools.
* `tools/call`: Validates arguments against JSON Schema, executes the tool, and returns content with structured metadata and execution traces.
* `notifications/*`: Handles lifecycle notifications cleanly.
* `Accept: text/event-stream`: Server-Sent Events (SSE) streaming for real-time tool updates.

### The 7 Core Developer Tools

| # | Tool Name | Parameters | Purpose & Rationale |
| :---: | :--- | :--- | :--- |
| **A** | `list_repository_issues` | `status` (open/closed/all), `assignee`, `label`, `limit` | Retrieves and filters repository issue tickets with stable IDs and URLs. |
| **B** | `get_my_high_priority_bugs` | `assignee` (default 'Alex'), `limit` (default 2) | **Flagship demo tool**: Deterministically ranks open bugs: Critical > High > Medium > Low. |
| **C** | `list_pull_requests_needing_attention` | `reason` (all/review_requested/changes_requested/checks_failing) | Identifies PRs blocked by failing CI checks or waiting on code reviews. |
| **D** | `summarize_recent_activity` | `limit` (default 5) | Factual summary of recent commits with author attribution and short commit hashes. |
| **E** | `search_technical_documentation` | `query` *(required string)* | Searches supported documentation (MCP specification, Next.js, GitHub REST API). |
| **F** | `get_repository_health_summary` | *(none)* | Calculates overall repository health score (92/100) based on CI checks and alerts. |
| **G** | `recommend_next_action` | `focusArea` (all/bugs/checks/alerts) | Suggests top read-only engineering investigations with justifications. |

---

## Repository Structure

```
DevPulse-/
├── app/
│   ├── api/
│   │   ├── assistant/
│   │   │   └── route.ts         # Intent router & MCP client pipeline (deterministic + Gemini)
│   │   └── mcp/
│   │       └── route.ts         # Streamable HTTP MCP Server (MCP 2025-11-25 / JSON-RPC 2.0 / SSE)
│   ├── globals.css              # Tailwind CSS v4 variables & Obsidian dark theme
│   ├── layout.tsx               # Root Next.js layout, metadata, viewport, favicons
│   └── page.tsx                 # Entry point rendering DevPulseDashboard
├── components/
│   ├── ui/
│   │   └── button.tsx           # Accessible button primitive using @base-ui/react
│   └── devpulse-dashboard.tsx   # Interactive Obsidian command center with visible execution trace
├── docs/
│   └── images/                  # Standardized documentation image assets
├── lib/
│   ├── mcp/
│   │   ├── data-connector.ts    # Dual-mode connector: Demo Fixture vs Live GitHub REST API
│   │   ├── fixtures.ts          # Seeded developer datasets (tasks, PRs, alerts, commits, docs)
│   │   ├── tools.ts             # 7 Core Developer MCP Tools implementation & schema registry
│   │   └── types.ts             # Typed MCP protocol schemas, JSON-RPC types & traces
│   └── utils.ts                 # Classnames merge utility (cn) using clsx & twMerge
├── tests/
│   ├── api-assistant.test.ts    # Tests for /api/assistant intent classification and execution
│   ├── data-contracts.test.ts   # Schema validation for tasks.json, github.json, alerts.json
│   ├── developer-tools.test.ts  # Direct unit tests for all 7 MCP developer tools
│   ├── mcp-protocol.test.ts     # Protocol compliance: initialize, ping, tools/list, tools/call, SSE
│   ├── regression-engine.test.ts# Intent classification & wake word stripping tests
│   ├── security-validation.test.ts # Prompt injection defense and argument boundary tests
│   └── utils.test.ts            # Unit tests for Tailwind merge helper
├── alerts.json                  # Mock monitoring alerts & microservice health dataset
├── data_loader.py               # Python JSON reader & validation module
├── github.json                  # Mock pull request & CI status dataset
├── server.py                    # Official Python MCP server implementing all 7 developer tools
├── tasks.json                   # Mock developer sprint tasks dataset
├── vercel.json                  # Authoritative Vercel deployment configuration
└── package.json                 # Next.js 16.4.2, React 19.2, pnpm 11
```

---

## Installation & Local Development

### Prerequisites
* **Node.js:** `v20.0.0` or higher
* **pnpm:** `v9.0.0+` (verified on `pnpm@11.17+`)
* **Python:** `v3.11` or higher (for the Python MCP server)

---

### Part A: Running the Frontend & MCP HTTP Server

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Adib-07/DevPulse-.git
   cd DevPulse-
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables (Optional):**
   ```bash
   cp .env.example .env.local
   # GEMINI_API_KEY is optional. The deterministic router works 100% offline out of the box!
   ```

4. **Start the Next.js development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run the 39 automated tests:**
   ```bash
   pnpm test
   ```

6. **Validate TypeScript & production build:**
   ```bash
   pnpm typecheck
   pnpm build
   ```

---

### Part B: Running the Python MCP Server (stdio)

1. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install Python MCP dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server over stdio:**
   ```bash
   python server.py
   ```

4. **Test interactively with the MCP Inspector GUI:**
   ```bash
   mcp dev server.py
   ```

---

## Testing & Quality Assurance

DevPulse maintains a **100% automated test pass rate** with **zero TypeScript errors**:

```
▶ DevPulse Assistant & Intent Routing API (6 tests)
  ✔ GET returns online status, MCP endpoint metadata, and registered tools
  ✔ POST rejects non-JSON or invalid request bodies
  ✔ POST rejects empty or missing command string
  ✔ POST rejects commands exceeding maximum character length
  ✔ Primary Demonstration: executes "What are my two highest-priority open bugs?"
  ✔ Routes pull request attention queries to MCP tool
▶ Data Contracts & Integrity Tests (3 tests)
  ✔ tasks.json matches schema and has valid developer sprint items
  ✔ github.json matches schema and has valid repository telemetry
  ✔ alerts.json matches schema and contains active system alerts and service telemetry
▶ 7 Core Developer MCP Tools Execution (9 tests)
  ✔ Tool A: list_repository_issues retrieves and filters issues
  ✔ Tool B: get_my_high_priority_bugs applies deterministic severity ranking
  ✔ Tool B: handles unknown assignee honestly without fabricating data
  ✔ Tool C: list_pull_requests_needing_attention identifies blockers
  ✔ Tool D: summarize_recent_activity returns factual commit hashes
  ✔ Tool E: search_technical_documentation finds relevant specifications
  ✔ Tool F: get_repository_health_summary calculates transparent score
  ✔ Tool G: recommend_next_action generates read-only investigations
  ✔ All 7 tools are documented in MCP_TOOLS array with valid JSON schema
▶ Official MCP Protocol Server (/api/mcp) (10 tests)
  ✔ GET returns online status and registered MCP 2025-11-25 tools
  ✔ GET supports Streamable HTTP / Server-Sent Events (SSE)
  ✔ POST handles "initialize" lifecycle negotiation
  ✔ POST handles "ping" request
  ✔ POST handles "tools/list" discovery
  ✔ POST executes "tools/call" for get_my_high_priority_bugs
  ✔ POST rejects tool invocation with missing required arguments with -32602
  ✔ POST rejects unknown tool with -32601
  ✔ POST rejects malformed JSON with -32700 Parse error
  ✔ POST handles batch JSON-RPC requests
▶ Voice Command Engine Intent Classification (5 tests)
  ✔ correctly handles wake words and filters critical tasks
  ✔ handles shorthand developer commands without wake word
  ✔ correctly routes repository health inquiries
  ✔ correctly routes alert queries
  ✔ correctly routes reset and clear requests
▶ Application Security & Prompt Injection Defense Tests (4 tests)
  ✔ Prompt injection in user command does not override tool selection
  ✔ Tool arguments enforce strict boundaries (limit clamped to 10)
  ✔ Invalid tool names cannot access arbitrary system resources
  ✔ No sensitive environment tokens are leaked in trace payload
▶ Utility Functions (2 tests)
  ✔ cn merges classes and resolves tailwind conflicts
  ✔ cn handles complex conditional expressions

Pass: 39/39 tests across 7 suites (155ms)
```

| Verification Check | Command | Status | Result |
| :--- | :--- | :---: | :--- |
| **TypeScript Static Check** | `pnpm typecheck` | **PASSED** | 0 type errors across all routes and components |
| **Automated Test Suite** | `pnpm test` | **PASSED** | 39/39 tests passed across 7 test suites |
| **Next.js Production Build** | `pnpm build` | **PASSED** | Next.js 16.4.2 production bundle compiled in ~1.2s |
| **Python Syntax Check** | `python3 -m py_compile server.py data_loader.py` | **PASSED** | 0 syntax errors |
| **Data Loader Pipeline** | `python3 data_loader.py` | **PASSED** | Tasks, PRs, and alert streams loaded cleanly |

---

## Security Architecture

* **Least Privilege Tool Design:** All 7 developer tools are strictly read-only. Destructive operations (code changes, deletions) cannot be executed via MCP commands.
* **Prompt Injection Defense:** Commands are bounded to 500 characters, wrapped in system delimiters, and processed through deterministic pattern matchers that ignore jailbreak instructions (verified in [`tests/security-validation.test.ts`](tests/security-validation.test.ts)).
* **Credential Isolation:** No tokens, API keys, or private environment variables are returned in MCP tool outputs, execution traces, or client-side bundles.
* **Input Validation:** Tool arguments are validated against strict JSON Schemas; missing required arguments return standardized `-32602` error codes.

---

## Deployment & Verification

* **Live Frontend:** [https://dev-pulse-wine-eta.vercel.app/](https://dev-pulse-wine-eta.vercel.app/)
* **Live MCP Server:** [https://dev-pulse-wine-eta.vercel.app/api/mcp](https://dev-pulse-wine-eta.vercel.app/api/mcp)
* **Live Assistant Route:** [https://dev-pulse-wine-eta.vercel.app/api/assistant](https://dev-pulse-wine-eta.vercel.app/api/assistant)
* **Vercel Build Configuration:** Managed via [`vercel.json`](vercel.json) deploying Next.js directly from the repository root.

---

## License & Acknowledgments

* **Hackathon Evaluation Terms:** Submitted for the Amazon Developer Hackathon (Alexa+ Track).
* **Model Context Protocol:** Built using the open [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) specification.
* **Component Primitives:** Built on [Base UI](https://base-ui.com/) and [Lucide](https://lucide.dev/).
