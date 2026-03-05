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

export default function MobileAdminNav({ user }: { user: ShellUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger button - sits inside the mobile top bar */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-muted hover:bg-black/10 hover:text-text transition-colors"
        aria-label="Open navigation"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay + drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${open ? "visible" : "invisible"}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
          aria-hidden
        />

        {/* Drawer panel */}
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 bg-surface border-r border-border flex flex-col shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
            <span className="text-sm font-bold text-text">Admin Panel</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-muted hover:bg-black/10 hover:text-text transition-colors"
              aria-label="Close navigation"
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <Link
              href="/admin/profile"
              onClick={() => setOpen(false)}
              className="shrink-0"
            >
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={user.name ?? user.email}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-brand-ink text-white text-sm font-semibold flex items-center justify-center ring-2 ring-border">
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

          {/* Nav links */}
          <div className="p-3 flex-1 overflow-y-auto">
            <AdminNav role={user.role} />
          </div>

          {/* Theme + sign out */}
          <div className="px-3 pb-3">
            <AdminActions />
          </div>
        </aside>
      </div>
    </>
  );
}
