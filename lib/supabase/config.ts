type SupabaseConfig = {
  supabaseUrl: string;
  supabaseKey: string;
};

function getSupabaseKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function getSupabaseKeyErrorMessage(supabaseKey: string) {
  if (supabaseKey.startsWith("b_publishable_")) {
    return (
      "Supabase publishable key appears malformed. It should start with " +
      '"sb_publishable_".'
    );
  }

  return (
    "Supabase key appears invalid. Use a publishable key starting with " +
    '"sb_publishable_" or an anon key starting with "eyJ".'
  );
}

export function getSupabaseConfig(): SupabaseConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = getSupabaseKey();

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable."
    );
  }

  if (!supabaseKey) {
    throw new Error(
      "Missing Supabase public key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const hasValidPrefix =
    supabaseKey.startsWith("sb_publishable_") ||
    supabaseKey.startsWith("eyJ");

  if (!hasValidPrefix) {
    throw new Error(getSupabaseKeyErrorMessage(supabaseKey));
  }

  return {
    supabaseUrl,
    supabaseKey,
  };
}
