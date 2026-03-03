"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Spinner from "@/components/shared/Spinner";
import Alert from "@/components/shared/Alert";
import TurnstileWidget from "@/components/shared/Turnstile";
import { leadSchema } from "@/lib/validators";
import type { LeadInput } from "@/lib/validators";

type Status = "idle" | "sending" | "sent" | "error";
type FieldErrors = Partial<Record<keyof LeadInput, string>>;

function FormInput(props: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  optional?: boolean;
}) {
  const {
    label,
    name,
    type = "text",
    placeholder,
    autoComplete,
    error,
    optional,
  } = props;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[11px] font-semibold uppercase tracking-wider text-subtle"
        htmlFor={name}
      >
        {label}
        {optional && (
          <span className="ml-1 normal-case font-normal tracking-normal">
            (optional)
          </span>
        )}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={[
          "w-full rounded-lg border bg-bg/60 px-4 py-3 text-sm text-text placeholder:text-subtle/50 outline-none transition",
          error
            ? "border-red-500/60 focus:border-red-500/80 focus:ring-3 focus:ring-red-500/10"
            : "border-border focus:border-gold/60 focus:ring-3 focus:ring-gold/10",
        ].join(" ")}
      />
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-400">
          <svg
            className="h-3 w-3 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export default function InquiryForm({
  turnstileSiteKey,
  whatsappHref,
}: {
  turnstileSiteKey: string;
  whatsappHref: string | null;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [messageLen, setMessageLen] = useState(0);
  const resetTurnstile = useRef<(() => void) | null>(null);

  const handleTurnstileReady = useCallback((reset: () => void) => {
    resetTurnstile.current = reset;
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors(null);
    setError("");

    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = leadSchema.safeParse(data);
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors | undefined;
        if (field && !(field in errs)) errs[field] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...parsed.data, turnstileToken }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        resetTurnstile.current?.();
        setTurnstileToken(null);
        throw new Error(
          payload?.message ?? "Unable to submit. Please try again.",
        );
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface overflow-hidden">
      {status === "sent" ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 ring-2 ring-green-500/20">
            <svg
              className="h-7 w-7 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h3 className="mt-5 text-xl font-semibold tracking-tight">
            We&apos;ve got your inquiry!
          </h3>
          <p className="mt-2 max-w-[34ch] text-sm text-muted leading-relaxed">
            Expect the catalog, pricing, and next steps in your inbox within one
            business day.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted hover:text-text hover:border-text/30 transition cursor-pointer"
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
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              />
            </svg>
            Submit another
          </button>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-1 flex-col p-6 sm:p-8"
        >
          {/* ── Heading ── */}
          <div className="mb-6 border-b border-border pb-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">
              Get in touch
            </p>
          </div>

          {/* ── Fields ───────────────────────────────────── */}
          <div className="space-y-4">
            {/* Row 1 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Full name"
                name="name"
                placeholder="Jane Smith"
                autoComplete="name"
                error={fieldErrors?.name}
              />
              <FormInput
                label="Work email"
                name="email"
                type="email"
                placeholder="jane@shop.com"
                autoComplete="email"
                error={fieldErrors?.email}
              />
            </div>

            {/* Row 2 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Company"
                name="company"
                placeholder="Retail Store Co."
                autoComplete="organization"
                error={fieldErrors?.company}
                optional
              />
              <FormInput
                label="Website"
                name="website"
                type="url"
                placeholder="https://yourstore.com"
                error={fieldErrors?.website}
                optional
              />
            </div>

            {/* Row 3 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider text-subtle"
                  htmlFor="type"
                >
                  Business type
                </label>
                <div className="relative">
                  <select
                    id="type"
                    name="type"
                    defaultValue=""
                    className={[
                      "w-full appearance-none rounded-lg border bg-bg/60 px-4 py-3 pr-9 text-sm text-text outline-none transition",
                      fieldErrors?.type
                        ? "border-red-500/60 focus:border-red-500/80 focus:ring-3 focus:ring-red-500/10"
                        : "border-border focus:border-gold/60 focus:ring-3 focus:ring-gold/10",
                    ].join(" ")}
                  >
                    <option value="" disabled>
                      Select type…
                    </option>
                    <option>Retail store</option>
                    <option>E-commerce</option>
                    <option>Distributor</option>
                    <option>Hospitality</option>
                    <option>Other</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
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
                </div>
                {fieldErrors?.type && (
                  <p className="flex items-center gap-1 text-[11px] text-red-400">
                    <svg
                      className="h-3 w-3 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    {fieldErrors.type}
                  </p>
                )}
              </div>
              <FormInput
                label="Country / Region"
                name="region"
                placeholder="United States"
                error={fieldErrors?.region}
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider text-subtle"
                htmlFor="message"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                maxLength={500}
                onChange={(e) => setMessageLen(e.target.value.length)}
                className={[
                  "w-full resize-none rounded-lg border bg-bg/60 px-4 py-3 text-sm text-text placeholder:text-subtle/50 outline-none transition",
                  fieldErrors?.message
                    ? "border-red-500/60 focus:border-red-500/80 focus:ring-3 focus:ring-red-500/10"
                    : "border-border focus:border-gold/60 focus:ring-3 focus:ring-gold/10",
                ].join(" ")}
                placeholder="Product lines you're interested in, estimated order volume, questions…"
              />
              <div className="flex items-start justify-between gap-2">
                {fieldErrors?.message ? (
                  <p className="flex items-center gap-1 text-[11px] text-red-400">
                    <svg
                      className="h-3 w-3 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    {fieldErrors.message}
                  </p>
                ) : (
                  <span />
                )}
                {messageLen > 0 && (
                  <span
                    className={`shrink-0 text-[11px] tabular-nums ${
                      messageLen >= 500
                        ? "text-red-400"
                        : messageLen >= 400
                          ? "text-amber-400"
                          : "text-subtle"
                    }`}
                  >
                    {messageLen}/500
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Honeypot */}
          <div className="absolute -left-2499.75 h-px w-px overflow-hidden">
            <label htmlFor="company_site">Company site</label>
            <input
              id="company_site"
              name="company_site"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <TurnstileWidget
            siteKey={turnstileSiteKey}
            onToken={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
            onReady={handleTurnstileReady}
          />

          {/* ── Error ── */}
          {status === "error" && (
            <Alert variant="error" className="mt-4">
              {error}
            </Alert>
          )}

          {/* ── Actions ── */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gold/60 bg-linear-to-br from-gold/95 to-gold/70 py-3.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
            >
              {status === "sending" ? (
                <>
                  <Spinner className="h-4 w-4" /> Sending…
                </>
              ) : (
                <>
                  Send inquiry
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </>
              )}
            </button>

            {whatsappHref && (
              <>
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs text-subtle">or</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <Link
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border py-3.5 text-sm font-semibold text-muted hover:border-[#25d366]/40 hover:bg-[#25d366]/5 hover:text-text transition"
                >
                  <svg
                    className="h-4 w-4 text-[#25d366]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Chat on WhatsApp
                </Link>
              </>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-subtle">
            By submitting you agree we may contact you regarding your wholesale
            inquiry.
          </p>
        </form>
      )}
    </div>
  );
}
