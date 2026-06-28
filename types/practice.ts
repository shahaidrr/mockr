export type PracticeMode = "practice" | "assessment";

export type InterviewPanel = "clarification" | "approach" | "testing" | "complexity" | "submit";

export type SupportedLanguage = "javascript" | "python" | "cpp";

export type Difficulty = "easy" | "medium" | "hard";

export type PracticeDraft = {
  clarification: string;
  approach: string;
  codeByLanguage: Partial<Record<SupportedLanguage, string>>;
  testingPlan: string;
  edgeCases: string;
  complexity: string;
  currentPanel: InterviewPanel;
  selectedLanguage: SupportedLanguage;
  timerSeconds: number;
};
