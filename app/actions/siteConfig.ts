"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prismaClient";
import { revalidatePath } from "next/cache";
import { appendLog } from "@/lib/db/logger";

export type SiteConfigActionState = {
  success?: boolean;
  formError?: string;
} | null;

export type ChannelKey =
  | "email"
  | "phone"
  | "whatsapp"
  | "facebook"
  | "instagram"
  | "twitter"
  | "linkedin";

const CHANNELS: ChannelKey[] = [
  "email",
  "phone",
  "whatsapp",
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
];

export async function updateSiteConfigAction(
  _prev: SiteConfigActionState,
  formData: FormData,
): Promise<SiteConfigActionState> {
  const session = await auth();
  if (!session?.user?.email) return { formError: "Not authenticated." };

  const data: Record<ChannelKey, { value: string; visible: boolean } | null> =
    {} as never;

  for (const key of CHANNELS) {
    const value = String(formData.get(`${key}_value`) ?? "").trim();
    const visible = formData.get(`${key}_visible`) === "on";
    // Only persist a channel if a value has been set
    data[key] = value ? { value, visible } : null;
  }

  try {
    await prisma.siteConfig.upsert({
      where: { id: "main" },
      update: { ...data },
      create: { id: "main", ...data },
    });
  } catch {
    return { formError: "Failed to save. Please try again." };
  }

  void appendLog({
    actorEmail: session.user.email,
    actorName: session.user.name ?? null,
    actorId: session.user.id ?? null,
    action: "SITE_CONFIG_UPDATED",
    entity: "profile",
    entityTitle: "Site contact config",
    detail: "Contact channels updated",
  });

  revalidatePath("/");
  revalidatePath("/admin/contact");
  return { success: true };
}

export async function updateWhatsIncludedAction(
  _prev: SiteConfigActionState,
  formData: FormData,
): Promise<SiteConfigActionState> {
  const session = await auth();
  if (!session?.user?.email) return { formError: "Not authenticated." };

  const whatsIncludedTitle =
    String(formData.get("whatsIncludedTitle") ?? "").trim() || null;

  let whatsIncludedItems = null;
  try {
    const raw = String(formData.get("whatsIncludedItems") ?? "");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) whatsIncludedItems = parsed;
  } catch {
    // ignore
  }

  try {
    await prisma.siteConfig.upsert({
      where: { id: "main" },
      update: { whatsIncludedTitle, whatsIncludedItems },
      create: { id: "main", whatsIncludedTitle, whatsIncludedItems },
    });
  } catch {
    return { formError: "Failed to save. Please try again." };
  }

  void appendLog({
    actorEmail: session.user.email,
    actorName: session.user.name ?? null,
    actorId: session.user.id ?? null,
    action: "SITE_CONFIG_UPDATED",
    entity: "profile",
    entityTitle: "Site contact config",
    detail: "What's included card updated",
  });

  revalidatePath("/");
  revalidatePath("/admin/contact");
  return { success: true };
}

export async function updateHeroSlidesAction(
  _prev: SiteConfigActionState,
  formData: FormData,
): Promise<SiteConfigActionState> {
  const session = await auth();
  if (!session?.user?.email) return { formError: "Not authenticated." };

  let heroSlides = null;
  try {
    const raw = String(formData.get("heroSlides") ?? "");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) heroSlides = parsed;
  } catch {
    return { formError: "Invalid slides data." };
  }

  try {
    await prisma.siteConfig.upsert({
      where: { id: "main" },
      update: { heroSlides },
      create: { id: "main", heroSlides },
    });
  } catch {
    return { formError: "Failed to save. Please try again." };
  }

  void appendLog({
    actorEmail: session.user.email,
    actorName: session.user.name ?? null,
    actorId: session.user.id ?? null,
    action: "SITE_CONFIG_UPDATED",
    entity: "profile",
    entityTitle: "Hero slides",
    detail: `Hero slides updated (${(heroSlides ?? []).length} slides)`,
  });

  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { success: true };
}

export async function updateHeroSettingsAction(
  _prev: SiteConfigActionState,
  formData: FormData,
): Promise<SiteConfigActionState> {
  const session = await auth();
  if (!session?.user?.email) return { formError: "Not authenticated." };

  const heroAutoplay = formData.get("heroAutoplay") === "on";
  const rawInterval = Number(formData.get("heroInterval") ?? 5000);
  const heroInterval = Number.isFinite(rawInterval)
    ? Math.max(1000, Math.min(30000, rawInterval))
    : 5000;

  try {
    await prisma.siteConfig.upsert({
      where: { id: "main" },
      update: { heroAutoplay, heroInterval },
      create: { id: "main", heroAutoplay, heroInterval },
    });
  } catch {
    return { formError: "Failed to save. Please try again." };
  }

  void appendLog({
    actorEmail: session.user.email,
    actorName: session.user.name ?? null,
    actorId: session.user.id ?? null,
    action: "SITE_CONFIG_UPDATED",
    entity: "profile",
    entityTitle: "Hero settings",
    detail: `Autoplay: ${heroAutoplay}, Interval: ${heroInterval}ms`,
  });

  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { success: true };
}
