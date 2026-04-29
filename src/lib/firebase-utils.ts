import { storage } from "./firebase";
import { ref, uploadString, getDownloadURL, uploadBytes } from "firebase/storage";

/**
 * Uploads a base64 image string to Firebase Storage
 * @param base64Str The base64 string including data:image/...;base64,
 * @param path The destination path in storage
 * @returns The download URL of the uploaded image
 */
export async function uploadImageBase64(base64Str: string, path: string): Promise<string> {
  if (!base64Str || !base64Str.startsWith('data:image')) {
    // If it's already a URL or not an image string, return as is
    return base64Str;
  }

  try {
    const storageRef = ref(storage, path);
    // Firebase supports directly uploading data URLs
    const uploadResult = await uploadString(storageRef, base64Str, 'data_url');
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image to Firebase Storage:", error);
    throw error;
  }
}

/**
 * Uploads a Blob image to Firebase Storage (more efficient than base64)
 * @param blob The image binary data
 * @param path The destination path
 * @returns The download URL
 */
export async function uploadImageBlob(blob: Blob, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const uploadResult = await uploadBytes(storageRef, blob, {
      contentType: blob.type || 'image/webp'
    });
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image blob to Firebase Storage:", error);
    throw error;
  }
}
