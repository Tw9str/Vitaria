import Link from "next/link";
import { buildHref, type ChannelDef } from "@/lib/contact-channels";

export default function ChannelRow({
  def,
  value,
}: {
  def: ChannelDef;
  value: string;
}) {
  const href = buildHref(def, value);
  const display = value
    .replace(/^mailto:/, "")
    .replace(/^tel:/, "")
    .replace(/^https?:\/\/(www\.)?/, "");

  const isExternal =
    !def.hrefPrefix.startsWith("mailto") && !def.hrefPrefix.startsWith("tel");

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-bg px-3.5 py-3 transition hover:border-text/25 hover:bg-surface"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted transition group-hover:text-text">
        {def.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">
          {def.label}
        </p>
        <p className="mt-0.5 truncate text-sm text-text">{display}</p>
      </div>
      <svg
        className="h-3.5 w-3.5 shrink-0 text-subtle opacity-0 transition group-hover:opacity-100"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
        />
      </svg>
    </Link>
  );
}
