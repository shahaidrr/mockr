#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const graphPath = path.join(repoRoot, "graphify-out", "graph.json");

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function loadGraph() {
  if (!fs.existsSync(graphPath)) {
    fail(`Graph file not found: ${graphPath}`);
  }

  const graph = JSON.parse(fs.readFileSync(graphPath, "utf8"));
  return {
    nodes: Array.isArray(graph.nodes) ? graph.nodes : [],
    links: Array.isArray(graph.links) ? graph.links : [],
  };
}

function nodeText(node) {
  return [
    node.id,
    node.label,
    node.title,
    node.norm_label,
    node.file_type,
    node.source_file,
    node.community_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9_./[\]-]+/i)
    .map((token) => token.trim())
    .filter(Boolean);
}

function scoreNode(node, terms) {
  const haystack = nodeText(node);
  let score = 0;

  for (const term of terms) {
    if (haystack.includes(term)) score += 4;
    if ((node.label ?? "").toLowerCase().includes(term)) score += 3;
    if ((node.title ?? "").toLowerCase().includes(term)) score += 2;
    if ((node.source_file ?? "").toLowerCase().includes(term)) score += 5;
  }

  return score;
}

function printableNode(node) {
  const title = node.title ?? node.label ?? node.id;
  const file = node.source_file ?? "unknown";
  const loc = node.source_location ? `:${node.source_location}` : "";
  return `- ${title} [${node.id}] (${file}${loc})`;
}

function bestMatches(nodes, query, limit = 10) {
  const terms = tokenize(query);
  return nodes
    .map((node) => ({ node, score: scoreNode(node, terms) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.node.source_file ?? "").localeCompare(b.node.source_file ?? "");
    })
    .slice(0, limit);
}

function buildAdjacency(links) {
  const adjacency = new Map();

  for (const link of links) {
    if (!adjacency.has(link.source)) adjacency.set(link.source, []);
    if (!adjacency.has(link.target)) adjacency.set(link.target, []);
    adjacency.get(link.source).push(link.target);
    adjacency.get(link.target).push(link.source);
  }

  return adjacency;
}

function shortestPath(startId, endId, adjacency) {
  const queue = [[startId]];
  const seen = new Set([startId]);

  while (queue.length > 0) {
    const current = queue.shift();
    const tail = current[current.length - 1];
    if (tail === endId) return current;

    for (const next of adjacency.get(tail) ?? []) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push([...current, next]);
    }
  }

  return null;
}

function usage() {
  console.log("Usage:");
  console.log("  ./scripts/graphify query \"<question>\"");
  console.log("  ./scripts/graphify explain \"<concept>\"");
  console.log("  ./scripts/graphify path \"<A>\" \"<B>\"");
  console.log("  ./scripts/graphify update .");
  console.log("  ./scripts/graphify doctor");
}

function queryLike(mode, text) {
  const { nodes, links } = loadGraph();
  const matches = bestMatches(nodes, text, mode === "query" ? 12 : 8);
  if (matches.length === 0) fail(`No matches found for: ${text}`, 2);

  console.log(`${mode === "query" ? "Query" : "Explain"} matches for: ${text}`);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  for (const { node, score } of matches) {
    console.log(`${printableNode(node)} score=${score}`);
    if (mode === "explain") {
      const related = links
        .filter((link) => link.source === node.id || link.target === node.id)
        .slice(0, 6)
        .map((link) => {
          const otherId = link.source === node.id ? link.target : link.source;
          const other = nodeById.get(otherId);
          return `${link.relation ?? "related"} -> ${other?.title ?? other?.label ?? otherId}`;
        });
      if (related.length > 0) {
        console.log(`  relations: ${related.join(" | ")}`);
      }
    }
  }
}

function runPath(fromQuery, toQuery) {
  const { nodes, links } = loadGraph();
  const start = bestMatches(nodes, fromQuery, 1)[0];
  const end = bestMatches(nodes, toQuery, 1)[0];

  if (!start) fail(`No path start match found for: ${fromQuery}`, 2);
  if (!end) fail(`No path end match found for: ${toQuery}`, 2);

  const pathIds = shortestPath(start.node.id, end.node.id, buildAdjacency(links));
  if (!pathIds) fail(`No path found between "${fromQuery}" and "${toQuery}"`, 2);

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  console.log(`Path from "${fromQuery}" to "${toQuery}":`);
  for (const id of pathIds) {
    console.log(printableNode(nodeById.get(id) ?? { id, label: id }));
  }
}

function runUpdate(target) {
  fail(
    [
      "Local Graphify fallback is query-only in this repo.",
      "It supports `query`, `explain`, and `path` against checked-in `graphify-out/graph.json`.",
      "It cannot regenerate the graph because the real Graphify CLI is not installed in this environment.",
      `Requested update target: ${target || "."}`,
    ].join("\n"),
    2
  );
}

function runDoctor() {
  const rootPackageJsonPath = path.join(repoRoot, "package.json");
  const packageJsonPath = path.join(repoRoot, "node_modules", "graphify", "package.json");
  const rootPackageInfo = fs.existsSync(rootPackageJsonPath)
    ? JSON.parse(fs.readFileSync(rootPackageJsonPath, "utf8"))
    : null;
  let packageInfo = null;

  if (fs.existsSync(packageJsonPath)) {
    packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  }

  console.log("Graphify doctor");
  console.log(`- graphify-out/graph.json: ${fs.existsSync(graphPath) ? "present" : "missing"}`);
  console.log(`- fallback CLI: ${path.relative(repoRoot, __filename)}`);
  console.log(
    `- package.json references graphify dependency: ${
      rootPackageInfo?.dependencies?.graphify ? "yes" : "no"
    }`
  );
  if (packageInfo) {
    console.log(`- installed npm package: ${packageInfo.name}@${packageInfo.version}`);
    console.log(`- package exposes CLI bin: ${packageInfo.bin ? "yes" : "no"}`);
  }
  if (rootPackageInfo?.dependencies?.graphify && packageInfo && !packageInfo.bin) {
    console.log("- issue: package.json references an unrelated npm package named `graphify`.");
  } else if (!rootPackageInfo?.dependencies?.graphify && packageInfo) {
    console.log("- note: node_modules still contains the old graphify package until dependencies are reinstalled.");
  }
}

const [, , command, ...args] = process.argv;

if (!command || command === "--help" || command === "-h" || command === "help") {
  usage();
  process.exit(0);
}

if (command === "query") queryLike("query", args.join(" "));
else if (command === "explain") queryLike("explain", args.join(" "));
else if (command === "path") runPath(args[0] ?? "", args[1] ?? "");
else if (command === "update") runUpdate(args[0]);
else if (command === "doctor") runDoctor();
else fail(`Unknown command: ${command}`, 2);
