@AGENTS.md

## Graphify Usage

Before making code changes, inspect the current project graph.

Use Graphify to understand relevant files, routes, components, and dependencies before editing:

```bash
graphify query "What files are relevant to this task?"
graphify query "How does this feature connect to the current app structure?"
graphify query "What components, routes, and utilities may be affected?"
```

After meaningful changes, update the graph:

```bash
graphify update .
```

If the task changes routes, components, auth, database structure, architecture, UI flows, product behaviour, or documentation, update `documentation.md` as well.
