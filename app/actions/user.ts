"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prismaClient";
import { requireAdmin, requireOwner, hasRole } from "@/lib/utils/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { appendLog } from "@/lib/db/logger";
import { deleteStorageKeys } from "@/lib/storage/storage";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAdminSession() {
  const session = await auth();
  requireAdmin(session?.role);
  return session!;
}

// ---------------------------------------------------------------------------
// Create user
// ---------------------------------------------------------------------------

export type CreateUserState = {
  fieldErrors?: { email?: string[]; name?: string[] };
  formError?: string;
  success?: boolean;
  values?: { name: string; email: string };
} | null;

const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .toLowerCase(),
  name: z
    .string()
    .min(1, "Name is required.")
    .max(120, "Name must be 120 characters or fewer."),
  role: z.enum(["owner", "admin", "editor"]).default("editor"),
});

export async function createUserAction(
  _prev: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const actorSession = await getAdminSession();

  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "editor"),
  };

  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: { email?: string[]; name?: string[] } = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as "email" | "name" | undefined;
      if (field) {
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field]!.push(issue.message);
      }
    }
    return { fieldErrors, values: { name: raw.name, email: raw.email } };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) {
    return {
      fieldErrors: { email: ["A user with this email already exists."] },
      values: { name: raw.name, email: raw.email },
    };
  }

  try {
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        role: parsed.data.role as Role,
      },
    });
  } catch {
    return { formError: "Failed to create user. Please try again." };
  }

  void appendLog({
    actorEmail: actorSession?.user?.email ?? "unknown",
    actorName: actorSession?.user?.name ?? undefined,
    actorId: actorSession?.user?.id ?? null,
    action: "USER_CREATED",
    entity: "user",
    entityTitle: parsed.data.email,
    detail: `${parsed.data.name} · Role: ${parsed.data.role}`,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update user name
// ---------------------------------------------------------------------------

export async function updateUserNameAction(
  userId: string,
  name: string,
): Promise<{ error?: string }> {
  const session = await getAdminSession();

  const trimmed = name.trim();
  if (trimmed.length > 120) return { error: "Name is too long." };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { name: trimmed || null },
    });
    void appendLog({
      actorEmail: session?.user?.email ?? "unknown",
      actorName: session?.user?.name ?? undefined,
      actorId: session?.user?.id ?? null,
      action: "USER_RENAMED",
      entity: "user",
      entityId: userId,
      entityTitle: user?.email ?? userId,
      detail: `Name → "${trimmed}"`,
    });
  } catch {
    return { error: "Failed to update name." };
  }

  revalidatePath("/admin/users");
  return {};
}

// ---------------------------------------------------------------------------
// Update user role
// ---------------------------------------------------------------------------

export async function updateUserRoleAction(
  userId: string,
  role: Role,
): Promise<{ error?: string }> {
  const session = await getAdminSession();
  const actorRole = session.role as Role;

  // Only owner can assign or demote to/from owner
  if (role === "owner" && !hasRole(actorRole, "owner")) {
    return { error: "Only an owner can assign the owner role." };
  }

  // Fetch target to check their current role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true },
  });

  // Prevent demoting an owner unless actor is also owner
  if (user?.role === "owner" && !hasRole(actorRole, "owner")) {
    return { error: "Only an owner can change another owner's role." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    void appendLog({
      actorEmail: session?.user?.email ?? "unknown",
      actorName: session?.user?.name ?? undefined,
      actorId: session?.user?.id ?? null,
      action: "USER_ROLE_CHANGED",
      entity: "user",
      entityId: userId,
      entityTitle: user?.email ?? userId,
      detail: `Role → ${role}`,
    });
  } catch {
    return { error: "Failed to update role." };
  }

  revalidatePath("/admin/users");
  return {};
}

// ---------------------------------------------------------------------------
// Block / unblock user
// ---------------------------------------------------------------------------

export async function toggleBlockUserAction(
  userId: string,
  blocked: boolean,
): Promise<{ error?: string }> {
  const session = await getAdminSession();
  const actorRole = session.role as Role;

  // Prevent self-block
  const selfEmail = session.user?.email ?? "";
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, role: true },
  });
  if (target?.email && target.email === selfEmail) {
    return { error: "You cannot block your own account." };
  }

  // Only owner can block admins or owners
  if (target?.role === "admin" || target?.role === "owner") {
    if (!hasRole(actorRole, "owner")) {
      return { error: "Only an owner can block admin or owner accounts." };
    }
  }

  try {
    await prisma.user.update({ where: { id: userId }, data: { blocked } });
    // If blocking, also kill their active sessions immediately.
    if (blocked) {
      await prisma.session.deleteMany({ where: { userId } });
    }
  } catch {
    return { error: `Failed to ${blocked ? "block" : "unblock"} user.` };
  }

  const targetLabel = target?.name ?? target?.email ?? userId;
  const actorLabel = session?.user?.name ?? session?.user?.email ?? "Someone";
  void appendLog({
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name ?? undefined,
    actorId: session?.user?.id ?? null,
    action: blocked ? "USER_BLOCKED" : "USER_UNBLOCKED",
    entity: "user",
    entityId: userId,
    entityTitle: targetLabel,
    detail: blocked
      ? `${actorLabel} blocked ${targetLabel}`
      : `${actorLabel} unblocked ${targetLabel}`,
    severity: blocked ? "warning" : "info",
  });

  revalidatePath("/admin/users");
  return {};
}

// ---------------------------------------------------------------------------
// Delete user
// ---------------------------------------------------------------------------

export async function deleteUserAction(
  userId: string,
): Promise<{ error?: string }> {
  const session = await getAdminSession();
  const actorRole = session.role as Role;

  // Prevent self-deletion
  const selfEmail = session.user?.email ?? "";
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, role: true, image: true },
  });
  if (target?.email && target.email === selfEmail) {
    return { error: "You cannot delete your own account." };
  }

  // Only owner can delete admins or owners
  if (target?.role === "admin" || target?.role === "owner") {
    if (!hasRole(actorRole, "owner")) {
      return { error: "Only an owner can delete admin or owner accounts." };
    }
  }

  try {
    // Delete avatar from R2 if one exists
    if (target?.image) {
      await deleteStorageKeys([target.image]);
    }
    await prisma.user.delete({ where: { id: userId } });
  } catch {
    return { error: "Failed to delete user." };
  }

  const targetLabel = target?.name ?? target?.email ?? userId;
  const actorLabel = session?.user?.name ?? session?.user?.email ?? "Someone";
  void appendLog({
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name ?? undefined,
    actorId: session?.user?.id ?? null,
    action: "USER_DELETED",
    entity: "user",
    entityId: userId,
    entityTitle: targetLabel,
    detail: `${actorLabel} deleted ${targetLabel}`,
    severity: "warning",
  });

  revalidatePath("/admin/users");
  return {};
}
