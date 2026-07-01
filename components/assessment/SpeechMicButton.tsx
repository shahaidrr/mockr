"use client";

import React from "react";

type Props = {
  isListening: boolean;
  isSupported: boolean;
  onClick: () => void;
  size?: "md" | "sm";
  "aria-label"?: string;
};

export default function SpeechMicButton({
  isListening,
  isSupported,
  onClick,
  size = "md",
  "aria-label": ariaLabel = "Toggle microphone",
}: Props) {
  const dim = size === "sm" ? 28 : 40;
  const iconSize = size === "sm" ? 13 : 18;
  const activeClass = size === "sm" ? "mockr-mic-active-sm" : "mockr-mic-active";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isSupported}
      aria-label={ariaLabel}
      title={!isSupported ? "Speech recognition not supported in this browser" : undefined}
      className={isListening ? activeClass : ""}
      style={{
        width: dim,
        height: dim,
        borderRadius: "50%",
        border: `1.5px solid ${isListening ? "#31d67b" : "#3a4048"}`,
        background: isListening ? "#0d2d1c" : "#1a2332",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isSupported ? "pointer" : "not-allowed",
        opacity: isSupported ? 1 : 0.4,
        flexShrink: 0,
        transition: "border-color 0.2s, background 0.2s",
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke={isListening ? "#31d67b" : "#6b7280"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
}
