"use client";

import { useState } from "react";
import CodeEditor from "@/components/code-editor";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", badge: "JS", badgeBg: "#f7df1e", badgeColor: "#000" },
  { id: "typescript", label: "TypeScript", badge: "TS", badgeBg: "#3178c6", badgeColor: "#fff" },
  { id: "python",     label: "Python",     badge: "PY", badgeBg: "#3776ab", badgeColor: "#fff" },
  { id: "java",       label: "Java",       badge: "JV", badgeBg: "#f89820", badgeColor: "#000" },
  { id: "cpp",        label: "C++",        badge: "C+", badgeBg: "#659ad2", badgeColor: "#fff" },
  { id: "csharp",     label: "C#",         badge: "C#", badgeBg: "#9b4f96", badgeColor: "#fff" },
  { id: "go",         label: "Go",         badge: "GO", badgeBg: "#00add8", badgeColor: "#fff" },
  { id: "ruby",       label: "Ruby",       badge: "RB", badgeBg: "#cc342d", badgeColor: "#fff" },
];

const STARTER_CODE: Record<string, string> = {
  javascript: `function solve(input) {\n  // Write your solution here\n  return input;\n}\n`,
  typescript: `function solve(input: unknown): unknown {\n  // Write your solution here\n  return input;\n}\n`,
  python:     `def solve(input):\n    # Write your solution here\n    return input\n`,
  java:       `class Solution {\n    public Object solve(Object input) {\n        // Write your solution here\n        return input;\n    }\n}\n`,
  cpp:        `#include <iostream>\nusing namespace std;\n\nauto solve(auto input) {\n    // Write your solution here\n    return input;\n}\n`,
  csharp:     `public class Solution {\n    public object Solve(object input) {\n        // Write your solution here\n        return input;\n    }\n}\n`,
  go:         `package main\n\nfunc solve(input interface{}) interface{} {\n\t// Write your solution here\n\treturn input\n}\n`,
  ruby:       `def solve(input)\n  # Write your solution here\n  input\nend\n`,
};

const INITIAL_OUTPUT =
  "Ready to run your solution.\nThis is a demo coding environment.\nQuestion-specific tests, edge cases, and execution will be added later.";

type ActiveTab = "output" | "ai";
type SidebarPanel = "languages" | "drawing" | null;

