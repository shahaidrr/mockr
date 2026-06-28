import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const errorDescription =
    requestUrl.searchParams.get("error_description");

  if (errorDescription) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("message", errorDescription);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("message", error.message);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
