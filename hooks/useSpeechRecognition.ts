"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechHook = {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  error: string | null;
  start: (onChunk: (chunk: string) => void) => void;
  stop: () => void;
};

export function useSpeechRecognition(): SpeechHook {
  const [isSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  });

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const onChunkRef = useRef<((chunk: string) => void) | null>(null);
  const mountedRef = useRef(true);
  const sessionIdRef = useRef(0);

  const clearRecognitionHandlers = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.onstart = null;
    recognitionRef.current.onresult = null;
    recognitionRef.current.onerror = null;
    recognitionRef.current.onend = null;
  }, []);

  const stop = useCallback(() => {
    sessionIdRef.current += 1;
    if (recognitionRef.current) {
      clearRecognitionHandlers();
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (!mountedRef.current) return;
    setIsListening(false);
    setInterimTranscript("");
    setError(null);
  }, [clearRecognitionHandlers]);

  const start = useCallback(
    (onChunk: (chunk: string) => void) => {
      if (!isSupported) return;

      if (recognitionRef.current) {
        clearRecognitionHandlers();
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }

      onChunkRef.current = onChunk;
      const sessionId = sessionIdRef.current + 1;
      sessionIdRef.current = sessionId;
      if (mountedRef.current) {
        setError(null);
        setInterimTranscript("");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
      if (!SR) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new SR() as any;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-AU";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (!mountedRef.current || sessionIdRef.current !== sessionId || recognitionRef.current !== recognition) {
          return;
        }
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (!mountedRef.current || sessionIdRef.current !== sessionId || recognitionRef.current !== recognition) {
          return;
        }
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const text = result[0].transcript.trim();
            if (text) onChunkRef.current?.(text);
          } else {
            interim += result[0].transcript;
          }
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (!mountedRef.current || sessionIdRef.current !== sessionId || recognitionRef.current !== recognition) {
          return;
        }
        if (event.error === "aborted") return;
        const messages: Record<string, string> = {
          "not-allowed": "Microphone access denied. Allow access in your browser settings.",
          "no-speech": "No speech detected. Please try again.",
          "audio-capture": "Microphone not found. Check your audio settings.",
          network: "Network error. Check your connection.",
          "service-not-allowed": "Speech service unavailable.",
        };
        setError(messages[event.error] ?? "Speech error. Please try again.");
        setIsListening(false);
      };

      recognition.onend = () => {
        if (!mountedRef.current || sessionIdRef.current !== sessionId || recognitionRef.current !== recognition) {
          return;
        }
        recognitionRef.current = null;
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [clearRecognitionHandlers, isSupported]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (recognitionRef.current) {
        clearRecognitionHandlers();
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [clearRecognitionHandlers]);

  return { isSupported, isListening, interimTranscript, error, start, stop };
}
