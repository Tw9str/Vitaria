import Link from "next/link";
import { connection } from "next/server";
import { getPublishedProducts } from "@/lib/db/products";
import { getPublicUrl } from "@/lib/storage/url";
import EmptyState from "@/components/shared/EmptyState";
import ProductsCarousel, {
  type MarqueeCard,
} from "@/components/sections/ProductsMarquee";

export default async function Products() {
  await connection();

  let products: Awaited<ReturnType<typeof getPublishedProducts>> = [];
  let viewMap: Record<string, string> = {};

  try {
    products = await getPublishedProducts({ take: 9 });
    const imageKeys = products.map((p) => p.image).filter(Boolean);
    viewMap = Object.fromEntries(imageKeys.map((k) => [k, getPublicUrl(k)]));
  } catch (err) {
    console.error("[Products] failed to load:", err);
    return (
      <section id="products" className="py-16">
        <div className="mx-auto max-w-290 px-5">
          <EmptyState
            title="Couldn't load products"
            message="Please refresh the page or check back later."
          />
        </div>
      </section>
    );
  }

  const cards: MarqueeCard[] = products.map((p) => {
    const rawSpecs = p.specs as { label: string; value: string }[] | null;
    return {
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      highlight: p.highlight,
      imgUrl: p.image ? (viewMap[p.image] ?? "") : "",
      firstSpec: rawSpecs?.[0] ?? null,
    };
  });

  return (
    <section id="products" className="py-16">
      {/* Section header */}
      <div className="mx-auto mb-8 flex max-w-290 items-end justify-between px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-leaf">
            Catalog
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-text">
            Our Products
          </h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:brightness-110"
        >
          View all <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Marquee or empty state */}
      {products.length === 0 ? (
        <div className="mx-auto max-w-290 px-5">
          <EmptyState
            title="No products yet"
            message="Our catalog is being curated. Check back soon."
          />
        </div>
      ) : (
        <ProductsCarousel cards={cards} />
      )}
    </section>
  );
}

export function ProductsSkeleton() {
  return (
    <section id="products" className="py-12">
      <div className="mx-auto max-w-290 px-5">
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[18px] border border-border bg-surface"
            >
              <div className="h-45 animate-pulse bg-white/5" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/5" />
                <div className="h-3 w-full animate-pulse rounded-full bg-white/5" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
