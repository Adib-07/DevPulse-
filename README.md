# DevPulse MCP

<div align="center">

**The Voice-Driven Developer Dashboard & Model Context Protocol (MCP) Server**  
*Built for the Amazon Developer Hackathon — Alexa+ Track*

[![Tests](https://img.shields.io/badge/Tests-39%20Passed-10B981?style=flat&logo=node.js&logoColor=white)](https://github.com/Adib-07/DevPulse-)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Protocol](https://img.shields.io/badge/Protocol-MCP%202025--11--25-8B5CF6?style=flat)](https://modelcontextprotocol.io/)
[![Deployment](https://img.shields.io/badge/Live%20Demo-dev--pulse--wine--eta.vercel.app-000000?style=flat&logo=vercel&logoColor=white)](https://dev-pulse-wine-eta.vercel.app/)

[Live Demo](https://dev-pulse-wine-eta.vercel.app/) • [GitHub Repository](https://github.com/Adib-07/DevPulse-) • [System Architecture](#system-architecture) • [MCP Protocol & Tools](#mcp-protocol--tools) • [Quickstart Runbook](#quick-start) • [Verification & Tests](#testing-and-quality)

</div>

---

## Product Identity

* **Project Name:** DevPulse MCP
* **Tagline:** The developer's workflow, accessible through natural conversation.
* **Canonical Live Deployment:** [https://dev-pulse-wine-eta.vercel.app/](https://dev-pulse-wine-eta.vercel.app/)
* **Target Competition:** Amazon Developer Hackathon (Alexa+ Track).

---

## Problem Statement

Software engineers lose significant focus switching between code editors, issue trackers (Jira/Linear), pull requests (GitHub), and monitoring consoles (CloudWatch/Datadog):

1. **Dashboard Fragmentation:** Finding the two highest-priority open bugs or identifying why a pull request check failed requires navigating dense, disparate interfaces.
2. **Context Loss:** Traditional web dashboards demand repetitive manual filtering, while generic voice assistants lack structured access to a developer's real repository context.
3. **Black-Box AI Assistants:** Most AI chatbots produce untraceable text answers without citing underlying data sources, execution latency, or structured entity identifiers.

---

## Solution and Differentiators

DevPulse MCP unifies developer operations into an **Alexa-style conversational HUD** backed by an official **Model Context Protocol (MCP)** server:

* **Conversational HUD (Obsidian Dark Theme):** Web Speech recognition and synthesis allow developers to speak or type requests hands-free during standups or incident triage.
* **Streamable HTTP MCP Server (`/api/mcp`):** Implements the official **MCP 2025-11-25** specification over HTTP with JSON-RPC 2.0 and Server-Sent Events (SSE), making developer tools discoverable by compatible AI clients (Alexa+, Claude Desktop, Cursor).
* **Visible MCP Execution Trace:** Every query displays a transparent execution card showing:
  - User query asked
  - Selected MCP tool
  - Validated JSON arguments
  - Data source queried (Demo Fixture vs Live GitHub API)
  - Execution duration in milliseconds
  - Direct links to relevant issues and pull requests
* **Dual-Mode Data Connector:** Evaluators can run in **Demo Fixture Mode** (reproducible datasets from `tasks.json`, `github.json`, `alerts.json`) or **Live GitHub API Mode** (read-only queries to public repositories like `Adib-07/DevPulse-`).
* **Zero-Downtime Deterministic Routing:** Core engineering requests execute reliably without external AI API dependencies, while seamlessly integrating Google Gemini 2.5 Flash for semantic refinement when configured.

> *Transparent Disclaimer:* The browser-based voice assistant in DevPulse is a simulation running on the browser Web Speech API. Remote web deployments cannot and do not inspect a visitor's local filesystem. Direct Alexa+ developer console account linking is a planned integration requiring AWS developer console credentials.

---

## Primary Demonstration Walkthrough

### The Flagship Interaction
A developer asks:
> **"What are my two highest-priority open bugs?"**

1. **Intent Understanding:** DevPulse maps the natural request to the MCP tool `get_my_high_priority_bugs` with arguments `{ "assignee": "Alex", "limit": 2 }`.
2. **MCP Tool Execution:** Dispatches a typed JSON-RPC 2.0 call to the MCP server.
3. **Data Retrieval:** Retrieves issue tickets from the active data source (`tasks.json` or live GitHub API).
4. **Deterministic Ranking Rule:** Ranks tickets by explicit priority weight:  
   $$\text{Critical (rank 1)} > \text{High (rank 2)} > \text{Medium (rank 3)} > \text{Low (rank 4)}$$
5. **Human-Readable Answer & Voice Synthesis:**
   ```
   Found 2 high-priority bug(s) assigned to Alex (ranked by explicit severity rule: Critical > High > Medium > Low):
   1. [BUG-101] "Login fails for valid users" — Priority: Critical (Open). Link: https://github.com/Adib-07/DevPulse-/issues/101
   2. [BUG-102] "Dashboard API returns error" — Priority: High (In Progress). Link: https://github.com/Adib-07/DevPulse-/issues/102

   Ranking rationale: Evaluated open issue tickets assigned to Alex; ordered by priority weight and issue identifier.
   ```
6. **Visible Execution Trace:** Rendered in real-time in the UI showing execution duration (⚡ 14ms), data source provenance, and clickable links to `#BUG-101` and `#BUG-102`.

### Other Target Interactions
* *"Which pull requests need my attention?"* → Invokes `list_pull_requests_needing_attention` to flag PR #202 (failing unit tests) and PR #184 (review requested).
* *"Summarize recent changes in this repository."* → Invokes `summarize_recent_activity` to inspect recent git commits and authors.
* *"Check repository health."* → Invokes `get_repository_health_summary` to compute health score (92/100) and identify failing CI checks.
* *"Find documentation relevant to this error."* → Invokes `search_technical_documentation` to search MCP and Next.js specifications.
* *"What should I investigate next?"* → Invokes `recommend_next_action` to prioritize unit test fixes and critical alert triage.

---

## Visual Product Showcase

### 1. Active Command Center & Visible MCP Execution Trace
The central dashboard displays active sprint tickets, system alerts, repository health, and the live MCP Execution Trace showing tool arguments, latency, and source references.

![DevPulse Dashboard Overview](docs/images/devpulse-dashboard.png)
*Figure 1: DevPulse Command Center running on the Obsidian Pulse dark design system.*

### 2. Conversational Voice Session & Incident Triage
When commands are executed, DevPulse renders the conversational transcript, synthesized voice playback, and the live triage feed.

![DevPulse Voice Feed Active](docs/images/devpulse-voice-feed.png)
*Figure 2: Active DevPulse session showing conversation history and live task prioritization.*

### 3. Mobile Responsive Viewport
DevPulse maintains touch-target ergonomics, legible telemetry, and collapsible mobile sidebar navigation across viewports as small as 390px width.

<div align="center">
  <img src="docs/images/devpulse-mobile.png" alt="DevPulse Mobile Layout" width="380" />
  <p><em>Figure 3: DevPulse responsive layout running on mobile viewport (390px × 844px).</em></p>
</div>

---

## Features

### Implemented & Verified
* **7 Core Developer MCP Tools:** Implemented in TypeScript (`lib/mcp/tools.ts`) and Python (`server.py`) with strict JSON Schema validation.
* **Visible MCP Execution Trace:** UI card disclosing tool selection, arguments, data source, duration in ms, and clickable source links.
* **Streamable HTTP MCP Server (`/api/mcp`):** Full MCP 2025-11-25 lifecycle (`initialize`, `ping`, `tools/list`, `tools/call`, SSE streaming, and CORS preflight).
* **Dual-Mode Data Connector:** Seamless toggle between seeded demo fixtures (`tasks.json`, `github.json`, `alerts.json`) and live read-only GitHub REST API queries.
* **Offline-Resilient Intent Routing:** Deterministic pattern classifier guarantees zero downtime for core developer queries even without external AI API keys.
* **Obsidian Pulse HUD:** Interactive Sprint Tasks, Repository Health, Live System Alerts, Pull Requests, Tool Activity Log, and Settings & Protocols Modal.
* **Python FastMCP Server (`server.py`):** Standalone stdio MCP server for local development and official MCP Inspector testing.
* **Automated Test Suite:** 39 tests passing across 7 test suites with 0 TypeScript errors.

### Implemented with Configuration
* **Google Gemini 2.5 Flash Refinement:** When `GEMINI_API_KEY` is provided on the server, Gemini is used to refine ambiguous natural-language commands into registered MCP tools.
* **Live GitHub API Mode:** Connects to public repositories (`Adib-07/DevPulse-`) or private repositories when `GITHUB_TOKEN` is configured.

### Demonstration-Only
* **Simulated Alexa Voice HUD:** Browser Web Speech API provides speech recognition and text-to-speech synthesis for local evaluation.

### Planned Capabilities
* Direct Alexa+ developer console OAuth account linking.
* Bidirectional WebRTC audio streaming directly to the Gemini Multimodal Live API.

---

## System Architecture

```
DEVELOPER (Voice / Text Input)
      │
      ▼
Presentation Layer (Next.js 16 + React 19 Client)
┌────────────────────────────────────────────────────────┐
│  • Obsidian Pulse Dashboard (components/devpulse-dashboard.tsx)
│  • Web Speech Recognition & Speech Synthesis
│  • Visible MCP Execution Trace Card
│  • Settings & Protocol Inspector Modal
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP POST /api/assistant { command }
                           ▼
Intent Understanding Layer (app/api/assistant/route.ts)
┌────────────────────────────────────────────────────────┐
│  • Input Sanitizer (max 500 chars, XML delimiter guard)
│  • Deterministic Pattern Router (Zero-Downtime Fallback)
│  • Google Gemini 2.5 Flash (Optional Semantic Refiner)
└──────────────────────────┬─────────────────────────────┘
                           │ JSON-RPC 2.0 tools/call
                           ▼
Official MCP Server Layer (app/api/mcp/route.ts & server.py)
┌────────────────────────────────────────────────────────┐
│  • Protocol Version: MCP 2025-11-25
│  • Lifecycle: initialize, ping, tools/list, tools/call
│  • Transport: Streamable HTTP (JSON-RPC & SSE) & Stdio
│  • Schema Validator: Enforces required params & boundaries
└──────────────────────────┬─────────────────────────────┘
                           │ Dispatches validated tool
                           ▼
Developer Data Connector (lib/mcp/data-connector.ts)
┌──────────────────────────┴─────────────────────────────┐
│ Demo Fixture Mode              Live GitHub API Mode    │
│ (tasks.json, github.json)      (api.github.com REST)   │
└──────────────────────────┬─────────────────────────────┘
                           │ Structured Result + ExecutionTrace
                           ▼
Response Delivery
┌────────────────────────────────────────────────────────┐
│  • Natural Language Answer + Spoken Audio Synthesis
│  • Real-time Visible Execution Trace Card
│  • Clickable Links to Source Issue / PR Records
└────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Version | Purpose in DevPulse |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `16.4.2` | Server rendering, streaming API routes, and client orchestration |
| **UI Library** | React | `19.2.4` | Component tree with reactive state and concurrent rendering |
| **Styling & Theme** | Tailwind CSS / Lucide React | `4.3.3` / `1.17.0` | Custom Obsidian pulse palette, glowing borders, and reactive states |
| **Protocol / Transport** | Model Context Protocol (MCP) | `2025-11-25` | Streamable HTTP endpoint (`/api/mcp`) with JSON-RPC 2.0 & SSE |
| **Python MCP Server** | Python MCP SDK v2 | `3.11+` / `mcp[cli]` | Standalone stdio MCP server (`server.py`) for Claude Desktop & Cursor |
| **AI Routing Engine** | Deterministic + Gemini 2.5 Flash | `@google/genai` `2.30.0` | Zero-downtime deterministic pattern routing with Gemini semantic fallback |
| **Package Manager** | pnpm | `11.17.0` | Deterministic lockfile dependency isolation |
| **Test Runner** | Node.js Native Test Runner | Node 20+ (`node:test`) | 39 automated tests across 7 test suites (169ms) |
| **Deployment** | Vercel | Production | Serverless Edge routing with Next.js build delegation ([`vercel.json`](vercel.json)) |

---

## Live Demo

* **Canonical Live Deployment:** [https://dev-pulse-wine-eta.vercel.app/](https://dev-pulse-wine-eta.vercel.app/)
* **Public MCP Endpoint:** [https://dev-pulse-wine-eta.vercel.app/api/mcp](https://dev-pulse-wine-eta.vercel.app/api/mcp)
* **Assistant Endpoint:** [https://dev-pulse-wine-eta.vercel.app/api/assistant](https://dev-pulse-wine-eta.vercel.app/api/assistant)

### How Evaluators Can Test the Live Application
1. Open [https://dev-pulse-wine-eta.vercel.app/](https://dev-pulse-wine-eta.vercel.app/) in any modern browser.
2. Click any of the quick demonstration chips (e.g. *"What are my two highest-priority open bugs?"* or *"Which pull requests need my attention?"*).
3. Observe:
   - The assistant answers with exact ticket identifiers and links.
   - The **Visible MCP Execution Trace** card immediately displays the tool name (`get_my_high_priority_bugs`), validated arguments, execution latency (⚡ 16ms), and source references.
   - Audio synthesis reads the answer aloud.
4. Click **Settings & Protocols** in the sidebar or header to inspect the MCP server status and click **Test Ping** to test live JSON-RPC 2.0 communication.

---

## Quick Start

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

## Environment Variables

| Variable | Required | Purpose | Exposure | Where to Obtain |
| :--- | :---: | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional | Semantic intent refinement via Google Gemini 2.5 Flash | **Server-Only** | [Google AI Studio](https://aistudio.google.com/) |
| `GITHUB_TOKEN` | Optional | Authenticated GitHub REST API queries (higher rate limits) | **Server-Only** | [GitHub Personal Access Tokens](https://github.com/settings/tokens) |
| `GITHUB_REPOSITORY` | Optional | Target repository for live GitHub queries (defaults to `Adib-07/DevPulse-`) | **Server-Only** | Your GitHub repo (`owner/repo`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Endpoint for Supabase PostgreSQL persistence | Public client bundle | [Supabase Console](https://supabase.com/) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Public anonymous key for Supabase client queries | Public client bundle | [Supabase Console](https://supabase.com/) |

*Security Rule: Real API credentials must never be committed. See [`.env.example`](.env.example) for placeholder values.*

---

## MCP Protocol & Tools

### Protocol Compatibility
* **Specification Target:** Model Context Protocol (MCP) `2025-11-25` (backwards-compatible with `2024-11-05`).
* **Transport:** Streamable HTTP at `/api/mcp` (JSON-RPC 2.0 & SSE) and stdio in `server.py`.
* **CORS:** Configured with `Access-Control-Allow-Origin: *` to allow remote MCP clients and simulators.

### The 7 Registered Tools

| # | Tool Identifier | Input Parameters | Output & Deterministic Behavior |
| :---: | :--- | :--- | :--- |
| **A** | `list_repository_issues` | `status` (open/closed/all), `assignee`, `label`, `limit` | Filters repository tickets with stable identifiers (`#BUG-101`) and direct GitHub URLs. |
| **B** | `get_my_high_priority_bugs` | `assignee` (default 'Alex'), `limit` (default 2) | **Flagship demo tool**: Deterministically ranks open bugs: Critical (rank 1) > High (rank 2) > Medium (rank 3) > Low (rank 4). |
| **C** | `list_pull_requests_needing_attention` | `reason` (all/review_requested/changes_requested/checks_failing) | Evaluates check states; flags PR #202 (failing unit tests) and PR #184 (review requested). |
| **D** | `summarize_recent_activity` | `limit` (default 5) | Returns factual commit history with short commit hashes (`4e827ed`, `f4c7ff6`) and author timestamps. |
| **E** | `search_technical_documentation` | `query` *(required string)* | Searches supported documentation (MCP specification, Next.js App Router, GitHub REST). |
| **F** | `get_repository_health_summary` | *(none)* | Calculates overall repository health score (92/100) based on CI checks and alerts. |
| **G** | `recommend_next_action` | `focusArea` (all/bugs/checks/alerts) | Suggests top read-only engineering investigations with justifications. |

---

## Testing and Quality

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

Pass: 39/39 tests across 7 suites (169ms)
```

| Verification Check | Command | Status | Result |
| :--- | :--- | :---: | :--- |
| **TypeScript Static Check** | `pnpm typecheck` | **PASSED** | 0 type errors across all routes and components |
| **Automated Test Suite** | `pnpm test` | **PASSED** | 39/39 tests passed across 7 test suites |
| **Next.js Production Build** | `pnpm build` | **PASSED** | Next.js 16.4.2 production bundle compiled in ~720ms |
| **Python Syntax Check** | `python3 -m py_compile server.py data_loader.py` | **PASSED** | 0 syntax errors |
| **Data Loader Pipeline** | `python3 data_loader.py` | **PASSED** | Tasks, PRs, and alert streams loaded cleanly |

---

## Security

* **Least Privilege Tool Design:** All 7 developer tools are strictly read-only query operations; destructive actions cannot be initiated through the MCP interface.
* **Prompt Injection Defense:** Commands are bounded to 500 characters, wrapped in system delimiters, and processed through deterministic pattern matchers that ignore jailbreak instructions (verified in [`tests/security-validation.test.ts`](tests/security-validation.test.ts)).
* **Credential Isolation:** No tokens, API keys, or private environment variables are returned in MCP tool outputs, execution traces, or client-side bundles.
* **Input Validation:** Tool arguments are validated against strict JSON Schemas; missing required arguments return standardized `-32602` error codes.

---

## Limitations and Roadmap

* **Alexa+ Direct Cloud Account Linking:** Direct Alexa+ developer console integration requires AWS Alexa Developer account credentials and OAuth PKCE client registration, which must be configured in the AWS developer portal. The application is fully prepared via its public Streamable HTTP MCP server at `https://dev-pulse-wine-eta.vercel.app/api/mcp`.
* **Bidirectional WebRTC Audio Streaming:** The current client uses the browser Web Speech API for voice recognition and synthesis; live WebRTC audio streaming directly to the Gemini Multimodal WebSocket API remains on the roadmap.
* **Data Scope:** Operates out of the box with seeded demo fixtures (`tasks.json`, `github.json`, `alerts.json`) and supports live public GitHub REST API queries when configured.

---

## Contribution, License, and Acknowledgements

* **License Status:** No formal `LICENSE` file is currently present in the root checkout. The repository is provided for evaluator inspection under standard Amazon Developer Hackathon evaluation terms.
* **Contributing:** See [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards and pull request guidelines.
* **Model Context Protocol:** Built using the open [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) specification.
* **Component Primitives:** Built on [Base UI](https://base-ui.com/) and [Lucide](https://lucide.dev/).
