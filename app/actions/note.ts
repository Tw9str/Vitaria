"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { requireAuth } from "@/lib/utils/rbac";
import { prisma } from "@/lib/db/prismaClient";
import { appendLog } from "@/lib/db/logger";

export async function createNoteAction(content: string): Promise<void> {
  const session = await auth();
  requireAuth(session?.role);
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
    actorId: session?.user?.id ?? null,
  };

  const trimmed = content.trim();
  if (!trimmed) return;

  const note = await prisma.note.create({
    data: { content: trimmed, authorId: session?.user?.id ?? null },
  });
  void appendLog({
    ...actor,
    action: "NOTE_CREATED",
    entity: "note",
    entityId: note.id,
    entityTitle: trimmed.slice(0, 60),
    detail: trimmed.length > 60 ? trimmed.slice(0, 80) + "…" : trimmed,
  });
  revalidatePath("/admin");
}

export async function updateNoteAction(
  id: string,
  content: string,
): Promise<void> {
  const session = await auth();
  requireAuth(session?.role);
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
    actorId: session?.user?.id ?? null,
  };

  await prisma.note.update({
    where: { id },
    data: { content: content.trim() },
  });
  void appendLog({
    ...actor,
    action: "NOTE_UPDATED",
    entity: "note",
    entityId: id,
    entityTitle: content.trim().slice(0, 60),
    detail:
      content.trim().length > 60
        ? content.trim().slice(0, 80) + "…"
        : content.trim(),
  });

  revalidatePath("/admin");
}

export async function deleteNoteAction(id: string): Promise<void> {
  const session = await auth();
  requireAuth(session?.role);
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
    actorId: session?.user?.id ?? null,
  };

  const note = await prisma.note.findUnique({
    where: { id },
    select: { content: true },
  });
  await prisma.note.delete({ where: { id } });
  void appendLog({
    ...actor,
    action: "NOTE_DELETED",
    entity: "note",
    entityId: id,
    entityTitle: note?.content?.slice(0, 60),
    detail: note?.content
      ? note.content.length > 60
        ? note.content.slice(0, 80) + "…"
        : note.content
      : undefined,
    severity: "warning",
  });
  revalidatePath("/admin");
}

export async function toggleNotePinAction(
  id: string,
  pinned: boolean,
): Promise<void> {
  const session = await auth();
  requireAuth(session?.role);
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
    actorId: session?.user?.id ?? null,
  };

  await prisma.note.update({
    where: { id },
    data: { pinned },
  });
  void appendLog({
    ...actor,
    action: pinned ? "NOTE_PINNED" : "NOTE_UNPINNED",
    entity: "note",
    entityId: id,
    detail: pinned ? "Pinned to top" : "Unpinned",
  });
  revalidatePath("/admin");
}
