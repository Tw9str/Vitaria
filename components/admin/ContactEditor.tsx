"use client";

import { useActionState, useState } from "react";
import {
  updateSiteConfigAction,
  type SiteConfigActionState,
  type ChannelKey,
} from "@/app/actions/siteConfig";
import type { SiteConfigData, WhatsIncludedItem } from "@/lib/db/siteConfig";
import Alert from "@/components/shared/Alert";
import Spinner from "@/components/shared/Spinner";

// ─── channel meta ───────────────────────────────────────────────────────────
type ChannelMeta = {
  key: ChannelKey;
  label: string;
  placeholder: string;
  hint: string;
  icon: React.ReactNode;
};

const CHANNEL_META: ChannelMeta[] = [
  {
    key: "email",
    label: "Email",
    placeholder: "hello@example.com",
    hint: "Will be shown as a mailto: link",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
  {
    key: "phone",
    label: "Phone",
    placeholder: "+1 555 000 0000",
    hint: "Shown as a tel: link",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
        />
      </svg>
    ),
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    placeholder: "https://wa.me/1234567890",
    hint: "Full wa.me link or just the number",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/yourpage",
    hint: "Full profile or page URL",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourhandle",
    hint: "Full profile URL",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    placeholder: "https://x.com/yourhandle",
    hint: "Full profile URL",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/yourco",
    hint: "Full company or personal page URL",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

// ─── What's included defaults ────────────────────────────────────────────────
const DEFAULT_WI_ITEMS: WhatsIncludedItem[] = [
  { icon: "📦", text: "Full product catalog with pricing" },
  { icon: "🏷️", text: "Barcoded & case-pack specs" },
  { icon: "🖼️", text: "Marketing assets & photography" },
  { icon: "📋", text: "Samples on request" },
];

// ─── Toggle switch ───────────────────────────────────────────────────────────
function Toggle({
  name,
  checked,
  onChange,
}: {
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        name={name}
        value="on"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <div className="h-5 w-9 rounded-full border border-border bg-black/10 transition-colors peer-checked:bg-brand-ink peer-checked:border-brand-ink dark:bg-white/10" />
      <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
    </label>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function ContactEditor({
  initialConfig,
}: {
  initialConfig: SiteConfigData;
}) {
  type ChannelState = { value: string; visible: boolean };
  type AllChannels = Record<ChannelKey, ChannelState>;

  const [channels, setChannels] = useState<AllChannels>(() => {
    const out = {} as AllChannels;
    for (const { key } of CHANNEL_META) {
      const ch = initialConfig[key];
      out[key] = { value: ch?.value ?? "", visible: ch?.visible ?? true };
    }
    return out;
  });

  const [state, action, isPending] = useActionState<
    SiteConfigActionState,
    FormData
  >(updateSiteConfigAction, null);

  function patch(key: ChannelKey, partial: Partial<ChannelState>) {
    setChannels((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...partial },
    }));
  }

  // ── What's included state ──────────────────────────────────────────────────
  const [wiTitle, setWiTitle] = useState<string>(
    initialConfig.whatsIncludedTitle ?? "What's included",
  );
  const [wiItems, setWiItems] = useState<WhatsIncludedItem[]>(
    initialConfig.whatsIncludedItems ?? DEFAULT_WI_ITEMS,
  );

  function updateWiItem(
    idx: number,
    field: keyof WhatsIncludedItem,
    value: string,
  ) {
    setWiItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  }

  function moveWiItem(idx: number, dir: -1 | 1) {
    setWiItems((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function removeWiItem(idx: number) {
    setWiItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function addWiItem() {
    setWiItems((prev) => [...prev, { icon: "", text: "" }]);
  }

  return (
    <div>
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Contact</h1>
        <p className="mt-1 text-sm text-muted">
          Manage contact channels and the sidebar card shown on the storefront.
        </p>
      </div>

      <form action={action}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          {/* ── Left: Contact channels ──────────────────────────────────── */}
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              Contact channels
            </p>
            <div className="space-y-2.5">
              {CHANNEL_META.map(({ key, label, placeholder, hint, icon }) => {
                const ch = channels[key];
                return (
                  <div
                    key={key}
                    className={`rounded-2xl border bg-surface transition-colors ${
                      ch.visible
                        ? "border-border"
                        : "border-border/50 opacity-60"
                    }`}
                  >
                    {/* Row header */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-muted">
                        {icon}
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {label}
                      </span>
                      <Toggle
                        name={`${key}_visible`}
                        checked={ch.visible}
                        onChange={(v) => patch(key, { visible: v })}
                      />
                    </div>
                    {/* Input */}
                    <div className="border-t border-border/50 px-4 pb-4 pt-3">
                      <input
                        type="text"
                        name={`${key}_value`}
                        value={ch.value}
                        onChange={(e) => patch(key, { value: e.target.value })}
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-subtle outline-none focus:border-gold/60 focus:ring-4 focus:ring-gold/15 transition"
                      />
                      <p className="mt-1.5 text-xs text-subtle">{hint}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: What's included ──────────────────────────────────── */}
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              What&apos;s included card
            </p>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="mb-4 text-xs text-muted">
                Displayed in the contact sidebar on the storefront.
              </p>

              {/* Section title */}
              <div className="mb-5">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-subtle">
                  Card title
                </label>
                <input
                  type="text"
                  value={wiTitle}
                  onChange={(e) => setWiTitle(e.target.value)}
                  placeholder="What's included"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-subtle outline-none focus:border-gold/60 focus:ring-4 focus:ring-gold/15 transition"
                />
              </div>

              {/* Items */}
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-subtle">
                Items
              </label>
              <div className="space-y-2">
                {wiItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.icon}
                      onChange={(e) =>
                        updateWiItem(idx, "icon", e.target.value)
                      }
                      maxLength={4}
                      placeholder="📦"
                      className="w-12 shrink-0 rounded-xl border border-border bg-bg px-2 py-2 text-center text-sm outline-none focus:border-gold/60 focus:ring-4 focus:ring-gold/15 transition"
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        updateWiItem(idx, "text", e.target.value)
                      }
                      placeholder="Item description"
                      className="min-w-0 flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-subtle outline-none focus:border-gold/60 focus:ring-4 focus:ring-gold/15 transition"
                    />
                    <button
                      type="button"
                      onClick={() => moveWiItem(idx, -1)}
                      disabled={idx === 0}
                      title="Move up"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted hover:text-text disabled:opacity-30 transition cursor-pointer"
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
                      onClick={() => moveWiItem(idx, 1)}
                      disabled={idx === wiItems.length - 1}
                      title="Move down"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted hover:text-text disabled:opacity-30 transition cursor-pointer"
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
                    <button
                      type="button"
                      onClick={() => removeWiItem(idx)}
                      title="Remove"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted hover:text-red-400 transition cursor-pointer"
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
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addWiItem}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted hover:text-text transition cursor-pointer"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add item
              </button>

              {/* Hidden inputs */}
              <input type="hidden" name="whatsIncludedTitle" value={wiTitle} />
              <input
                type="hidden"
                name="whatsIncludedItems"
                value={JSON.stringify(wiItems)}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="mt-6 flex items-center gap-4 border-t border-border pt-5">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-full bg-brand-ink px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 transition cursor-pointer"
          >
            {isPending && <Spinner className="h-3.5 w-3.5" />}
            {isPending ? "Saving…" : "Save changes"}
          </button>
          {state?.formError && <Alert variant="error">{state.formError}</Alert>}
          {state?.success && <Alert variant="success">Changes saved.</Alert>}
        </div>
      </form>
    </div>
  );
}
