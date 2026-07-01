"use client";

import React from "react";
import SpeechMicButton from "./SpeechMicButton";

type Props = {
  label: string;
  value: string;
  placeholder: string;
  isListening: boolean;
  isSupported: boolean;
  onMicClick: () => void;
  interimTranscript?: string;
};

export default function SpeechTextareaField({
  label,
  value,
  placeholder,
  isListening,
  isSupported,
  onMicClick,
  interimTranscript = "",
}: Props) {
  return (
    <div>
      <div
        className={`relative rounded border${isListening ? " mockr-field-listening" : ""}`}
        style={{
          borderColor: isListening ? "#31d67b55" : "#3a4048",
          transition: "border-color 0.2s",
        }}
      >
        <textarea
          readOnly
          value={value}
          placeholder={placeholder}
          className="min-h-[9rem] w-full resize-none bg-transparent px-3 pb-9 pt-2 text-sm leading-6 text-[#f1f5f9] outline-none placeholder:text-[#3a4048]"
        />
        <div className="absolute bottom-2 right-2">
          <SpeechMicButton
            isListening={isListening}
            isSupported={isSupported}
            onClick={onMicClick}
            size="sm"
            aria-label={isListening ? `Stop recording ${label}` : `Start recording ${label}`}
          />
        </div>
      </div>
      {isListening && (
        <p className="mt-1 text-[10px]" style={{ color: "#31d67b" }}>
          {interimTranscript ? `"${interimTranscript}"` : "Listening…"}
        </p>
      )}
    </div>
  );
}
