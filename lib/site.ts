export const SITE = {
  name: "VITARIA",
  legalName: "VITARIA",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.vitaria.com",
  locale: "en_US",
  email: "wholesale@vitaria.com",
  phone: "+1-000-000-0000",
  address: {
    streetAddress: "Your Address",
    addressLocality: "Your City",
    addressRegion: "Your State",
    postalCode: "00000",
    addressCountry: "US",
  },
  social: [] as string[],
};

/**
 * Build a permanent public URL for an R2 object key.
 * Keys that already start with "/" (local assets) or "http" are returned as-is.
 */
export function getPublicUrl(key: string): string {
  if (!key) return "";
  if (key.startsWith("/") || key.startsWith("http")) return key;
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ""}/${key}`;
}
