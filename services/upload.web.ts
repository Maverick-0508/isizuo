import { supabase } from '@/lib/supabase';

const BUCKET = 'profile-photos';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function uploadProfilePhoto(
  uri: string,
  userId: string,
  index: number
): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    if (blob.size > MAX_FILE_SIZE_BYTES) {
      console.warn(`[Upload] File too large: ${blob.size} bytes (max ${MAX_FILE_SIZE_BYTES})`);
      return null;
    }

    const ext = 'jpg';
    const fileName = `${userId}/${index}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: blob.type || 'image/jpeg',
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('[Upload] Photo upload failed:', error);
    return null;
  }
}

export async function uploadProfilePhotos(
  photos: string[],
  userId: string
): Promise<string[]> {
  const uploaded: string[] = [];
  for (let i = 0; i < photos.length; i++) {
    const uri = photos[i];
    if (!uri) continue;
    if (uri.startsWith('https://') || uri.startsWith('http://')) {
      uploaded.push(uri);
      continue;
    }
    const url = await uploadProfilePhoto(uri, userId, i);
    if (url) uploaded.push(url);
  }
  return uploaded;
}

export async function deleteProfilePhoto(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([path]);
    return !error;
  } catch {
    return false;
  }
}
