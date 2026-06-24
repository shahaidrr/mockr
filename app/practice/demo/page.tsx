import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PracticeWorkspace from "./practice-workspace";

export default async function DemoPracticePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?next=/practice/demo");
  }

  return <PracticeWorkspace />;
}