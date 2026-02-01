/**
 * Upload incident media to Supabase Storage and insert media row.
 */

import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';

const BUCKET = 'incident-media';

function randomId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function uploadIncidentMedia(
  incidentId: string,
  localUri: string,
  type: 'image' | 'video'
): Promise<void> {
  const ext = type === 'image' ? 'jpg' : 'mp4';
  const path = `${incidentId}/${randomId()}.${ext}`;

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const body = base64ToUint8Array(base64);

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: type === 'image' ? 'image/jpeg' : 'video/mp4',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.rpc('insert_media', {
    p_incident_id: incidentId,
    p_type: type,
    p_url: path,
  });
  if (insertError) throw insertError;
}
