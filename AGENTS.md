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
graphify query "<your question about the task>"
graphify explain "<concept or file name>"
graphify path "<ComponentA>" "<ComponentB>"
```

These return a focused subgraph — far fewer tokens than reading raw files. Read specific source lines only after Graphify has oriented you, or when editing/debugging specific lines.

**Skip Graphify only if:** the user explicitly says not to use it, or the task is about fixing stale graph output.

Dirty `graphify-out/` files are normal after hooks or incremental updates — not a reason to skip.

If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.

### 3. After meaningful changes — update Graphify

After any change that affects file structure, routes, components, dependencies, auth, database structure, architecture, or UI flows:

```bash
graphify update .
```

AST-only — no API cost.

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
- Write at the level of: _go here, do this, expect that_.
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

## Task Progress Checklist

For every task, feature, fix, or implementation, maintain a visible subtask checklist so the user can see what is planned, what is currently being worked on, and what has been completed.

Before starting implementation, list the required subtasks for success.

Use this exact format:

### Task Progress

- [*] Current subtask being worked on
- [ ] Next incomplete subtask
- [ ] Another incomplete subtask

As each subtask is completed, update it with a tick and strikethrough:

### Task Progress

- [x] ~~Completed subtask~~
- [*] Current subtask being worked on
- [ ] Next incomplete subtask

Rules:

Every meaningful subtask must be listed before or during implementation.
Only one subtask should be marked [*] as the current active task at a time.
When a subtask is completed, mark it [x] and apply strikethrough using ~~completed text~~.
Upcoming or incomplete subtasks remain [ ].
Keep the checklist updated as work progresses.
Show the updated checklist when stopping for user review, phase approval, or final task summary.
Do not mark a subtask complete unless it was actually completed.

---

## Execution Workflow for All Tasks

Use the **Task Progress Checklist** as the live status report for subtasks. Do not repeat the same completed/in-progress task list separately unless the user asks for a fuller summary.

### Large tasks

When a task is large, complex, or involves multiple files/routes/features, break it into clearly defined phases.

For each phase:

1. State the phase goal and create/update the Task Progress Checklist before editing.
2. Complete only the approved phase and keep the checklist updated as subtasks move from `[ ]` to `[*]` to `[x] ~~done~~`.
3. Launch or expose the relevant functionality in the app preview/dev panel where applicable, so the user can test that the feature or task works as described.
4. Stop for user review and provide only:
   - The updated Task Progress Checklist
   - Files/routes/components changed
   - Issues, blockers, or limitations
   - What was launched or shown in the preview/dev panel
   - How the user can manually test the result
   - What approval is needed before continuing

5. Wait for explicit user approval before continuing to the next phase.

Do not continue automatically through all phases without user confirmation.

Each phase must be independently understandable and testable where possible.

If the functionality cannot be launched in the preview/dev panel because of missing environment variables, broken dependencies, auth restrictions, build errors, or another blocker, clearly explain the blocker and document it in `documentation.md` and `TESTING.md`.

### Small or regular tasks

When a task is small or regular, first state the intended change briefly and create/update the Task Progress Checklist before editing. Then complete the task in one focused pass after confirming approval from the user.

After completing the task:

1. Launch or expose the relevant functionality in the app preview/dev panel where applicable, so the user can test that the feature or task works as described.
2. Stop for user review and provide only:
   - The updated Task Progress Checklist
   - Files/routes/components changed
   - Issues, blockers, or limitations
   - What was launched or shown in the preview/dev panel
   - How the user can manually test the result

3. Wait for explicit user approval before doing any further follow-up work.

Do not continue into extra improvements, refactors, or additional tasks unless the user approves.

If the task is documentation-only, config-only, or otherwise has no runnable UI/functionality to launch, explain how the user can verify the change manually instead.

---

## Commit Message Summary

At the very end of the task, provide one concise sentence the user can use as a commit message.

Rules:

The sentence must describe the actual changes completed.
Keep it short and specific.
Do not invent changes that were not made.
Do not run git add, git commit, git push, or stage files.
Label it clearly as: Suggested commit message:

---

## Scope Rules

- Keep changes scoped to the user's task.
- Do not implement product features unless the task asks for them.
- Do not refactor unrelated code.
- Prefer small, maintainable implementations over broad rewrites.
- Do not design for hypothetical future requirements.
