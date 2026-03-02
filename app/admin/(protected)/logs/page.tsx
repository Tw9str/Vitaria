import { getLogs, type LogEntry } from "@/lib/db/logs";
import { presignViewUrls } from "@/lib/storage";
import LogsListClient from "@/components/admin/logs/LogsListClient";

export const metadata = { title: "Activity Logs · Admin" };

export default async function LogsPage() {
  let initialLogs: LogEntry[] = [];
  let initialHasMore = false;
  let initialImageUrlMap: Record<string, string> = {};

  try {
    const result = await getLogs({ skip: 0 });
    initialLogs = result.logs;
    initialHasMore = result.hasMore;

    // Presign actor avatar keys
    const avatarKeys = initialLogs
      .map((l) => l.actor?.image)
      .filter(Boolean) as string[];
    if (avatarKeys.length) {
      const signed = await presignViewUrls(avatarKeys).catch(() => []);
      for (const { key, viewUrl } of signed) {
        if (viewUrl) initialImageUrlMap[key] = viewUrl;
      }
    }
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
    let imageUrlMap: Record<string, string> = {};
    if (avatarKeys.length) {
      const signed = await presignViewUrls(avatarKeys).catch(() => []);
      for (const { key, viewUrl } of signed) {
        if (viewUrl) imageUrlMap[key] = viewUrl;
      }
    }
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
