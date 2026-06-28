export type PracticeMode = "practice" | "assessment";

export type PracticeStage =
  | "problem"
  | "clarification"
  | "approach"
  | "coding"
  | "testing"
  | "complexity"
  | "submit";

export type SupportedLanguage = "javascript" | "python" | "cpp";

export type Difficulty = "easy" | "medium" | "hard";

export type PracticeDraft = {
  clarification: string;
  approach: string;
  codeByLanguage: Partial<Record<SupportedLanguage, string>>;
  testingPlan: string;
  edgeCases: string;
  complexity: string;
  currentStage: PracticeStage;
  selectedLanguage: SupportedLanguage;
  timerSeconds: number;
};
