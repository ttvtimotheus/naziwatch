/**
 * Read env from app config extra (set in app.config.js from .env).
 */

import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const SUPABASE_URL = (extra.EXPO_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();

// Supabase erwartet den anon/public Key als JWT (beginnt mit eyJ). sb_publishable_* ist kein gültiger API-Key.
const rawCandidates = [
  extra.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  extra.EXPO_PUBLIC_SUPABASE_KEY,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  process.env.EXPO_PUBLIC_SUPABASE_KEY,
].filter((v): v is string => typeof v === 'string' && v.trim() !== '');
const jwtKey = rawCandidates.find((v) => v.trim().startsWith('eyJ'));
export const SUPABASE_ANON_KEY = (jwtKey ?? rawCandidates[0] ?? '').trim();
export const ADMIN_MODE =
  extra.EXPO_PUBLIC_ADMIN_MODE === 'true' || process.env.EXPO_PUBLIC_ADMIN_MODE === 'true';

const adminCodeRaw = extra.EXPO_PUBLIC_ADMIN_CODE ?? process.env.EXPO_PUBLIC_ADMIN_CODE ?? '';
export const ADMIN_CODE =
  typeof adminCodeRaw === 'string' && adminCodeRaw.trim() !== '' ? adminCodeRaw.trim() : 'naziwatch-admin';
