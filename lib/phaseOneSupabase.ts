import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { PhaseOneDatabase } from "./phaseOneDatabase.types";
// Reuse the existing authenticated client; no second auth session or keys.
export const phaseOneSupabase =
  supabase as unknown as SupabaseClient<PhaseOneDatabase>;
