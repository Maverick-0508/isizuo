import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const BUCKET = 'profile-photos';
const MAX_WIDTH = 1080;
const MAX_HEIGHT = 1080;
const JPEG_QUALITY = 0.8;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

async function compressImage(uri: string): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: MAX_WIDTH, height: MAX_HEIGHT } }],
    { compress: JPEG_QUALITY, format: SaveFormat.JPEG }
  );
  return result.uri;
}

export async function uploadProfilePhoto(
  uri: string,
  userId: string,
  index: number
): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && info.size && info.size > MAX_FILE_SIZE_BYTES) {
      console.warn(`[Upload] File too large: ${info.size} bytes (max ${MAX_FILE_SIZE_BYTES})`);
      return null;
    }

    const compressed = await compressImage(uri);

    const ext = 'jpg';
    const fileName = `${userId}/${index}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, {
        uri: compressed,
        type: 'image/jpeg',
        name: fileName,
      } as any, {
        cacheControl: '3600',
        upsert: true,
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
