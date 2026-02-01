/**
 * Read env from app config extra (set in app.config.js from .env).
 */

import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const SUPABASE_URL = extra.EXPO_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY =
  extra.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const ADMIN_MODE = extra.EXPO_PUBLIC_ADMIN_MODE === 'true' || process.env.EXPO_PUBLIC_ADMIN_MODE === 'true';
export const ADMIN_CODE =
  extra.EXPO_PUBLIC_ADMIN_CODE ?? process.env.EXPO_PUBLIC_ADMIN_CODE ?? 'naziwatch-admin';
