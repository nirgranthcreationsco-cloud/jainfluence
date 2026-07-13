/**
 * Cloudinary Upload Service
 *
 * Compresses the image first, then uploads via XMLHttpRequest so we
 * can fire real upload-progress events back to the caller.
 *
 * Falls back to a local blob URL when credentials are not configured
 * (development / CI environments).
 */

import { compressImage } from './imageCompressor';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export interface UploadStage {
  stage: 'compressing' | 'uploading' | 'done';
  /** 0–100 */
  progress: number;
}

/**
 * @param file        The raw File from a file input.
 * @param onProgress  Optional callback fired throughout the pipeline.
 * @returns           The permanent Cloudinary secure_url (or a local blob URL as fallback).
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (state: UploadStage) => void,
): Promise<string> {
  // ── Step 1: Compress ──────────────────────────────────────────────
  onProgress?.({ stage: 'compressing', progress: 0 });
  const compressed = await compressImage(file);
  onProgress?.({ stage: 'compressing', progress: 100 });

  // ── Fallback: no credentials ──────────────────────────────────────
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.warn('[Cloudinary] Upload preset not configured — using local blob URL.');
    onProgress?.({ stage: 'done', progress: 100 });
    return URL.createObjectURL(compressed);
  }

  // ── Step 2: Upload with progress ──────────────────────────────────
  return new Promise<string>((resolve) => {
    const formData = new FormData();
    formData.append('file', compressed);
    formData.append('upload_preset', UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress?.({ stage: 'uploading', progress: pct });
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.secure_url) {
          onProgress?.({ stage: 'done', progress: 100 });
          resolve(data.secure_url as string);
        } else {
          throw new Error('No secure_url in response');
        }
      } catch (err) {
        console.error('[Cloudinary] Parse error, using blob fallback:', err);
        onProgress?.({ stage: 'done', progress: 100 });
        resolve(URL.createObjectURL(compressed));
      }
    });

    xhr.addEventListener('error', () => {
      console.error('[Cloudinary] Network error, using blob fallback');
      onProgress?.({ stage: 'done', progress: 100 });
      resolve(URL.createObjectURL(compressed));
    });

    onProgress?.({ stage: 'uploading', progress: 0 });
    xhr.send(formData);
  });
}
