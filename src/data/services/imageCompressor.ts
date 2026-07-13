/**
 * Browser-side image compressor.
 *
 * Decodes any image File into a canvas, resizes it so the longest
 * edge is at most MAX_SIDE px, then re-encodes as WebP (or JPEG as
 * fallback) at QUALITY.  Returns a new File so it is a drop-in
 * replacement for the original — callers never need to change.
 *
 * Typical result: a 6 MB phone photo → ~250–400 KB before upload.
 */

const MAX_SIDE = 1080;
const QUALITY = 0.8;

export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // ── 1. Calculate target dimensions ────────────────────────────
      let { width, height } = img;
      if (width > MAX_SIDE || height > MAX_SIDE) {
        if (width >= height) {
          height = Math.round((height / width) * MAX_SIDE);
          width = MAX_SIDE;
        } else {
          width = Math.round((width / height) * MAX_SIDE);
          height = MAX_SIDE;
        }
      }

      // ── 2. Draw onto off-screen canvas ───────────────────────────
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Can't compress — fall back to original
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // ── 3. Prefer WebP; fall back to JPEG ────────────────────────
      const mimeType = canvas.toDataURL('image/webp').startsWith('data:image/webp')
        ? 'image/webp'
        : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Encoding failed — fall back to original
            resolve(file);
            return;
          }

          const ext = mimeType === 'image/webp' ? 'webp' : 'jpg';
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const compressed = new File([blob], `${baseName}.${ext}`, {
            type: mimeType,
            lastModified: Date.now(),
          });

          // Only use compressed version if it's actually smaller
          resolve(compressed.size < file.size ? compressed : file);
        },
        mimeType,
        QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Can't decode — fall back to original
      resolve(file);
    };

    img.src = objectUrl;
  });
}
