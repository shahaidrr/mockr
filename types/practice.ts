export type PracticeMode = "practice" | "assessment";

export type InterviewPanel = "overview" | "clarification" | "approach" | "code" | "testing" | "submit";

export type SupportedLanguage = "javascript" | "python" | "cpp";

export type Difficulty = "easy" | "medium" | "hard";

export type PracticeDraft = {
  clarification: string;
  clarificationSkipped?: boolean;
  approach: string;
  approachSubmitted?: boolean;
  codeByLanguage: Partial<Record<SupportedLanguage, string>>;
  testingPlan: string;
  edgeCases: string;
  complexity: string;
  currentPanel: InterviewPanel;
  selectedLanguage: SupportedLanguage;
  timerSeconds: number;
};
