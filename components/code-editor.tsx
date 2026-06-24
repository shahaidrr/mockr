"use client";

import Editor from "@monaco-editor/react";

type CodeEditorProps = {
  code: string;
  onChange: (value: string) => void;
};

export default function CodeEditor({
  code,
  onChange,
}: CodeEditorProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-700">
      <Editor
        height="500px"
        language="javascript"
        value={code}
        onChange={(value) => onChange(value ?? "")}
        theme="vs-dark"
        loading={
          <div className="flex h-[500px] items-center justify-center bg-slate-950 text-slate-300">
            Loading editor...
          </div>
        }
        options={{
          minimap: {
            enabled: false,
          },
          fontSize: 14,
          lineHeight: 22,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 2,
          wordWrap: "on",
          padding: {
            top: 16,
          },
        }}
      />
    </div>
  );
}