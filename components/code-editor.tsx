"use client";

import type { editor } from "monaco-editor";
import Editor from "@monaco-editor/react";

type CodeEditorProps = {
  code: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
};

// Shared interview-mode Monaco options — suppress all suggestions/hints
// while keeping diagnostic markers (red squiggly underlines) intact.
const INTERVIEW_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineHeight: 22,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  tabSize: 2,
  wordWrap: "on",
  padding: { top: 16 },
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  // Suggestions and hints — all disabled
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  parameterHints: { enabled: false },
  wordBasedSuggestions: "off",
  inlineSuggest: { enabled: false },
  // Hover tooltips — disabled so invalid code shows squiggles but no fix popups
  hover: { enabled: false },
  // Lightbulb code actions — disabled (Off = 'off' in ShowLightbulbIconMode enum)
  lightbulb: { enabled: "off" as editor.ShowLightbulbIconMode },
  // Code lens annotations — disabled
  codeLens: false,
};

export default function CodeEditor({ code, language, onChange, readOnly = false }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      onChange={(value) => onChange(value ?? "")}
      theme="vs-dark"
      loading={
        <div
          className="flex h-full items-center justify-center text-sm"
          style={{ background: "#1f2328", color: "#9ca3af" }}
        >
          Loading editor...
        </div>
      }
      options={{ ...INTERVIEW_OPTIONS, readOnly }}
    />
  );
}
