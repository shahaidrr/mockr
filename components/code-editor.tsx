"use client";

import Editor from "@monaco-editor/react";

type CodeEditorProps = {
  code: string;
  language: string;
  onChange: (value: string) => void;
};

export default function CodeEditor({ code, language, onChange }: CodeEditorProps) {
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
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 22,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        tabSize: 2,
        wordWrap: "on",
        padding: { top: 16 },
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    />
  );
}
