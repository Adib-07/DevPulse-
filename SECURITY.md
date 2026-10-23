# Security Policy

## Supported Versions

DevPulse is actively maintained in the main branch. Critical security updates are applied to the active branch.

| Version | Supported          |
| ------- | ------------------ |
| `0.0.0` (Active Main) | :white_check_mark: |

---

## Security Practices Implemented

* **Zero Committed Secrets:** The repository is audited with static Git scans. Private environment variables are excluded via [`.gitignore`](file:///Users/adibsunasra007gmail.com/Downloads/project/.gitignore) and a sanitized template is provided in [`.env.example`](file:///Users/adibsunasra007gmail.com/Downloads/project/.env.example).
* **Database Row-Level Security (RLS):** Supabase PostgreSQL policies enforce table access constraints. Even in demo mode, values are restricted by SQL `CHECK` constraints on `command_id` and `status`.
* **Client-Side Secret Isolation:** Only public client-side keys (`VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_URL`) are read by the frontend bundle. No administrative, database password, or service role keys are ever present in the codebase.
* **Timeout Guards:** All asynchronous database requests run inside a 4000ms timeout boundary ([`src/sim/persistence.ts`](file:///Users/adibsunasra007gmail.com/Downloads/project/src/sim/persistence.ts)), preventing thread starvation, unhandled promise rejections, and memory leaks.
* **DOM Injection Protection:** SVG gradients use React's `useId()` hook to generate unique runtime IDs, preventing DOM element pollution.

---

## Reporting a Vulnerability

If you discover a security vulnerability or sensitive information exposure in DevPulse, please report it privately:

1. **Do not create a public GitHub Issue.**
2. Open a [GitHub Security Advisory](https://github.com/Adib-07/DevPulse-/security/advisories/new) directly on the repository, or contact the project maintainer.
3. Include:
   * Description of the vulnerability and affected component.
   * Minimal reproducible steps or proof-of-concept.
   * Potential impact assessment.
4. The maintainers will acknowledge receipt within 48 hours and work with you on a coordinated fix.
