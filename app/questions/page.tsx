import { fetchPublishedQuestions } from "@/lib/questions-service";
import QuestionLibraryClient from "./question-library-client";
import type { QuestionSummary } from "@/types/question";

export const metadata = { title: "Question Library — MOCKR.AI" };

export default async function QuestionsPage() {
  let questions: QuestionSummary[] = [];
  try {
    questions = await fetchPublishedQuestions();
  } catch {
    // render empty state
  }

  return (
    <main className="px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <QuestionLibraryClient questions={questions} />
      </div>
    </main>
  );
}
