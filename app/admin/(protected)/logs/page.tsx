import { getLogs, type LogEntry } from "@/lib/db/logs";
import { getPublicUrl } from "@/lib/storage/url";
import LogsListClient from "@/components/admin/logs/LogsListClient";

export const metadata = { title: "Activity Logs" };

export default async function LogsPage() {
  let initialLogs: LogEntry[] = [];
  let initialHasMore = false;
  let initialImageUrlMap: Record<string, string> = {};

  try {
    const result = await getLogs({ skip: 0 });
    initialLogs = result.logs;
    initialHasMore = result.hasMore;

    // Build public avatar URL map for actors
    const avatarKeys = initialLogs
      .map((l) => l.actor?.image)
      .filter(Boolean) as string[];
    for (const key of avatarKeys) initialImageUrlMap[key] = getPublicUrl(key);
  } catch (err) {
    console.error("[LogsPage] failed to load:", err);
  }

  async function fetchMore(
    entity: string,
    severity: string,
    skip: number,
  ): Promise<{
    logs: LogEntry[];
    hasMore: boolean;
    imageUrlMap: Record<string, string>;
  }> {
    "use server";
    const result = await getLogs({ entity, severity, skip });
    const avatarKeys = result.logs
      .map((l) => l.actor?.image)
      .filter(Boolean) as string[];
    const imageUrlMap = Object.fromEntries(
      avatarKeys.map((k) => [k, getPublicUrl(k)]),
    );
    return { ...result, imageUrlMap };
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Activity Logs</h1>
        <p className="mt-0.5 text-sm text-muted">
          A full history of all actions performed in the admin panel.
        </p>
      </div>

      <LogsListClient
        initialLogs={initialLogs}
        initialHasMore={initialHasMore}
        initialImageUrlMap={initialImageUrlMap}
        onLoadMore={fetchMore}
      />
    </div>
  );
}
