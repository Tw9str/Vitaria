import { Suspense } from "react";
import HeroSlider from "@/components/hero/HeroSlider";
import Products, { ProductsSkeleton } from "@/components/sections/Products";
import WhyVitaria from "@/components/sections/WhyVitaria";
import WholesaleDetails from "@/components/sections/WholesaleDetails";
import Contact from "@/components/sections/Contact";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbsJsonLd } from "@/lib/jsonld";
import { getSiteConfig } from "@/lib/db/siteConfig";

export default async function Home() {
  const config = await getSiteConfig().catch(() => null);

  return (
    <main id="main">
      <JsonLd
        id="jsonld-breadcrumbs"
        data={breadcrumbsJsonLd([
          { name: "Home", path: "/" },
          { name: "Wholesale", path: "/#wholesale" },
        ])}
      />
      <HeroSlider
        slides={config?.heroSlides ?? undefined}
        autoplay={config?.heroAutoplay ?? undefined}
        interval={config?.heroInterval ?? undefined}
      />
      <Suspense fallback={<ProductsSkeleton />}>
        <Products />
      </Suspense>
      <WhyVitaria />
      <WholesaleDetails />
      <Contact />
    </main>
  );
}
