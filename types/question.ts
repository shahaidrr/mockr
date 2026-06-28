export type Difficulty = "easy" | "medium" | "hard";
export type SupportedLanguage = "javascript" | "python" | "cpp";
export type QuestionStatus = "draft" | "review" | "published" | "retired";

export type QuestionExample = {
  input: string;
  output: string;
  explanation?: string;
};

export type Question = {
  id: string;
  slug: string;
  title: string;
  short_summary: string | null;
  difficulty: Difficulty;
  topic: string;
  estimated_minutes: number;
  role_level: string;
  status: QuestionStatus;
  version: number;
  problem_statement: string;
  input_description: string | null;
  output_description: string | null;
  constraints: string | null;
  examples: QuestionExample[];
  expected_time_complexity: string | null;
  expected_space_complexity: string | null;
  expected_complexity_notes: string | null;
  supported_languages: SupportedLanguage[];
  starter_code: Record<SupportedLanguage, string>;
  hints: string[];
  follow_up_prompts: string[];
  clarification_notes: string[];
  rubric_notes: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type QuestionTestCase = {
  id: string;
  question_id: string;
  label: string | null;
  input: unknown;
  expected_output: unknown;
  is_hidden: boolean;
  weight: number;
  explanation: string | null;
  created_at: string;
};

export type QuestionSummary = Pick<
  Question,
  | "id"
  | "slug"
  | "title"
  | "short_summary"
  | "difficulty"
  | "topic"
  | "estimated_minutes"
  | "supported_languages"
>;
