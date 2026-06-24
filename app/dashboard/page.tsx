import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2">You are logged in.</p>

      <form action="/auth/signout" method="post" className="mt-6">
        <button
          type="submit"
          className="rounded-md border px-4 py-2"
        >
          Log out
        </button>
      </form>
    </main>
  );
}