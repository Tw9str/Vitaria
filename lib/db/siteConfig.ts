import { prisma } from "@/lib/prismaClient";

export type ContactChannelData = {
  value: string;
  visible: boolean;
};

export type WhatsIncludedItem = {
  icon: string;
  text: string;
};

export type HeroSlide = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  cta2Text: string;
  cta2Href: string;
  cta2Visible: boolean;
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
  heroSlides: HeroSlide[] | null;
  heroAutoplay: boolean;
  heroInterval: number;
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
  heroSlides: null,
  heroAutoplay: true,
  heroInterval: 5000,
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
    heroSlides: Array.isArray(cfg.heroSlides)
      ? (cfg.heroSlides as HeroSlide[])
      : null,
    heroAutoplay: cfg.heroAutoplay ?? true,
    heroInterval: cfg.heroInterval ?? 5000,
  };
}
