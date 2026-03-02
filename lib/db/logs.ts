import { prisma } from "@/lib/prismaClient";

export type UserMini = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export type LogEntry = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  entityTitle: string | null;
  actorEmail: string;
  actorName: string | null;
  actorId: string | null;
  actor: UserMini | null;
  severity: string;
  detail: string | null;
  createdAt: Date;
};

const USER_SELECT = { id: true, name: true, email: true, image: true } as const;
const LOG_INCLUDE = { actor: { select: USER_SELECT } } as const;

/** Latest N logs for the dashboard activity widget. */
export async function getRecentLogs(limit = 10): Promise<LogEntry[]> {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: LOG_INCLUDE,
  }) as Promise<LogEntry[]>;
}

export type LogsFilter = {
  entity?: string;
  severity?: string;
  skip?: number;
  take?: number;
};

export type LogsResult = {
  logs: LogEntry[];
  hasMore: boolean;
};

const PAGE = 50;

export async function getLogs(filter: LogsFilter = {}): Promise<LogsResult> {
  const { entity, severity, skip = 0, take = PAGE } = filter;

  const where = {
    ...(entity && entity !== "all" ? { entity } : {}),
    ...(severity && severity !== "all" ? { severity } : {}),
  };

  const rows = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: take + 1,
    include: LOG_INCLUDE,
  });

  const hasMore = rows.length > take;
  return { logs: rows.slice(0, take) as LogEntry[], hasMore };
}
