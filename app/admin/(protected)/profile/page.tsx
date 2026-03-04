import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prismaClient";
import { getPublicUrl } from "@/lib/storage/url";
import ProfileEditor from "@/components/admin/ProfileEditor";

export default async function Profile() {
  const session = await auth();
  const email = session?.user?.email ?? "";

  const user = email
    ? await prisma.user.findUnique({
        where: { email },
        select: {
          name: true,
          email: true,
          image: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      })
    : null;

  // Build public URL for the stored R2 avatar key (if any)
  const imageViewUrl = user?.image ? getPublicUrl(user.image) : null;

  return (
    <ProfileEditor
      name={user?.name ?? null}
      email={user?.email ?? email}
      image={user?.image ?? null}
      imageViewUrl={imageViewUrl}
      role={user?.role ?? "editor"}
      emailVerified={user?.emailVerified ?? null}
      createdAt={user?.createdAt ?? new Date()}
    />
  );
}
