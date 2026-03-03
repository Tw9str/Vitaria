"use client";

import { signOut } from "next-auth/react";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function AdminActions({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="space-y-0.5 border-t border-border pt-3">
      {/* Theme toggle */}
      <ThemeToggle
        iconOnly={collapsed}
        className={
          collapsed
            ? "flex w-full justify-center rounded-xl py-2 text-base text-muted hover:bg-black/10 hover:text-text cursor-pointer transition-colors"
            : "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-black/10 hover:text-text cursor-pointer transition-colors"
        }
      />

      {/* Logout */}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        title={collapsed ? "Sign out" : undefined}
        className={`flex w-full items-center rounded-xl py-2 text-sm font-medium text-muted hover:bg-red-500/10 hover:text-red-400 cursor-pointer transition-colors ${
          collapsed ? "justify-center px-2" : "gap-2.5 px-3"
        }`}
      >
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
          />
        </svg>
        {!collapsed && "Sign out"}
      </button>
    </div>
  );
}
