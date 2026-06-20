// Browser-side Supabase client using @supabase/ssr
// Import this in Client Components and hooks.
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
