import { createClient as _createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase env vars", {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_KEY
  });
}

export const supabase = _createClient(
  SUPABASE_URL || "https://example.supabase.co",
  SUPABASE_KEY || "missing-anon-key"
);

export const createClient = () => supabase;