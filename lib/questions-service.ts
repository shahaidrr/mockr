import { createClient } from "@/lib/supabase/server";
import type { Question, QuestionSummary, QuestionTestCase } from "@/types/question";

export async function fetchPublishedQuestions(): Promise<QuestionSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, slug, title, short_summary, difficulty, topic, estimated_minutes, supported_languages"
    )
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as QuestionSummary[];
}

export async function fetchQuestionBySlug(slug: string): Promise<Question | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data as Question;
}

export async function fetchQuestionById(id: string): Promise<Question | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data as Question;
}

export async function fetchPublicTestCases(questionId: string): Promise<QuestionTestCase[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_test_cases")
    .select("*")
    .eq("question_id", questionId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as QuestionTestCase[];
}
