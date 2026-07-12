/**
 * Cloudinary Upload Service
 * Uploads a File to Cloudinary using an unsigned upload preset.
 * Falls back to a local blob URL if credentials are not configured,
 * so the rest of the app works during development / testing.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export async function uploadToCloudinary(file: File): Promise<string> {
  // If no preset is configured, return a local object URL as fallback
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.warn('[Cloudinary] Upload preset not configured. Using local blob URL.');
    return URL.createObjectURL(file);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!res.ok) {
      throw new Error(`Cloudinary HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!data.secure_url) {
      throw new Error('No secure_url in Cloudinary response');
    }

    return data.secure_url as string;
  } catch (err) {
    console.error('[Cloudinary] Upload failed, using local blob fallback:', err);
    return URL.createObjectURL(file);
  }
}
