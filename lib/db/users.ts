import { prisma } from "@/lib/prismaClient";

export type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "owner" | "admin" | "editor";
  blocked: boolean;
  createdAt: Date;
};

export async function getAllUsers(): Promise<UserRow[]> {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      blocked: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}
