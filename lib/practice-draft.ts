import type { PracticeDraft, PracticeStage, SupportedLanguage } from "@/types/practice";

export function buildDraftKey(userId: string, questionId: string, mode: string): string {
  return `mockr:draft:${userId}:${questionId}:${mode}`;
}

export function loadDraft(key: string): PracticeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as PracticeDraft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(key: string, draft: PracticeDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // localStorage unavailable or full
  }
}

export function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // localStorage unavailable
  }
}

export function buildEmptyDraft(
  language: SupportedLanguage,
  stage: PracticeStage = "problem"
): PracticeDraft {
  return {
    clarification: "",
    approach: "",
    codeByLanguage: {},
    testingPlan: "",
    edgeCases: "",
    complexity: "",
    currentStage: stage,
    selectedLanguage: language,
    timerSeconds: 0,
  };
}
