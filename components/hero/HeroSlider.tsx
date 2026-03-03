"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/db/siteConfig";
import { getPublicUrl } from "@/lib/site";

// ─── fallback data ────────────────────────────────────────────────────────────

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    image: "/images/hero/slide-1.jpg",
    title: "Premium Wholesale Products",
    subtitle: "Designed for retailers. Built for repeat customers.",
    ctaText: "Request Wholesale Catalog",
    ctaHref: "#contact",
    cta2Text: "View products",
    cta2Href: "/products",
    cta2Visible: true,
  },
  {
    id: "slide-2",
    image: "/images/hero/slide-2.jpg",
    title: "Retail-Ready Collections",
    subtitle: "High-margin product lines for modern stores.",
    ctaText: "View Products",
    ctaHref: "/products",
    cta2Text: "Get in touch",
    cta2Href: "#contact",
    cta2Visible: true,
  },
  {
    id: "slide-3",
    image: "/images/hero/slide-3.jpg",
    title: "Trusted Wholesale Partner",
    subtitle: "Reliable supply, consistent quality, strong branding.",
    ctaText: "Wholesale Details",
    ctaHref: "#wholesale",
    cta2Text: "View products",
    cta2Href: "/products",
    cta2Visible: true,
  },
];

// ─── component ────────────────────────────────────────────────────────────────

type HeroSliderProps = {
  slides?: HeroSlide[];
  autoplay?: boolean;
  interval?: number;
  swipeThreshold?: number;
};

export default function HeroSlider({
  slides: slidesProp,
  autoplay = true,
  interval = 5000,
  swipeThreshold = 40,
}: HeroSliderProps) {
  const activeSlides = slidesProp?.length ? slidesProp : FALLBACK_SLIDES;
  const slideCount = activeSlides.length;

  const [active, setActive] = useState(0);
  const [announce, setAnnounce] = useState("");

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoplayAllowed = useRef(autoplay);
  const pausedRef = useRef(false);
  const touchStartX = useRef<number | null>(null);

  // ── timer ────────────────────────────────────────────────────────────────────

  function clearTick() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function startTick() {
    clearTick();
    if (!pausedRef.current && autoplayAllowed.current) {
      tickRef.current = setInterval(
        () => setActive((v) => (v + 1) % slideCount),
        interval,
      );
    }
  }

  function goTo(i: number) {
    setActive(((i % slideCount) + slideCount) % slideCount);
    startTick();
  }

  // ── effects ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    startTick();
    const onVisibilityChange = () =>
      document.hidden ? clearTick() : startTick();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearTick();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const s = activeSlides[active];
    if (s) setAnnounce(`${s.title}: ${s.subtitle}`);
  }, [active, activeSlides]);

  // ── handlers ─────────────────────────────────────────────────────────────────

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const startX = touchStartX.current;
    const endX = e.changedTouches[0]?.clientX ?? null;
    touchStartX.current = null;
    if (startX == null || endX == null) return;
    const delta = endX - startX;
    if (delta > swipeThreshold) goTo(active - 1);
    else if (delta < -swipeThreshold) goTo(active + 1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      goTo(active - 1);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      goTo(active + 1);
      e.preventDefault();
    }
  }

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured wholesale highlights"
      className="relative h-[78vh] min-h-130 w-full overflow-hidden"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => {
        pausedRef.current = true;
        clearTick();
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
        startTick();
      }}
      onFocusCapture={(e) => {
        if (
          e.target instanceof HTMLElement &&
          (e.target.tagName === "A" || e.target.tagName === "BUTTON")
        ) {
          pausedRef.current = true;
          clearTick();
        }
      }}
      onBlurCapture={(e) => {
        if (
          e.target instanceof HTMLElement &&
          (e.target.tagName === "A" || e.target.tagName === "BUTTON")
        ) {
          pausedRef.current = false;
          startTick();
        }
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div aria-live="polite" className="sr-only">
        {announce}
      </div>

      {activeSlides.map((slide, i) => {
        const isActive = i === active;
        const preload =
          i === active ||
          i === (active + 1) % slideCount ||
          i === (active - 1 + slideCount) % slideCount;
        const imgSrc = getPublicUrl(slide.image);
        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 2 : 1 }}
          >
            <Image
              src={imgSrc}
              alt={slide.title}
              fill
              priority={preload}
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/20" />
            <div className="relative z-10 mx-auto flex h-full max-w-290 items-center px-6">
              <div className="max-w-170">
                <h1 className="text-[clamp(28px,4vw,64px)] leading-[1.05] tracking-[-0.02em] text-white/95">
                  {slide.title}
                </h1>
                <p className="mt-3 text-lg text-white/75">{slide.subtitle}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={slide.ctaHref}
                    tabIndex={isActive ? undefined : -1}
                    className="inline-flex items-center justify-center rounded-full border border-gold/60 bg-linear-to-br from-gold/95 to-gold/65 px-6 py-3 font-semibold text-black transition hover:brightness-110"
                  >
                    {slide.ctaText}
                  </Link>
                  {(slide.cta2Visible ?? true) && (
                    <Link
                      href={slide.cta2Href || "#products"}
                      tabIndex={isActive ? undefined : -1}
                      className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white/90 transition hover:bg-white/10"
                    >
                      {slide.cta2Text || "View product lines"}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button
        onClick={() => goTo(active - 1)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/45 transition hover:bg-black/60"
      >
        <ChevronIcon d="M15 18l-6-6 6-6" />
      </button>

      <button
        onClick={() => goTo(active + 1)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/45 transition hover:bg-black/60"
      >
        <ChevronIcon d="M9 18l6-6-6-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {activeSlides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}: ${slide.title}`}
            aria-current={i === active ? "true" : undefined}
            className={[
              "h-3 w-3 cursor-pointer rounded-full border transition",
              i === active
                ? "border-gold/80 bg-gold"
                : "border-white/35 bg-white/25 hover:bg-white/40",
            ].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function ChevronIcon({ d }: { d: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
