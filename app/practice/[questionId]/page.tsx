import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchQuestionById, fetchPublicTestCases } from "@/lib/questions-service";
import PracticeSession from "./practice-session";
import type { PracticeMode, SupportedLanguage } from "@/types/practice";

const VALID_MODES: PracticeMode[] = ["practice", "assessment"];
const VALID_LANGUAGES: SupportedLanguage[] = ["javascript", "python", "cpp"];

type Props = {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ mode?: string; language?: string }>;
};

export default async function PracticePage({ params, searchParams }: Props) {
  const [{ questionId }, sp] = await Promise.all([params, searchParams]);

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/login?next=/practice/${questionId}`);
  }

  const [question, testCases] = await Promise.all([
    fetchQuestionById(questionId),
    fetchPublicTestCases(questionId),
  ]);

  if (!question) notFound();

  const mode: PracticeMode = VALID_MODES.includes(sp.mode as PracticeMode)
    ? (sp.mode as PracticeMode)
    : "practice";

  const language: SupportedLanguage = VALID_LANGUAGES.includes(sp.language as SupportedLanguage)
    ? (sp.language as SupportedLanguage)
    : "javascript";

  return (
    <PracticeSession
      question={question}
      testCases={testCases}
      initialMode={mode}
      initialLanguage={language}
      userId={user.id}
    />
  );
}
