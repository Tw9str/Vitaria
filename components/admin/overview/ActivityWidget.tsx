import Link from "next/link";
import type { LogEntry } from "@/lib/db/logs";

// ─── Helpers ────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  PRODUCT_CREATED: "Created product",
  PRODUCT_UPDATED: "Updated product",
  PRODUCT_DELETED: "Deleted product",
  PRODUCT_PUBLISHED: "Published product",
  PRODUCT_UNPUBLISHED: "Unpublished product",
  LEAD_STATUS_CHANGED: "Changed lead status",
  LEAD_NOTES_SAVED: "Saved lead notes",
  USER_CREATED: "Created user",
  USER_DELETED: "Deleted user",
  USER_RENAMED: "Renamed user",
  USER_ROLE_CHANGED: "Changed user role",
  USER_BLOCKED: "Blocked user",
  USER_UNBLOCKED: "Unblocked user",
  NOTE_CREATED: "Created note",
  NOTE_UPDATED: "Updated note",
  NOTE_DELETED: "Deleted note",
  NOTE_PINNED: "Pinned note",
  NOTE_UNPINNED: "Unpinned note",
  PROFILE_UPDATED: "Updated profile",
};

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  product: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  lead: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  user: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  note: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  profile: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
};

const ENTITY_ICON_COLORS: Record<string, string> = {
  product: "text-blue-500",
  lead: "text-gold",
  user: "text-purple-500",
  note: "text-green-500",
  profile: "text-orange-500",
};

const SEVERITY_BADGE: Record<string, string> = {
  info: "bg-black/10 text-muted",
  warning: "bg-amber-400/15 text-amber-600 dark:text-amber-400",
  error: "bg-red-500/10 text-red-500",
};

const SEVERITY_DOT: Record<string, string> = {
  info: "bg-muted",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        SEVERITY_BADGE[severity] ?? SEVERITY_BADGE.info
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          SEVERITY_DOT[severity] ?? SEVERITY_DOT.info
        }`}
      />
      {severity}
    </span>
  );
}

function formatRelative(date: Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Component ──────────────────────────────────────────────────────────────

type Props = { logs: LogEntry[]; imageUrlMap?: Record<string, string> };

export default function ActivityWidget({ logs, imageUrlMap = {} }: Props) {
  return (
    <div className="rounded-[18px] border border-border bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold">Activity</h2>
        <Link
          href="/admin/logs"
          className="text-xs text-muted transition hover:text-text"
        >
          View all →
        </Link>
      </div>

      {logs.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-subtle">
          No activity yet.
        </p>
      ) : (
        <>
          {/* Column headers — visible on md+ */}
          <div className="hidden md:grid md:grid-cols-[20px_minmax(0,1fr)_minmax(0,160px)_80px_68px] items-center gap-x-4 border-b border-border bg-bg/50 px-5 py-2">
            <span />
            <span className="text-xs font-medium text-subtle">Action</span>
            <span className="text-xs font-medium text-subtle">By</span>
            <span className="text-xs font-medium text-subtle">Severity</span>
            <span className="text-xs font-medium text-subtle text-right">
              Time
            </span>
          </div>

          <div className="divide-y divide-border">
            {logs.map((log) => {
              const actorLabel = log.actorName ?? log.actorEmail;
              const actorInitial = actorLabel.charAt(0).toUpperCase();
              const avatarUrl = log.actor?.image
                ? imageUrlMap[log.actor.image]
                : null;
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 px-5 py-3 md:grid md:grid-cols-[20px_minmax(0,1fr)_minmax(0,160px)_80px_68px] md:gap-x-4"
                >
                  {/* Entity icon — own column on md+, hidden on mobile */}
                  <span
                    className={`hidden md:inline-flex items-center justify-center shrink-0 ${
                      ENTITY_ICON_COLORS[log.entity] ?? "text-muted"
                    }`}
                  >
                    {ENTITY_ICONS[log.entity] ?? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                        aria-hidden
                      >
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                  </span>

                  {/* Actor avatar — mobile hidden, md+ handled in By column */}

                  {/* Action + entity title */}
                  <div className="min-w-0 flex-1 md:flex-none">
                    <div className="flex items-center gap-1.5 md:block">
                      {/* Icon visible on mobile inline with label */}
                      <span
                        className={`md:hidden shrink-0 ${
                          ENTITY_ICON_COLORS[log.entity] ?? "text-muted"
                        }`}
                      >
                        {ENTITY_ICONS[log.entity] ?? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3.5 w-3.5"
                            aria-hidden
                          >
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        )}
                      </span>
                      <p className="truncate text-sm font-medium text-text">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </p>
                    </div>
                    {log.entityTitle && (
                      <p className="truncate text-xs text-muted md:hidden">
                        <span className="font-medium text-text">
                          {actorLabel}
                        </span>
                        {" · "}
                        {log.entityTitle}
                      </p>
                    )}
                    {!log.entityTitle && (
                      <p className="truncate text-xs text-muted md:hidden">
                        <span className="font-medium text-text">
                          {actorLabel}
                        </span>
                      </p>
                    )}
                    {log.entityTitle && (
                      <p className="hidden md:block truncate text-xs text-muted">
                        {log.entityTitle}
                      </p>
                    )}
                  </div>

                  {/* By column — md+ with avatar */}
                  <div className="hidden md:flex items-center gap-2 min-w-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span className="h-6 w-6 rounded-full bg-brand-ink text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                        {actorInitial}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs text-text">
                        {log.actorName ?? log.actorEmail}
                      </p>
                      {log.actorName && (
                        <p className="truncate text-xs text-muted">
                          {log.actorEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <SeverityBadge severity={log.severity} />
                  </div>
                  <span className="shrink-0 text-xs text-subtle md:text-right">
                    {formatRelative(log.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
