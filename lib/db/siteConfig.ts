import { prisma } from "@/lib/prismaClient";

export type ContactChannelData = {
  value: string;
  visible: boolean;
};

export type WhatsIncludedItem = {
  icon: string;
  text: string;
};

export type SiteConfigData = {
  id: string;
  email: ContactChannelData | null;
  phone: ContactChannelData | null;
  whatsapp: ContactChannelData | null;
  facebook: ContactChannelData | null;
  instagram: ContactChannelData | null;
  twitter: ContactChannelData | null;
  linkedin: ContactChannelData | null;
  whatsIncludedTitle: string | null;
  whatsIncludedItems: WhatsIncludedItem[] | null;
  updatedAt: Date;
};

const DEFAULT_CONFIG: SiteConfigData = {
  id: "main",
  email: null,
  phone: null,
  whatsapp: null,
  facebook: null,
  instagram: null,
  twitter: null,
  linkedin: null,
  whatsIncludedTitle: null,
  whatsIncludedItems: null,
  updatedAt: new Date(0),
};

export async function getSiteConfig(): Promise<SiteConfigData> {
  const cfg = await prisma.siteConfig
    .findUnique({ where: { id: "main" } })
    .catch(() => null);
  if (!cfg) return DEFAULT_CONFIG;
  return {
    ...cfg,
    whatsIncludedItems: Array.isArray(cfg.whatsIncludedItems)
      ? (cfg.whatsIncludedItems as WhatsIncludedItem[])
      : null,
  };
}
