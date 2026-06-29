import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/landing-page";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims?.sub;

  return <LandingPage ctaHref={isLoggedIn ? "/questions" : "/signup"} isLoggedIn={isLoggedIn} />;
}
