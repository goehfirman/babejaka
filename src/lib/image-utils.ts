/**
 * Compresses a base64 image string by resizing it and reducing quality
 * @param base64 The original base64 string
 * @param maxWidth Optional maximum width (default 1024)
 * @param quality Optional quality from 0 to 1 (default 0.7)
 * @returns Compressed base64 string
 */
export async function compressImage(
  base64: string, 
  maxWidth: number = 1024, 
  quality: number = 0.7
): Promise<string> {
  // If it's not a base64 image string, return as is (e.g. already a URL)
  if (!base64 || !base64.startsWith('data:image')) return base64;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // Try webp first, fallback to jpeg
      let compressedBase64 = canvas.toDataURL('image/webp', quality);
      if (compressedBase64.length > base64.length) {
         // If webp is somehow larger (rare), fallback to jpeg
         compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(compressedBase64);
    };
    img.onerror = (err) => reject(err);
  });
}

/**
 * Compresses a base64 image and returns it as a Blob for efficient upload
 */
export async function compressImageToBlob(
  base64: string,
  maxWidth: number = 1024,
  quality: number = 0.7
): Promise<Blob | string> {
  if (!base64 || !base64.startsWith('data:image')) return base64;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(base64);
          }
        },
        'image/webp',
        quality
      );
    };
    img.onerror = (err) => reject(err);
  });
}
