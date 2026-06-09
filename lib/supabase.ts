import { createClient as _createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = _createClient(SUPABASE_URL, SUPABASE_KEY);

export const createClient = () => supabase;