export default function PracticeWorkspace() {
  const [langId, setLangId] = useState("javascript");
  const [code, setCode] = useState(STARTER_CODE.javascript);
  const [output, setOutput] = useState(INITIAL_OUTPUT);
  const [activeTab, setActiveTab] = useState<ActiveTab>("output");
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel>(null);

  const lang = LANGUAGES.find((l) => l.id === langId)!;

  function selectLanguage(id: string) {
    setLangId(id);
    setCode(STARTER_CODE[id]);
    setSidebarPanel(null);
  }

  function handleRun() {
    setActiveTab("output");
    setOutput(
      `> Demo run started\n> Language: ${lang.label}\n> No real code execution is connected yet.\n> This screen is ready for future question-specific tests and edge cases.`
    );
  }

  function handleReset() {
    setCode(STARTER_CODE[langId]);
    setOutput(INITIAL_OUTPUT);
  }

  function togglePanel(panel: SidebarPanel) {
    setSidebarPanel((prev) => (prev === panel ? null : panel));
  }

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: "#1f2328", color: "#fff" }}
    >
      {/* Main area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* ── Left sidebar ── */}
        <aside
          className="flex w-[88px] flex-shrink-0 flex-col items-center py-4"
          style={{ background: "#2b3036", borderRight: "1px solid #3a4048" }}
        >
          {/* Language badge */}
          <div className="mb-4 flex w-full flex-col items-center gap-1 px-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded text-[11px] font-bold"
              style={{ background: lang.badgeBg, color: lang.badgeColor }}
            >
              {lang.badge}
            </div>
            <span
              className="text-center text-[10px] leading-tight"
              style={{ color: "#9ca3af" }}
            >
              {lang.label}
            </span>
          </div>

          {/* Languages */}
          <button
            onClick={() => togglePanel("languages")}
            className="flex w-full flex-col items-center gap-1 rounded px-2 py-2 transition"
            style={{
              background: sidebarPanel === "languages" ? "#24292f" : "transparent",
              color: sidebarPanel === "languages" ? "#fff" : "#9ca3af",
            }}
          >
            {/* Terminal/code icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span className="text-[10px]">Languages</span>
          </button>

          {/* Drawing */}
          <button
            onClick={() => togglePanel("drawing")}
            className="mt-1 flex w-full flex-col items-center gap-1 rounded px-2 py-2 transition"
            style={{
              background: sidebarPanel === "drawing" ? "#24292f" : "transparent",
              color: sidebarPanel === "drawing" ? "#fff" : "#9ca3af",
            }}
          >
            {/* Pencil icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            <span className="text-[10px]">Drawing</span>
          </button>

          {/* Settings at bottom */}
          <button
            className="mt-auto flex w-full flex-col items-center gap-1 rounded px-2 py-2 transition"
            style={{ color: "#9ca3af" }}
          >
            {/* Gear icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span className="text-[10px]">Settings</span>
          </button>
        </aside>

        {/* ── Language picker panel ── */}
        {sidebarPanel === "languages" && (
          <div
            className="absolute left-[88px] top-0 z-20 flex flex-col py-2 shadow-xl"
            style={{
              background: "#24292f",
              borderRight: "1px solid #3a4048",
              minWidth: 168,
            }}
          >
            <p
              className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-wider"
              style={{ color: "#6b7280" }}
            >
              Select Language
            </p>
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => selectLanguage(l.id)}
                className="flex items-center gap-3 px-4 py-2 text-left text-sm transition"
                style={{
                  background: l.id === langId ? "#1f2328" : "transparent",
                  color: l.id === langId ? "#fff" : "#9ca3af",
                }}
              >
                <span
                  className="flex h-5 w-7 flex-shrink-0 items-center justify-center rounded text-[9px] font-bold"
                  style={{ background: l.badgeBg, color: l.badgeColor }}
                >
                  {l.badge}
                </span>
                {l.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Drawing placeholder panel ── */}
        {sidebarPanel === "drawing" && (
          <div
            className="absolute left-[88px] top-0 z-20 flex flex-col items-center justify-center p-8 shadow-xl"
            style={{
              background: "#24292f",
              borderRight: "1px solid #3a4048",
              minWidth: 200,
              minHeight: 160,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            <p className="mt-3 text-sm font-medium" style={{ color: "#9ca3af" }}>
              Drawing
            </p>
            <p className="mt-1 text-center text-xs" style={{ color: "#6b7280" }}>
              Whiteboard feature coming soon.
            </p>
          </div>
        )}

        {/* ── Workspace (toolbar + split) ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top toolbar row */}
          <div
            className="flex h-[56px] flex-shrink-0"
            style={{ borderBottom: "1px solid #3a4048" }}
          >
            {/* Editor toolbar */}
            <div
              className="flex items-center gap-3 px-4"
              style={{ width: "53%", borderRight: "1px solid #3a4048" }}
            >
              <button
                onClick={handleRun}
                className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-semibold transition hover:brightness-110 active:brightness-90"
                style={{ background: "#31d67b", color: "#000" }}
              >
                {/* Play triangle */}
                <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor">
                  <path d="M0 0L9 5.5L0 11V0Z" />
                </svg>
                Run
              </button>
              <span className="text-sm" style={{ color: "#9ca3af" }}>
                Selected: {lang.label}
              </span>
            </div>

            {/* Right panel header */}
            <div className="flex flex-1 items-center justify-between px-4">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setActiveTab("output")}
                  className="pb-0.5 text-sm font-medium transition"
                  style={{
                    color: activeTab === "output" ? "#fff" : "#9ca3af",
                    borderBottom:
                      activeTab === "output"
                        ? "2px solid #fff"
                        : "2px solid transparent",
                  }}
                >
                  Program Output
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className="pb-0.5 text-sm font-medium transition"
                  style={{
                    color: activeTab === "ai" ? "#fff" : "#9ca3af",
                    borderBottom:
                      activeTab === "ai"
                        ? "2px solid #fff"
                        : "2px solid transparent",
                  }}
                >
                  AI Assist
                </button>
              </div>
              <button
                onClick={handleReset}
                className="rounded px-3 py-1 text-xs font-medium transition hover:brightness-110"
                style={{ background: "#3a4048", color: "#9ca3af" }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Split content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Monaco editor */}
            <div
              className="h-full overflow-hidden"
              style={{ width: "53%" }}
            >
              <CodeEditor code={code} language={langId} onChange={setCode} />
            </div>

            {/* Divider */}
            <div
              className="flex w-[5px] flex-shrink-0 cursor-col-resize items-center justify-center"
              style={{ background: "#3a4048" }}
            >
              <div
                className="h-12 w-[3px] rounded-full"
                style={{ background: "#4a5568" }}
              />
            </div>

            {/* Right panel content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {activeTab === "output" ? (
                <div
                  className="flex-1 overflow-auto p-4"
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: 13,
                  }}
                >
                  {output.split("\n").map((line, i) => (
                    <div
                      key={i}
                      style={{
                        color: line.startsWith(">") ? "#31d67b" : "#9ca3af",
                        lineHeight: "1.75",
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 overflow-auto p-6">
                  <p className="text-sm font-medium" style={{ color: "#fff" }}>
                    AI Assist placeholder
                  </p>
                  <p className="mt-4 text-xs" style={{ color: "#9ca3af" }}>
                    Future functionality:
                  </p>
                  <ul
                    className="mt-2 space-y-1.5 text-xs"
                    style={{ color: "#6b7280" }}
                  >
                    <li>— Interview prompts</li>
                    <li>— Hints</li>
                    <li>— Edge-case reminders</li>
                    <li>— Complexity discussion</li>
                    <li>— Structured feedback</li>
                  </ul>
                  <p className="mt-5 text-xs" style={{ color: "#4b5563" }}>
                    This panel is not connected to AI yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom status bar ── */}
      <div
        className="flex h-[54px] flex-shrink-0 items-center justify-between px-5"
        style={{ background: "#292e35", borderTop: "1px solid #3a4048" }}
      >
        {/* Left */}
        <div className="flex items-center gap-5">
          <button
            className="flex items-center gap-1.5 text-sm transition hover:text-white"
            style={{ color: "#9ca3af" }}
          >
            {/* Camera icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            Start Call
          </button>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "#9ca3af" }}>
            <span className="h-2 w-2 rounded-full" style={{ background: "#f7df1e" }} />
            Interviewer
          </div>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "#9ca3af" }}>
            <span className="h-2 w-2 rounded-full" style={{ background: "#3b82f6" }} />
            Candidate
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">
          <button
            className="flex items-center gap-1.5 text-sm transition hover:text-white"
            style={{ color: "#9ca3af" }}
          >
            {/* Bell icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            What&apos;s New
          </button>
          <button
            className="flex items-center gap-1.5 text-sm transition hover:text-white"
            style={{ color: "#9ca3af" }}
          >
            {/* Message icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
