# Repository Guidelines

## Project Structure & Module Organization

The beginner-friendly server lives in `server.py`; JSON reading and basic validation live in `data_loader.py`. The root `tasks.json`, `github.json`, and `alerts.json` files are temporary sample data. `README.md` explains setup and local use. Keep this small prototype flat until added features justify more folders.

## Build, Test, and Development Commands

Create an environment with `python3 -m venv .venv`, install with `./.venv/bin/python -m pip install -r requirements.txt`, and inspect/test tools with `./.venv/bin/mcp dev server.py`. Run directly with `./.venv/bin/python server.py`; it uses stdio and waits for an MCP client. The Inspector requires Node.js and `npx`.

## Coding Style & Naming Conventions

Use four spaces for Python indentation, `snake_case` for functions and variables, and descriptive names for JSON fields. Keep all sample-data loading in `data_loader.py`. No formatter or linter is configured yet.

## Testing Guidelines

No automated test framework or coverage threshold is configured yet. Verify tool visibility and call each tool through `mcp dev server.py` and the Inspector. Include malformed and missing JSON cases if automated tests are added.

## Commit & Pull Request Guidelines

Git history is not available in this checkout, so no existing commit convention can be confirmed. Use short, imperative commit subjects (for example, `Add health check tool`) and keep each commit focused. Pull requests should explain the change and its motivation, list validation commands and results, link related issues when applicable, and include screenshots or sample output for user-visible changes.

## Security & Configuration

Keep credentials and local overrides out of version control. Provide a sanitized example configuration when configuration is introduced, and validate required environment variables at startup with actionable errors.
