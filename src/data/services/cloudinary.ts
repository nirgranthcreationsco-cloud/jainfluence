import { supabaseAdmin } from './supabaseClient';
import { compressImage } from './imageCompressor';

export interface UploadStage {
  stage: 'compressing' | 'uploading' | 'done';
  /** 0–100 */
  progress: number;
}

/**
 * Uploads a photo or video file to Supabase storage.
 * Images are compressed before upload. Videos are uploaded as-is.
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (state: UploadStage) => void,
): Promise<string> {
  const isVideo = file.type.startsWith('video/');

  let uploadFile: Blob = file;

  if (!isVideo) {
    // ── Compress images ─────────────────────────────────────────────
    onProgress?.({ stage: 'compressing', progress: 0 });
    uploadFile = await compressImage(file);
    onProgress?.({ stage: 'compressing', progress: 100 });
  }

  // ── Upload to Supabase Storage ───────────────────────────────────
  onProgress?.({ stage: 'uploading', progress: 10 });

  const fileExt = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
  const folder = isVideo ? 'videos' : 'photos';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

  onProgress?.({ stage: 'uploading', progress: 40 });

  const { error } = await supabaseAdmin.storage
    .from('media')
    .upload(fileName, uploadFile, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.error('[Supabase Storage] Upload error, using local fallback:', error);
    onProgress?.({ stage: 'done', progress: 100 });
    return URL.createObjectURL(uploadFile);
  }

  onProgress?.({ stage: 'uploading', progress: 90 });

  const { data: publicUrlData } = supabaseAdmin.storage
    .from('media')
    .getPublicUrl(fileName);

  onProgress?.({ stage: 'done', progress: 100 });
  return publicUrlData.publicUrl;
}
