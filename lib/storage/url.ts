/**
 * Build a permanent public URL for an R2 object key.
 * Keys that already start with "/" (local assets) or "http" are returned as-is.
 * Client-safe — only depends on the NEXT_PUBLIC_R2_PUBLIC_URL env var.
 */
export function getPublicUrl(key: string): string {
  if (!key) return "";
  if (key.startsWith("/") || key.startsWith("http")) return key;
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ""}/${key}`;
}
