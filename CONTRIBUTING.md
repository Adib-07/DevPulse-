# Contributing to DevPulse

Thank you for your interest in contributing to **DevPulse**! We welcome contributions from developers, designers, and testers.

---

## 1. Prerequisites

Ensure you have the following installed locally:
* **Node.js:** v18.0.0 or higher (v20+ recommended)
* **npm:** v9.0.0 or higher
* **Git:** v2.30+

---

## 2. Local Development Setup

1. **Fork and Clone the Repository:**
   ```bash
   git clone https://github.com/Adib-07/DevPulse-.git
   cd DevPulse-
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment (Optional):**
   ```bash
   cp .env.example .env
   ```
   *Note: DevPulse works 100% out of the box in local memory mode without configuring Supabase.*

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 3. Development Scripts

Run these scripts during development to ensure code quality:

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Launch local Vite development server with HMR |
| `npm test` | Run Vitest unit & regression test suite |
| `npm run typecheck` | Validate TypeScript types with `tsc --noEmit` |
| `npm run lint` | Run ESLint checks across the codebase |
| `npm run build` | Compile optimized production bundle to `dist/` |
| `npm run preview` | Preview production build locally on port 4173 |

---

## 4. Coding Conventions

* **Framework:** React 18 with functional components and React Hooks (`useState`, `useEffect`, `useCallback`, `useRef`, `useId`).
* **Language:** Strict TypeScript. Avoid `any` types; define explicit interfaces in [`src/sim/types.ts`](file:///Users/adibsunasra007gmail.com/Downloads/project/src/sim/types.ts).
* **Styling:** Tailwind CSS utility classes following the **Obsidian Pulse** dark theme specification. Use `twMerge` helper when combining classes dynamically.
* **Icons:** Standardized via [`src/components/Icons.tsx`](file:///Users/adibsunasra007gmail.com/Downloads/project/src/components/Icons.tsx) from `lucide-react`.
* **Tests:** Write unit tests for all business logic and regression tests for bug fixes in `src/**/*.test.ts` using Vitest.

---

## 5. Pull Request Checklist

Before submitting a Pull Request, verify:
- [ ] `npm run typecheck` passes with 0 errors.
- [ ] `npm run lint` passes with 0 errors and 0 warnings.
- [ ] `npm test` passes 100% of test suites.
- [ ] `npm run build` compiles successfully.
- [ ] No secrets, `.env` files, or unintended files are tracked in Git.
- [ ] Clear commit message explaining the change (e.g. `feat: ...`, `fix: ...`, `docs: ...`).
