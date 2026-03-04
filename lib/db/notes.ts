import { prisma } from "@/lib/db/prismaClient";

export type UserMini = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export type NoteItem = {
  id: string;
  content: string;
  pinned: boolean;
  authorId: string | null;
  author: UserMini | null;
  createdAt: Date;
  updatedAt: Date;
};

const USER_SELECT = { id: true, name: true, email: true, image: true } as const;

export async function getNotes(): Promise<NoteItem[]> {
  return prisma.note.findMany({
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    include: { author: { select: USER_SELECT } },
  }) as Promise<NoteItem[]>;
}
