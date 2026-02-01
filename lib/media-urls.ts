/**
 * Signed URLs for incident media (Storage bucket is private).
 */

import { supabase } from '@/lib/supabase';

const BUCKET = 'incident-media';
const EXPIRY_SEC = 3600;

export async function getSignedMediaUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, EXPIRY_SEC);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function getSignedMediaUrls(storagePaths: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  await Promise.all(
    storagePaths.map(async (path) => {
      const url = await getSignedMediaUrl(path);
      if (url) out.set(path, url);
    })
  );
  return out;
}
