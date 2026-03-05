/**
 * lib/storage.ts
 *
 * Pure server-side R2 / presigned-URL helpers.
 * Import these in Server Actions or Route Handlers only - never in Client Components.
 */

import { PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET } from "@/lib/storage/r2Client";
import { getPublicUrl } from "@/lib/storage/url";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const UPLOAD_URL_TTL = 60; // 1 min

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FileDescriptor = {
  filename: string;
  contentType: string;
  size: number;
};

export type PresignedUpload = {
  key: string;
  uploadUrl: string;
  /** Permanent public URL (bucket is public). */
  viewUrl: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function validateImageFile(file: FileDescriptor): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.contentType)) {
    throw new Error("Only JPEG, PNG, and WebP images are allowed.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`File "${file.filename}" exceeds the 8 MB limit.`);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate presigned upload + view URLs for one or more product images.
 * Validates type/size before issuing any URL.
 */
export async function presignProductImageUploads(
  productId: string,
  files: FileDescriptor[],
): Promise<PresignedUpload[]> {
  files.forEach(validateImageFile);

  try {
    return await Promise.all(
      files.map(async (file) => {
        const safe = sanitizeFilename(file.filename);
        const key = `products/${productId}/${crypto.randomUUID()}-${safe}`;

        const uploadUrl = await getSignedUrl(
          r2,
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            ContentType: file.contentType,
          }),
          { expiresIn: UPLOAD_URL_TTL },
        );

        return { key, uploadUrl, viewUrl: getPublicUrl(key) };
      }),
    );
  } catch (cause) {
    if (cause instanceof Error && cause.message.includes("allowed"))
      throw cause;
    if (cause instanceof Error && cause.message.includes("exceeds"))
      throw cause;
    throw new Error("Failed to generate upload URLs. Check R2 credentials.", {
      cause,
    });
  }
}

/**
 * Delete one or more R2 objects by key.
 * Silently skips empty/null keys. Errors are logged but not rethrown so
 * a failed delete never blocks the caller's main operation.
 */
export async function deleteStorageKeys(keys: string[]): Promise<void> {
  const valid = keys.filter(Boolean);
  if (!valid.length) return;

  try {
    await r2.send(
      new DeleteObjectsCommand({
        Bucket: R2_BUCKET,
        Delete: { Objects: valid.map((Key) => ({ Key })), Quiet: true },
      }),
    );
  } catch (cause) {
    // Log but don't rethrow - storage cleanup should never crash the caller
    console.error("[storage] deleteStorageKeys failed:", cause);
  }
}

/**
 * Generate a presigned upload + view URL for a user avatar.
 * Stored at avatars/<userId>/<uuid>-<filename>.
 */
export async function presignAvatarUpload(
  userId: string,
  file: FileDescriptor,
): Promise<PresignedUpload> {
  validateImageFile(file);

  const safe = sanitizeFilename(file.filename);
  const key = `avatars/${userId}/${crypto.randomUUID()}-${safe}`;

  const uploadUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: file.contentType,
    }),
    { expiresIn: UPLOAD_URL_TTL },
  );

  return { key, uploadUrl, viewUrl: getPublicUrl(key) };
}

/**
 * Generate a presigned upload + view URL for a hero slide image.
 * Stored at hero/<slideId>/<uuid>-<filename>.
 */
export async function presignHeroImageUpload(
  slideId: string,
  file: FileDescriptor,
): Promise<PresignedUpload> {
  validateImageFile(file);

  const safe = sanitizeFilename(file.filename);
  const key = `hero/${slideId}/${crypto.randomUUID()}-${safe}`;

  try {
    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: file.contentType,
      }),
      { expiresIn: UPLOAD_URL_TTL },
    );
    return { key, uploadUrl, viewUrl: getPublicUrl(key) };
  } catch (cause) {
    if (cause instanceof Error && cause.message.includes("allowed"))
      throw cause;
    if (cause instanceof Error && cause.message.includes("exceeds"))
      throw cause;
    throw new Error(
      "Failed to generate hero upload URL. Check R2 credentials.",
      { cause },
    );
  }
}

/**
 * Delete all R2 objects associated with a product (hero + all gallery images).
 * Designed to be called before or after the DB record is deleted.
 */
export async function deleteProductStorage(
  heroKey: string | null,
  galleryKeys: string[],
): Promise<void> {
  const all = [heroKey, ...galleryKeys].filter((k): k is string => Boolean(k));
  await deleteStorageKeys(all);
}
