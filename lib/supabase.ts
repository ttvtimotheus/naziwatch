/**
 * Supabase client for NaziWatch. Uses anonymous key; RLS enforces read-only approved incidents.
 * Reads URL/Key from expo-constants extra (from app.config.js + .env) or process.env.
 */

import type { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};
const supabaseUrl =
  extra.EXPO_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey =
  extra.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Supabase SDK throws if key is empty; use placeholder so app loads (API calls will fail until .env is set).
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key-set-EXPO_PUBLIC_SUPABASE_ANON_KEY-in-env';

export const supabase = createClient<Database>(url, key);
