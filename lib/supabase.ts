/**
 * Supabase client for NaziWatch. Uses anonymous key; RLS enforces read-only approved incidents.
 */

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/env';
import type { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

const url = SUPABASE_URL || 'https://placeholder.supabase.co';
const key = SUPABASE_ANON_KEY || 'placeholder-key-set-EXPO_PUBLIC_SUPABASE_ANON_KEY-in-env';

export const supabase = createClient<Database>(url, key);
