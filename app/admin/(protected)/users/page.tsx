import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/lib/db/users";
import { getPublicUrl } from "@/lib/site";
import UsersTable from "@/components/admin/UsersTable";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");
  if (session.role !== "admin" && session.role !== "owner") redirect("/admin");

  const users = await getAllUsers();
  const selfEmail = session.user?.email ?? "";

  const imageUrlMap = Object.fromEntries(
    users
      .map((u) => u.image)
      .filter(Boolean)
      .map((k) => [k, getPublicUrl(k as string)]),
  );

  const usersWithUrls = users.map((u) => ({
    ...u,
    imageUrl: u.image ? (imageUrlMap[u.image] ?? null) : null,
  }));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <p className="mt-0.5 text-sm text-muted">
            Manage who has access to the admin panel.
          </p>
        </div>
        {users.length > 0 && (
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
            {users.length}
          </span>
        )}
      </div>

      <div className="mt-5">
        <UsersTable
          users={usersWithUrls}
          selfEmail={selfEmail}
          selfRole={session.role}
        />
      </div>
    </div>
  );
}
