import type { SiteConfigData } from "@/lib/db/siteConfig";
import { CHANNEL_DEFS } from "@/components/sections/contact/ContactChannels";
import ChannelRow from "./ChannelRow";

const DEFAULT_WHATS_INCLUDED = [
  { icon: "📦", text: "Full product catalog with pricing" },
  { icon: "🏷️", text: "Barcoded & case-pack specs" },
  { icon: "🖼️", text: "Marketing assets & photography" },
  { icon: "📋", text: "Samples on request" },
];

export default function ContactSidebar({
  contactConfig,
}: {
  contactConfig?: SiteConfigData | null;
}) {
  const visibleChannels = CHANNEL_DEFS.filter((def) => {
    const ch = contactConfig?.[def.key] as
      | { value: string; visible: boolean }
      | null
      | undefined;
    return ch?.visible && ch.value;
  });

  const wiTitle = contactConfig?.whatsIncludedTitle ?? "What's included";
  const wiItems = contactConfig?.whatsIncludedItems ?? DEFAULT_WHATS_INCLUDED;

  return (
    <aside className="flex flex-col gap-4">
      {/* Reach us directly - only rendered when at least one channel is visible */}
      {visibleChannels.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface shadow-soft p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Reach us directly
          </p>
          <div className="space-y-2">
            {visibleChannels.map((def) => {
              const ch = contactConfig![def.key] as {
                value: string;
                visible: boolean;
              };
              return <ChannelRow key={def.key} def={def} value={ch.value} />;
            })}
          </div>
        </div>
      )}

      {/* What's included */}
      <div className="rounded-2xl border border-border bg-surface shadow-soft p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          {wiTitle}
        </p>
        <ul className="space-y-2.5">
          {wiItems.map(({ icon, text }) => (
            <li
              key={text}
              className="flex items-start gap-2.5 text-sm text-muted"
            >
              <span className="mt-px text-base leading-none">{icon}</span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
