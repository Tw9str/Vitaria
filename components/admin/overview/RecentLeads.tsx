import Link from "next/link";
import { relativeTime } from "@/lib/format";
import type { RecentLead } from "@/lib/db/overview";

const STATUS_CLASSES: Record<string, string> = {
  new: "bg-gold/15 text-gold",
  read: "bg-black/10 text-muted",
  contacted: "bg-green-500/15 text-green-600 dark:text-green-400",
  closed: "bg-red-500/10 text-red-500",
};

const STATUS_DOT: Record<string, string> = {
  new: "bg-gold",
  read: "bg-muted",
  contacted: "bg-green-500",
  closed: "bg-red-500",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        STATUS_CLASSES[status] ?? STATUS_CLASSES.read
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          STATUS_DOT[status] ?? STATUS_DOT.read
        }`}
      />
      {status}
    </span>
  );
}

type Props = { leads: RecentLead[] };

export default function RecentLeads({ leads }: Props) {
  return (
    <div className="rounded-[18px] border border-border bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold">Recent leads</h2>
        <Link
          href="/admin/leads"
          className="text-xs text-muted transition hover:text-text"
        >
          View all →
        </Link>
      </div>

      {leads.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-subtle">
          No leads yet.
        </p>
      ) : (
        <>
          {/* Column headers — visible on md+ */}
          <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_96px_68px] items-center gap-x-4 border-b border-border bg-bg/50 px-5 py-2">
            <span className="text-xs font-medium text-subtle">Company</span>
            <span className="text-xs font-medium text-subtle">Contact</span>
            <span className="text-xs font-medium text-subtle">Status</span>
            <span className="text-xs font-medium text-subtle text-right">
              Time
            </span>
          </div>

          <div className="divide-y divide-border">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 px-5 py-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_96px_68px] md:gap-x-4"
              >
                {/* Company + type (always visible) */}
                <div className="min-w-0 flex-1 md:flex-none">
                  <p className="truncate text-sm font-medium text-text">
                    {lead.company}
                  </p>
                  <p className="truncate text-xs text-muted">{lead.type}</p>
                </div>

                {/* Contact name + email — md+ only */}
                <div className="hidden md:block min-w-0">
                  <p className="truncate text-sm text-text">{lead.name}</p>
                  <p className="truncate text-xs text-muted">{lead.email}</p>
                </div>

                <div className="flex items-center">
                  <StatusBadge status={lead.status} />
                </div>
                <span className="shrink-0 text-xs text-subtle md:text-right">
                  {relativeTime(lead.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
