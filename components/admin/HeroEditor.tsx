"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import {
  updateHeroSlidesAction,
  updateHeroSettingsAction,
} from "@/app/actions/siteConfig";
import {
  presignHeroImageUploadAction,
  deleteStorageKeysAction,
} from "@/app/actions/createUploadUrl";
import { imageFileSchema, ACCEPTED_IMAGE_TYPES } from "@/lib/validators";
import type { HeroSlide } from "@/lib/db/siteConfig";
import { getPublicUrl } from "@/lib/site";
import Alert from "@/components/shared/Alert";
import Spinner from "@/components/shared/Spinner";

// ─── helpers ─────────────────────────────────────────────────────────────────

function putWithProgress(
  url: string,
  file: File,
  onProgress: (p: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}

function makeBlankSlide(): HeroSlide {
  return {
    id: crypto.randomUUID(),
    image: "",
    title: "",
    subtitle: "",
    ctaText: "",
    ctaHref: "",
    cta2Text: "",
    cta2Href: "",
    cta2Visible: true,
  };
}

// ─── constants ────────────────────────────────────────────────────────────────

const ACCEPTED = ACCEPTED_IMAGE_TYPES.join(",");

const CTA_PRESETS = [
  "#contact",
  "#products",
  "#wholesale",
  "/products",
] as const;

const TABS = [
  {
    key: "slides" as const,
    label: "Slides",
    desc: "Add, edit and reorder slides",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <path d="M8 6V4" />
        <path d="M16 6V4" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "settings" as const,
    label: "Settings",
    desc: "Autoplay and speed",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

type TabKey = (typeof TABS)[number]["key"];

// ─── component ────────────────────────────────────────────────────────────────

type Props = {
  initialSlides: HeroSlide[];
  initialAutoplay: boolean;
  initialInterval: number;
};

export default function HeroEditor({
  initialSlides,
  initialAutoplay,
  initialInterval,
}: Props) {
  // ── tab ─────────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<TabKey>("slides");

  // ── slides state ─────────────────────────────────────────────────────────────
  const [slides, setSlides] = useState<HeroSlide[]>(() =>
    initialSlides.length ? initialSlides : [makeBlankSlide()],
  );
  const [selectedId, setSelectedId] = useState<string>(
    () => slides[0]?.id ?? "",
  );
  // Local preview URLs keyed by `__local__${slideId}` during active uploads
  const [viewUrls, setViewUrls] = useState<Record<string, string>>({});

  // ── upload state ─────────────────────────────────────────────────────────────
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slideErrors, setSlideErrors] = useState<
    Record<
      string,
      { image?: string; title?: string; subtitle?: string; ctaText?: string }
    >
  >({});

  // ── settings state ───────────────────────────────────────────────────────────
  const [autoplay, setAutoplay] = useState(initialAutoplay);
  const [intervalMs, setIntervalMs] = useState(initialInterval);

  // ── server actions ───────────────────────────────────────────────────────────
  const [slidesState, slidesAction, slidesPending] = useActionState(
    updateHeroSlidesAction,
    null,
  );
  const [settingsState, settingsAction, settingsPending] = useActionState(
    updateHeroSettingsAction,
    null,
  );

  // ── derived ────────────────────────────────────────────────────────────────
  const selectedSlide = slides.find((s) => s.id === selectedId) ?? slides[0];
  const selectedIdx = slides.findIndex((s) => s.id === selectedId);

  // ── slide helpers ─────────────────────────────────────────────────────────
  function updateSlide(id: string, patch: Partial<HeroSlide>) {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
    const toClear = Object.keys(patch).filter((k) =>
      ["image", "title", "subtitle", "ctaText"].includes(k),
    );
    if (toClear.length) {
      setSlideErrors((prev) => {
        const curr = { ...prev[id] };
        toClear.forEach((f) => delete curr[f as keyof typeof curr]);
        const next = { ...prev, [id]: curr };
        if (!Object.keys(curr).length) delete next[id];
        return next;
      });
    }
  }

  function addSlide() {
    const newSlide = makeBlankSlide();
    setSlides((prev) => [...prev, newSlide]);
    setSelectedId(newSlide.id);
  }

  function deleteSlide(id: string) {
    const slide = slides.find((s) => s.id === id);
    // Delete R2 image if it's not a public path
    if (slide?.image && !slide.image.startsWith("/")) {
      void deleteStorageKeysAction([slide.image]);
    }
    setSlides((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (selectedId === id) {
        setSelectedId(next[0]?.id ?? "");
      }
      return next;
    });
  }

  function moveSlide(id: string, dir: -1 | 1) {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  }

  // ── validation ───────────────────────────────────────────────────────────
  function validateSlides(): boolean {
    const errors: Record<
      string,
      { image?: string; title?: string; subtitle?: string; ctaText?: string }
    > = {};
    for (const s of slides) {
      const e: (typeof errors)[string] = {};
      if (!s.image) e.image = "An image is required.";
      if (!s.title.trim()) e.title = "Headline is required.";
      if (!s.subtitle.trim()) e.subtitle = "Sub-headline is required.";
      if (!s.ctaText.trim()) e.ctaText = "Button label is required.";
      if (Object.keys(e).length) errors[s.id] = e;
    }
    setSlideErrors(errors);
    if (Object.keys(errors).length) {
      const firstId = slides.find((s) => errors[s.id])?.id;
      if (firstId) setSelectedId(firstId);
      return false;
    }
    return true;
  }

  function handleSlidesSubmit(e: React.FormEvent) {
    if (!validateSlides()) e.preventDefault();
  }

  // ── image upload ──────────────────────────────────────────────────────────
  async function handleImageFile(slideId: string, file: File) {
    const parsed = imageFileSchema.safeParse(file);
    if (!parsed.success) {
      setUploadError(parsed.error.issues[0].message);
      return;
    }

    const slide = slides.find((s) => s.id === slideId);
    const oldKey = slide?.image ?? "";

    setUploadingId(slideId);
    setUploadProgress(1);
    setUploadError(null);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setViewUrls((prev) => ({ ...prev, [`__local__${slideId}`]: localUrl }));

    try {
      const signed = await presignHeroImageUploadAction(slideId, {
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });

      await putWithProgress(signed.uploadUrl, file, setUploadProgress);

      // Delete old R2 key (fire-and-forget)
      if (oldKey && !oldKey.startsWith("/") && oldKey !== signed.key) {
        void deleteStorageKeysAction([oldKey]);
      }

      updateSlide(slideId, { image: signed.key });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      URL.revokeObjectURL(localUrl);
      setViewUrls((prev) => {
        const next = { ...prev };
        delete next[`__local__${slideId}`];
        return next;
      });
      setUploadingId(null);
      setUploadProgress(0);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && selectedSlide) {
      void handleImageFile(selectedSlide.id, file);
    }
    e.target.value = "";
  }

  // ── display URL for a slide ────────────────────────────────────────────────
  function imageDisplayUrl(slide: HeroSlide): string | null {
    // Local preview during upload
    const localKey = `__local__${slide.id}`;
    if (uploadingId === slide.id && viewUrls[localKey]) {
      return viewUrls[localKey];
    }
    if (!slide.image) return null;
    // Public path used as-is (fallback slides)
    if (slide.image.startsWith("/")) return slide.image;
    // R2 key — build permanent public URL
    return getPublicUrl(slide.image);
  }

  // ── CTA preset detection ───────────────────────────────────────────────────
  const isCtaPreset = (href: string) =>
    (CTA_PRESETS as readonly string[]).includes(href);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* ── sidebar nav ── */}
      <div className="flex flex-row gap-2 lg:flex-col lg:w-56 lg:shrink-0">
        {TABS.map(({ key, label, desc, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={[
              "flex flex-1 lg:flex-none items-center gap-3 rounded-2xl border p-3 text-left transition cursor-pointer",
              tab === key
                ? "bg-brand-ink text-white border-transparent"
                : "bg-surface border-border text-text hover:bg-black/5",
            ].join(" ")}
          >
            <span
              className={[
                "shrink-0",
                tab === key ? "text-white" : "text-subtle",
              ].join(" ")}
            >
              {icon}
            </span>
            <span className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight">{label}</p>
              <p
                className={[
                  "text-xs leading-tight",
                  tab === key ? "text-white/70" : "text-muted",
                ].join(" ")}
              >
                {desc}
              </p>
            </span>
          </button>
        ))}
      </div>

      {/* ── content panel ── */}
      <div className="min-w-0 flex-1">
        {/* ─── slides tab ─── */}
        {tab === "slides" && (
          <form action={slidesAction} onSubmit={handleSlidesSubmit}>
            {/* Hidden input carries the full slides JSON */}
            <input
              type="hidden"
              name="heroSlides"
              value={JSON.stringify(slides)}
            />

            <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
              {/* slide list sidebar */}
              <div className="xl:w-64 xl:shrink-0">
                <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold">
                      Slides{" "}
                      <span className="font-normal text-muted">
                        ({slides.length})
                      </span>
                    </h2>
                    <button
                      type="button"
                      onClick={addSlide}
                      className="flex cursor-pointer items-center gap-1 rounded-lg bg-brand-ink px-2.5 py-1 text-xs font-semibold text-white transition hover:brightness-110"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add
                    </button>
                  </div>

                  {slides.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-muted">
                      No slides yet. Click &quot;Add&quot; to create one.
                    </p>
                  ) : (
                    <ul>
                      {slides.map((slide, i) => {
                        const imgUrl = imageDisplayUrl(slide);
                        const isSelected = slide.id === selectedId;
                        return (
                          <li
                            key={slide.id}
                            className={[
                              "flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2.5 transition last:border-0",
                              isSelected
                                ? "bg-brand-ink/8"
                                : "hover:bg-black/5",
                            ].join(" ")}
                            onClick={() => setSelectedId(slide.id)}
                          >
                            {/* thumbnail */}
                            <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-black/10">
                              {imgUrl ? (
                                <Image
                                  src={imgUrl}
                                  alt={slide.title || "Slide"}
                                  width={64}
                                  height={40}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <svg
                                    className="h-4 w-4 text-muted"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M2.25 15.75l5.159-5.159a.75.75 0 011.06 0l5.03 5.03a.75.75 0 001.06 0l1.28-1.28a.75.75 0 011.06 0l2.3 2.3M21.75 12V6.75a3 3 0 00-3-3H5.25a3 3 0 00-3 3V17.25a3 3 0 003 3h13.5a3 3 0 003-3V12z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* title */}
                            <p
                              className={[
                                "min-w-0 flex-1 truncate text-sm",
                                slide.title
                                  ? "font-medium text-text"
                                  : "italic text-muted",
                              ].join(" ")}
                            >
                              {slide.title || "Untitled slide"}
                            </p>

                            {/* reorder + delete */}
                            <div
                              className="flex shrink-0 flex-col gap-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => moveSlide(slide.id, -1)}
                                disabled={i === 0}
                                className="cursor-pointer rounded p-0.5 text-muted transition hover:text-text disabled:cursor-default disabled:opacity-25"
                                aria-label="Move slide up"
                              >
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSlide(slide.id, 1)}
                                disabled={i === slides.length - 1}
                                className="cursor-pointer rounded p-0.5 text-muted transition hover:text-text disabled:cursor-default disabled:opacity-25"
                                aria-label="Move slide down"
                              >
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSlide(slide.id);
                              }}
                              className="cursor-pointer shrink-0 rounded p-0.5 text-muted transition hover:text-red-500"
                              aria-label={`Delete slide ${i + 1}`}
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* slide edit panel */}
              <div className="min-w-0 flex-1">
                {!selectedSlide ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-border text-sm text-muted">
                    Select a slide to edit
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                    <div className="border-b border-border px-5 py-4">
                      <h2 className="text-sm font-semibold text-text">
                        Slide {selectedIdx + 1} of {slides.length}
                      </h2>
                    </div>

                    <div className="flex flex-col gap-5 p-5">
                      {/* Image upload */}
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                          Background image
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={ACCEPTED}
                          className="sr-only"
                          onChange={handleFileInputChange}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingId === selectedSlide.id}
                          className={[
                            "relative h-44 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed bg-black/5 text-left transition hover:border-brand-ink/50 hover:bg-brand-ink/5 disabled:cursor-not-allowed disabled:pointer-events-none",
                            slideErrors[selectedSlide.id]?.image
                              ? "border-red-500"
                              : "border-border",
                          ].join(" ")}
                        >
                          {(() => {
                            const url = imageDisplayUrl(selectedSlide);
                            if (url) {
                              return (
                                <>
                                  <Image
                                    src={url}
                                    alt="Slide background"
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition hover:opacity-100">
                                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">
                                      Change image
                                    </span>
                                  </div>
                                </>
                              );
                            }
                            return (
                              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
                                <svg
                                  className="h-8 w-8"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 15.75l5.159-5.159a.75.75 0 011.06 0l5.03 5.03a.75.75 0 001.06 0l1.28-1.28a.75.75 0 011.06 0l2.3 2.3M21.75 12V6.75a3 3 0 00-3-3H5.25a3 3 0 00-3 3V17.25a3 3 0 003 3h13.5a3 3 0 003-3V12z"
                                  />
                                </svg>
                                <span className="text-sm">
                                  Click to upload image
                                </span>
                                <span className="text-xs">
                                  JPEG, PNG, WebP · max 8 MB
                                </span>
                              </div>
                            );
                          })()}

                          {/* upload progress overlay */}
                          {uploadingId === selectedSlide.id && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
                              <Spinner className="h-6 w-6 text-white" />
                              <span className="text-sm font-medium text-white">
                                {uploadProgress}%
                              </span>
                              <div className="h-1 w-32 rounded-full bg-white/20">
                                <div
                                  className="h-full rounded-full bg-gold transition-all"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </button>
                        {(uploadError ||
                          slideErrors[selectedSlide.id]?.image) && (
                          <p className="mt-1.5 text-xs text-red-500">
                            {uploadError ??
                              slideErrors[selectedSlide.id]?.image}
                          </p>
                        )}
                      </div>

                      {/* Headline */}
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Headline
                        </span>
                        <input
                          type="text"
                          value={selectedSlide.title}
                          onChange={(e) =>
                            updateSlide(selectedSlide.id, {
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g. Premium Wholesale Products"
                          className={[
                            "mt-1.5 block w-full rounded-xl border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-ink/40",
                            slideErrors[selectedSlide.id]?.title
                              ? "border-red-500"
                              : "border-border",
                          ].join(" ")}
                        />
                        {slideErrors[selectedSlide.id]?.title && (
                          <p className="mt-1 text-xs text-red-500">
                            {slideErrors[selectedSlide.id].title}
                          </p>
                        )}
                      </label>

                      {/* Sub-headline */}
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Sub-headline
                        </span>
                        <input
                          type="text"
                          value={selectedSlide.subtitle}
                          onChange={(e) =>
                            updateSlide(selectedSlide.id, {
                              subtitle: e.target.value,
                            })
                          }
                          placeholder="e.g. Designed for retailers."
                          className={[
                            "mt-1.5 block w-full rounded-xl border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-ink/40",
                            slideErrors[selectedSlide.id]?.subtitle
                              ? "border-red-500"
                              : "border-border",
                          ].join(" ")}
                        />
                        {slideErrors[selectedSlide.id]?.subtitle && (
                          <p className="mt-1 text-xs text-red-500">
                            {slideErrors[selectedSlide.id].subtitle}
                          </p>
                        )}
                      </label>

                      {/* ── Primary CTA ── */}
                      <div className="rounded-xl border border-border p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                          Primary button
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <p className="mb-1 text-xs text-muted">Label</p>
                            <input
                              type="text"
                              value={selectedSlide.ctaText}
                              onChange={(e) =>
                                updateSlide(selectedSlide.id, {
                                  ctaText: e.target.value,
                                })
                              }
                              placeholder="e.g. View Products"
                              className={[
                                "block w-full rounded-xl border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-ink/40",
                                slideErrors[selectedSlide.id]?.ctaText
                                  ? "border-red-500"
                                  : "border-border",
                              ].join(" ")}
                            />
                            {slideErrors[selectedSlide.id]?.ctaText && (
                              <p className="mt-1 text-xs text-red-500">
                                {slideErrors[selectedSlide.id].ctaText}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="mb-1 text-xs text-muted">Link</p>
                            <div className="flex flex-col gap-1.5">
                              <select
                                value={
                                  isCtaPreset(selectedSlide.ctaHref)
                                    ? selectedSlide.ctaHref
                                    : "custom"
                                }
                                onChange={(e) => {
                                  if (e.target.value !== "custom") {
                                    updateSlide(selectedSlide.id, {
                                      ctaHref: e.target.value,
                                    });
                                  } else {
                                    updateSlide(selectedSlide.id, {
                                      ctaHref: "",
                                    });
                                  }
                                }}
                                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-ink/40"
                              >
                                {CTA_PRESETS.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                                <option value="custom">Custom URL…</option>
                              </select>
                              {!isCtaPreset(selectedSlide.ctaHref) && (
                                <input
                                  type="text"
                                  value={selectedSlide.ctaHref}
                                  onChange={(e) =>
                                    updateSlide(selectedSlide.id, {
                                      ctaHref: e.target.value,
                                    })
                                  }
                                  placeholder="https://..."
                                  className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-ink/40"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── Secondary CTA ── */}
                      <div className="rounded-xl border border-border p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                            Secondary button
                          </p>
                          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted select-none">
                            <span>Show</span>
                            <span className="relative inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedSlide.cta2Visible}
                                onChange={(e) =>
                                  updateSlide(selectedSlide.id, {
                                    cta2Visible: e.target.checked,
                                  })
                                }
                                className="peer sr-only"
                              />
                              <span className="peer h-5 w-9 rounded-full bg-border transition after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-brand-ink peer-checked:after:translate-x-4" />
                            </span>
                          </label>
                        </div>

                        <div
                          className={[
                            "grid grid-cols-1 gap-3 sm:grid-cols-2 transition-opacity",
                            selectedSlide.cta2Visible
                              ? "opacity-100"
                              : "pointer-events-none opacity-40",
                          ].join(" ")}
                        >
                          <div>
                            <p className="mb-1 text-xs text-muted">Label</p>
                            <input
                              type="text"
                              value={selectedSlide.cta2Text}
                              onChange={(e) =>
                                updateSlide(selectedSlide.id, {
                                  cta2Text: e.target.value,
                                })
                              }
                              placeholder="e.g. Contact"
                              className="block w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-ink/40"
                            />
                          </div>

                          <div>
                            <p className="mb-1 text-xs text-muted">Link</p>
                            <div className="flex flex-col gap-1.5">
                              <select
                                value={
                                  isCtaPreset(selectedSlide.cta2Href)
                                    ? selectedSlide.cta2Href
                                    : "custom"
                                }
                                onChange={(e) => {
                                  if (e.target.value !== "custom") {
                                    updateSlide(selectedSlide.id, {
                                      cta2Href: e.target.value,
                                    });
                                  } else {
                                    updateSlide(selectedSlide.id, {
                                      cta2Href: "",
                                    });
                                  }
                                }}
                                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-ink/40"
                              >
                                {CTA_PRESETS.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                                <option value="custom">Custom URL…</option>
                              </select>
                              {!isCtaPreset(selectedSlide.cta2Href) && (
                                <input
                                  type="text"
                                  value={selectedSlide.cta2Href}
                                  onChange={(e) =>
                                    updateSlide(selectedSlide.id, {
                                      cta2Href: e.target.value,
                                    })
                                  }
                                  placeholder="https://..."
                                  className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-ink/40"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {Object.keys(slideErrors).length > 0 && (
              <div className="mt-4">
                <Alert variant="error">
                  {(() => {
                    const errorNums = slides
                      .map((s, i) => (slideErrors[s.id] ? i + 1 : null))
                      .filter(Boolean);
                    return errorNums.length === 1
                      ? `Slide ${errorNums[0]} has missing required fields.`
                      : `Slides ${errorNums.join(", ")} have missing required fields.`;
                  })()}
                </Alert>
              </div>
            )}
            {/* feedback */}
            {slidesState?.formError && (
              <div className="mt-4">
                <Alert variant="error">{slidesState.formError}</Alert>
              </div>
            )}
            {slidesState?.success && (
              <div className="mt-4">
                <Alert variant="success">Slides saved successfully.</Alert>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={slidesPending || uploadingId !== null}
                className="flex items-center gap-2 rounded-full bg-brand-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {slidesPending ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Saving…
                  </>
                ) : (
                  "Save slides"
                )}
              </button>
            </div>
          </form>
        )}

        {/* ─── settings tab ─── */}
        {tab === "settings" && (
          <form action={settingsAction}>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-text">
                  Slider settings
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  Controls how the hero carousel behaves.
                </p>
              </div>

              <div className="flex flex-col gap-6 p-5">
                {/* Autoplay toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-text">Autoplay</p>
                    <p className="text-xs text-muted">
                      Automatically advance slides on a timer.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      name="heroAutoplay"
                      checked={autoplay}
                      onChange={(e) => setAutoplay(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-border transition after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-brand-ink peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-ink/40" />
                  </label>
                </div>

                {/* Interval slider */}
                <div
                  className={autoplay ? "" : "pointer-events-none opacity-50"}
                >
                  <p className="text-sm font-medium text-text">
                    Slide interval
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    Time each slide is shown (1 – 15 seconds).
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="range"
                      name="heroInterval"
                      min={1000}
                      max={15000}
                      step={500}
                      value={intervalMs}
                      onChange={(e) => setIntervalMs(Number(e.target.value))}
                      className="flex-1 accent-brand-ink"
                    />
                    <span className="w-14 rounded-xl border border-border bg-bg px-2 py-1.5 text-center text-sm tabular-nums text-text">
                      {(intervalMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {settingsState?.formError && (
              <div className="mt-4">
                <Alert variant="error">{settingsState.formError}</Alert>
              </div>
            )}
            {settingsState?.success && (
              <div className="mt-4">
                <Alert variant="success">Settings saved successfully.</Alert>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={settingsPending}
                className="flex items-center gap-2 rounded-full bg-brand-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {settingsPending ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Saving…
                  </>
                ) : (
                  "Save settings"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
