import { getSiteConfig } from "@/lib/db/siteConfig";
import HeroEditor from "@/components/admin/HeroEditor";

export const metadata = { title: "Hero Slides" };

export default async function HeroPage() {
  const config = await getSiteConfig();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Hero slides</h1>
        <p className="text-xs text-muted mt-0.5">
          Manage the carousel shown at the top of the home page.
        </p>
      </div>
      <HeroEditor
        initialSlides={config.heroSlides ?? []}
        initialAutoplay={config.heroAutoplay}
        initialInterval={config.heroInterval}
      />
    </div>
  );
}
