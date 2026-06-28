## MANDATORY: Query Graphify Before Reading Files

`graphify-out/graph.json` exists in this project. Before reading any source file, running `grep`, `find`, `cat`, `head`, `tail`, or any file-search command, you MUST query the knowledge graph first:

```bash
graphify query "<your question about the task>"
graphify explain "<concept or file name>"
graphify path "<ComponentA>" "<ComponentB>"
```

These return a focused subgraph — far fewer tokens than reading raw files. Only after graphify has oriented you should you read specific lines for editing or debugging.

Skip graphify ONLY if the user explicitly says not to use it, or if the task is about fixing stale graph output itself.

After meaningful code changes, always run:
```bash
graphify update .
```

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Graphify Usage

Before modifying code, query the project graph to understand the relevant files and dependencies.

Use:

```bash
graphify query "What existing files are relevant to this task?"
graphify query "What components, routes, and utilities may be affected?"
graphify query "What existing patterns should be followed?"
```

After meaningful changes, update the graph:

```bash
graphify update .
```

If the change affects project structure, architecture, auth, database, UI flows, or product behaviour, update `documentation.md` as well.
