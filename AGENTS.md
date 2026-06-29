# AGENTS.md — MOCKR.AI Canonical Agent Instructions

This is the single source of truth for all coding agents (Claude Code, Codex, and others).
`CLAUDE.md` and `CODEX.md` are compatibility shims that point here.

---

## Product Identity

**MOCKR.AI** is an interview-preparation product for Australian university students and recent graduates preparing for software-engineering internships, graduate roles, and junior developer positions.

- Core flow: browse questions → choose a question → practice in an interview-style coding workspace → explain approach → run tests → submit attempt → receive structured feedback → track progress.
- The MVP is single-question coding practice. It is **not** a live voice/video interview platform.
- This is a preparation and coaching tool, not an employer-facing hiring or candidate-rejection system.
- Keep the MVP simple, maintainable, and focused. Do not overbuild.

## Before Every Task — Mandatory Orientation

### 1. Read context first

Before making changes, read:
- `AGENTS.md` (this file)
- `documentation.md` — implementation log and current limitations
- `graphify-out/GRAPH_REPORT.md` — for broad architecture review or structural edits

Do not rely on assumptions from prior sessions if the repo or documentation says otherwise.

### 2. Query Graphify before touching source files

`graphify-out/graph.json` exists. Before reading source files, running grep/find, or exploring the codebase, run:

```bash
./scripts/graphify query "<your question about the task>"
./scripts/graphify explain "<concept or file name>"
./scripts/graphify path "<ComponentA>" "<ComponentB>"
```

These return a focused subgraph — far fewer tokens than reading raw files. In this repo, `./scripts/graphify` is a checked-in fallback over `graphify-out/graph.json`, so `query`, `explain`, and `path` work even when the external Graphify CLI is not installed. Read specific source lines only after Graphify has oriented you, or when editing/debugging specific lines.

**Skip Graphify only if:** the user explicitly says not to use it, or the task is about fixing stale graph output.

Dirty `graphify-out/` files are normal after hooks or incremental updates — not a reason to skip.

If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.

### 3. After meaningful changes — update Graphify

After any change that affects file structure, routes, components, dependencies, auth, database structure, architecture, or UI flows:

```bash
./scripts/graphify update .
```

If the fallback reports that update is unsupported, record that limitation in `documentation.md` instead of pretending the graph was refreshed.

---

## Documentation Workflow

Update `documentation.md` after every meaningful change. Each entry must include:

- **Date/time** (AEST)
- **What was completed**
- **Files/routes/components/tables changed**
- **Limitations that remain**
- **Issues encountered and assumptions made**
- **What should happen next**

Keep entries concise but useful for future developers. Do not remove historical context unless it is clearly outdated and replaced with better current information.

---

## Testing Workflow

Update `TESTING.md` after every feature implementation, route addition, component change, data flow change, or auth/database change.

Rules:
- Add a new section (or sub-section) under the appropriate area in `TESTING.md`.
- Each new item must be a `[ ]` checkbox with a concrete, one-step manual test.
- Write at the level of: *go here, do this, expect that*.
- Do not mark items `[x]` yourself — only the user marks items tested.
- If you modify an existing feature, update its existing test items to reflect the new behaviour.
- If you remove a feature, remove its test items.

Example format:
```
### My New Feature
- [ ] Navigating to `/foo` shows the new panel
- [ ] Clicking "Do thing" triggers X and shows Y
- [ ] Error state: if Z is missing, shows message "..."
```

### Running checks

After changes, run the available scripts in order:

```bash
npm run lint    # ESLint
npm run build   # TypeScript check + production build (both run together)
```

No separate `typecheck` script exists — TypeScript errors surface via `npm run build`.

If a command fails due to environment setup, missing env vars, or pre-existing unrelated issues, record the exact error in `documentation.md` and `TESTING.md`. Do not claim tests passed unless they actually passed.

---

## Git Rules

- **Never** run `git add`, `git commit`, `git push`, or stage files.
- You may use `git status`, `git diff`, and `git log` for inspection only.
- The user will review, stage, commit, and push manually.
- At the end of a task, report changed files and recommended next git commands — do not run them.

---

## Security and Responsible-AI Rules

- Do not expose secrets or API keys.
- Do not weaken auth, RLS, or protected routes. Preserve existing Supabase auth behaviour.
- Do not add unsafe server-side arbitrary code execution.
- Do not claim the product predicts job offers or hiring probability.
- Keep feedback tied to observable coding/interview behaviour.
- Avoid claiming MOCKR perfectly reproduces any company's real interview process.
- Do not introduce scraping or confidential interview-question collection.

---

## Implementation Standards

- Follow the existing Next.js App Router structure.
- This project uses **Next.js 16** — APIs, conventions, and file structure may differ from training data. Check `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
- Keep TypeScript types clear and reusable.
- Prefer existing components, utilities, styles, and conventions over new ones.
- Do not create duplicate systems if a working pattern already exists.
- Avoid unnecessary dependencies and large rewrites.
- Keep UI consistent with the current clean SaaS / student-friendly direction.
- Handle loading, empty, and error states where practical.
- Maintain accessibility basics where relevant.

---

## Execution Workflow for Large Tasks

When a task is large, break it into clearly defined phases. After each phase:

1. Stop and present: what was completed, files changed, issues or limitations, what the next phase involves.
2. Wait for explicit user approval before continuing.
3. Each phase must be independently understandable and testable where possible.

Do not continue automatically through all phases without user confirmation.

---

## Scope Rules

- Keep changes scoped to the user's task.
- Do not implement product features unless the task asks for them.
- Do not refactor unrelated code.
- Prefer small, maintainable implementations over broad rewrites.
- Do not design for hypothetical future requirements.
