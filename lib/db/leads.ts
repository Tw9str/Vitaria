import { prisma } from "@/lib/db/prismaClient";

/** Admin: most-recent leads, capped for the overview page. */
export async function getRecentLeads(take = 50) {
  try {
    return await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: {
        notesUpdatedBy: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });
  } catch (cause) {
    throw new Error("Failed to load leads.", { cause });
  }
}
