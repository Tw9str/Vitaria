"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminNav from "./AdminNav";
import AdminActions from "./AdminActions";
import type { ShellUser } from "./AdminShell";

function initials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "?").toUpperCase();
}

export default function CollapsibleSidebar({ user }: { user: ShellUser }) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  // Close overlay on navigation
  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  return (
    // Always w-14 in flow - expanding never shifts layout
    <div className="lg:hidden shrink-0 w-14 relative">
      {/* ── Sticky icon strip ─────────────────────────── */}
      <div className="w-14 fixed top-0 left-0 h-dvh flex flex-col border-r border-border bg-surface z-30">
        {/* Hamburger / expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          title="Menu"
          className="flex justify-center py-3 text-muted hover:text-text transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="flex justify-center py-2 border-y border-border">
          <Link
            href="/admin/profile"
            title={user.name ?? user.email}
            className="group relative shrink-0"
          >
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.imageUrl}
                alt={user.name ?? user.email}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-border transition group-hover:ring-gold/60"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-brand-ink text-white text-xs font-semibold flex items-center justify-center ring-2 ring-border transition group-hover:ring-gold/60">
                {initials(user.name, user.email)}
              </div>
            )}
          </Link>
        </div>

        {/* Nav icons */}
        <div className="flex-1 py-2 px-1.5 overflow-y-auto">
          <AdminNav role={user.role} collapsed />
        </div>

        {/* Action icons */}
        <div className="px-1.5 pb-3">
          <AdminActions collapsed />
        </div>
      </div>

      {/* ── Expanded overlay - zero layout impact ───────── */}
      {expanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
            aria-hidden
          />

          {/* Panel slides from the right edge of the strip */}
          <div className="fixed left-14 top-0 z-50 h-dvh w-56 bg-surface border-r border-border shadow-2xl flex flex-col overflow-y-auto">
            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
              <Link
                href="/admin/profile"
                onClick={() => setExpanded(false)}
                className="shrink-0"
              >
                {user.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.imageUrl}
                    alt={user.name ?? user.email}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-brand-ink text-white text-xs font-semibold flex items-center justify-center ring-2 ring-border">
                    {initials(user.name, user.email)}
                  </div>
                )}
              </Link>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text truncate">
                  {user.name ?? user.email}
                </p>
                {user.name && (
                  <p className="text-xs text-subtle truncate">{user.email}</p>
                )}
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-gold/15 text-gold"
                      : "bg-black/10 text-subtle"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            {/* Nav with labels */}
            <div className="flex-1 p-3">
              <AdminNav role={user.role} />
            </div>

            {/* Actions with labels */}
            <div className="px-3 pb-3">
              <AdminActions />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
