"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prismaClient";
import { revalidatePath } from "next/cache";
import { appendLog } from "@/lib/logger";

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

  const whatsIncludedTitle =
    String(formData.get("whatsIncludedTitle") ?? "").trim() || null;

  let whatsIncludedItems = null;
  try {
    const raw = String(formData.get("whatsIncludedItems") ?? "");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) whatsIncludedItems = parsed;
  } catch {
    // ignore – keep null
  }

  try {
    await prisma.siteConfig.upsert({
      where: { id: "main" },
      update: { ...data, whatsIncludedTitle, whatsIncludedItems },
      create: { id: "main", ...data, whatsIncludedTitle, whatsIncludedItems },
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
