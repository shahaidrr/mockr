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

---

## Before Every Task — Mandatory Orientation

### 1. Read context first

Before making changes, read:

- `AGENTS.md` (this file)
- `documentation.md` — implementation log and current limitations
- `.graphify/GRAPH_REPORT.md` — for broad architecture review or structural edits

Do not rely on assumptions from prior sessions if the repo or documentation says otherwise.

### 2. Query Graphify before touching source files

`.graphify/graph.json` exists. Before reading source files, running grep/find, or exploring the codebase, run:

```bash
npx graphify query "<your question about the task>"
npx graphify explain "<concept or file name>"
npx graphify path "<ComponentA>" "<ComponentB>"
```

These return a focused subgraph — far fewer tokens than reading raw files. The real Graphify CLI is installed as the `@sentropic/graphify` dev dependency, so use `npx graphify ...` from the repo root. Read specific source lines only after Graphify has oriented you, or when editing/debugging specific lines.

**Skip Graphify only if:** the user explicitly says not to use it, or the task is about fixing stale graph output.

Dirty `.graphify/` files are normal after hooks or incremental updates — not a reason to skip.

If `.graphify/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.

### 3. After meaningful changes — update Graphify

After any change that affects file structure, routes, components, dependencies, auth, database structure, architecture, or UI flows:

```bash
npx graphify update --no-description --no-label .
```

If Graphify reports an environment or dependency issue, record that limitation in `documentation.md` instead of pretending the graph was refreshed.

---

## After Meaningful Changes

After any change that affects file structure, routes, components, dependencies, auth, database structure, architecture, or UI flows, do all of the following:

1. Run `npx graphify update --no-description --no-label .` (AST-only — no API cost)
2. Update `documentation.md` with: date/time (AEST), what was completed, files/routes/components/tables changed, limitations that remain, issues and assumptions, what should happen next. Keep entries concise; do not remove historical context unless clearly replaced.
3. Update `TESTING.md` — add `[ ]` checkbox items at the level of _go here, do this, expect that_. Do not mark items `[x]` yourself. Update existing items if behaviour changed; remove items if a feature was removed.
4. Run checks in order:

```bash
npm run lint    # ESLint
npm run build   # TypeScript check + production build
```

No separate `typecheck` script — TypeScript errors surface via `npm run build`. Record any failure caused by environment setup or pre-existing issues in `documentation.md` and `TESTING.md`.

---

## Git Rules

- **Never** run `git add`, `git commit`, `git push`, or stage files.
- You may use `git status`, `git diff`, and `git log` for inspection only.
- The user will review, stage, commit, and push manually.
- At the end of a task, report changed files and provide a **Suggested commit message:** — one concise sentence describing the actual changes. Do not invent changes that were not made.

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

- This project uses **Next.js 16** App Router — APIs and conventions may differ from training data. Check `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
- Keep TypeScript types clear and reusable.
- Prefer existing components, utilities, styles, and conventions over new ones.
- Avoid unnecessary dependencies and large rewrites.
- Keep UI consistent with the current clean SaaS / student-friendly direction.
- Handle loading, empty, and error states where practical.
- Maintain accessibility basics where relevant.

---

## Execution Workflow

### Before editing — state intent

- **Small task:** one sentence describing the intended change.
- **Medium or large task:** a short checklist-style plan.
- **Risky change** (multi-file, auth, database, routing, Graphify, or architecture): stop and wait for explicit user approval before implementing.

After presenting a plan, **always wait for explicit user approval of the steps and subtasks before beginning any implementation.**

### Task Progress Checklist

For every task, maintain a visible subtask checklist. Use this format:

```
### Task Progress
- [x] ~~Completed subtask~~
- [*] Current subtask being worked on
- [ ] Next incomplete subtask
```

Rules: one `[*]` at a time; completed subtasks use `[x] ~~strikethrough~~`; do not mark complete unless actually done.

### After completing each phase or task

Stop for user review and provide only:

- The updated Task Progress Checklist
- Files/routes/components changed
- Issues, blockers, or limitations
- What was launched or shown in the preview/dev panel (or how to verify manually if nothing to launch)
- How the user can manually test the result
- For large/multi-phase tasks: what approval is needed before continuing

Wait for explicit user approval before continuing to the next phase or doing any follow-up work.

If the task cannot be launched in the preview/dev panel (missing env vars, build errors, auth restrictions, etc.), explain the blocker and document it in `documentation.md` and `TESTING.md`.
