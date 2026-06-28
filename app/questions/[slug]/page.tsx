import { notFound } from "next/navigation";
import { fetchQuestionBySlug } from "@/lib/questions-service";
import QuestionDetailClient from "./question-detail-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const question = await fetchQuestionBySlug(slug);
  return {
    title: question ? `${question.title} — MOCKR.AI` : "Question Not Found — MOCKR.AI",
  };
}

export default async function QuestionDetailPage({ params }: Props) {
  const { slug } = await params;
  const question = await fetchQuestionBySlug(slug);

  if (!question) {
    notFound();
  }

  return (
    <main className="px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <QuestionDetailClient question={question} />
      </div>
    </main>
  );
}
