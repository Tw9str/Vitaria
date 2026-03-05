import type { Role } from "@prisma/client";

/** Role hierarchy - higher index = more permissions. */
const ROLE_RANK: Record<Role, number> = {
  editor: 0,
  admin: 1,
  owner: 2,
};

/**
 * Returns true if `role` meets or exceeds `required`.
 */
export function hasRole(role: Role | undefined, required: Role): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[required];
}

/**
 * Throws if the actor's role is below `required`.
 */
export function requireRole(role: Role | undefined, required: Role): void {
  if (!hasRole(role, required)) throw new Error("FORBIDDEN");
}

/** Require at least admin (owner passes too). */
export const requireAdmin = (role: Role | undefined) =>
  requireRole(role, "admin");

/** Require owner exactly. */
export const requireOwner = (role: Role | undefined) =>
  requireRole(role, "owner");

/**
 * Throws if the user is not authenticated at all.
 * Allows editor, admin, and owner - use for actions available to all staff.
 */
export function requireAuth(role: Role | undefined): void {
  if (!role) throw new Error("FORBIDDEN");
}
