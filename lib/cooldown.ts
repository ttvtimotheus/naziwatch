/**
 * Client-side anti-spam: max 3 submissions per 30 minutes per device.
 */

import * as SecureStore from 'expo-secure-store';

const KEY = 'naziwatch_submit_timestamps';
const WINDOW_MS = 30 * 60 * 1000;
const MAX_SUBMISSIONS = 3;

export async function canSubmit(): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const inWindow = timestamps.filter((t) => now - t < WINDOW_MS);
    if (inWindow.length >= MAX_SUBMISSIONS) {
      const oldest = Math.min(...inWindow);
      return { allowed: false, retryAfterSec: Math.ceil((oldest + WINDOW_MS - now) / 1000) };
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export async function recordSubmission(): Promise<void> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const inWindow = timestamps.filter((t) => now - t < WINDOW_MS);
    inWindow.push(now);
    await SecureStore.setItemAsync(KEY, JSON.stringify(inWindow));
  } catch {
    // ignore
  }
}
