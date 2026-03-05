import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prismaClient";
import { getPublicUrl } from "@/lib/storage/url";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "ADMIN | VITARIA",
    template: "%s · Admin | VITARIA",
  },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const email = session.user?.email ?? "";
  const dbUser = email
    ? await prisma.user.findUnique({
        where: { email },
        select: { name: true, email: true, image: true, role: true },
      })
    : null;

  const imageViewUrl = dbUser?.image ? getPublicUrl(dbUser.image) : null;

  return (
    <AdminShell
      user={{
        name: dbUser?.name ?? null,
        email: dbUser?.email ?? email,
        imageUrl: imageViewUrl,
        role: dbUser?.role ?? "editor",
      }}
    >
      {children}
    </AdminShell>
  );
}
