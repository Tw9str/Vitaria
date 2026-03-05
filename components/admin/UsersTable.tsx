"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  createUserAction,
  deleteUserAction,
  updateUserRoleAction,
  updateUserNameAction,
  toggleBlockUserAction,
  type CreateUserState,
} from "@/app/actions/user";
import type { UserRow } from "@/lib/db/users";
import DropdownSelect, { type DropdownOption } from "./DropdownSelect";
import { useToast } from "@/components/shared/Toaster";
import Spinner from "@/components/shared/Spinner";

const ROLE_OPTIONS: DropdownOption[] = [
  { value: "owner", label: "Owner", dotClass: "bg-gold" },
  { value: "admin", label: "Admin", dotClass: "bg-blue-400" },
  { value: "editor", label: "Editor", dotClass: "bg-purple-400" },
];

// ---------------------------------------------------------------------------
// Role select cell
// ---------------------------------------------------------------------------

const ROLE_BADGE: Record<string, { dot: string; text: string; bg: string }> = {
  owner: { dot: "bg-gold", text: "text-gold", bg: "bg-gold/15" },
  admin: { dot: "bg-blue-400", text: "text-blue-400", bg: "bg-blue-500/15" },
  editor: {
    dot: "bg-purple-400",
    text: "text-purple-400",
    bg: "bg-purple-500/15",
  },
};

function RoleBadge({ role }: { role: string }) {
  const s = ROLE_BADGE[role] ?? {
    dot: "bg-subtle",
    text: "text-muted",
    bg: "bg-black/10",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-sm capitalize ${s.bg} ${s.text}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
      {role}
    </span>
  );
}

function RoleSelect({
  userId,
  currentRole,
  isSelf,
  selfRole,
}: {
  userId: string;
  currentRole: string;
  isSelf: boolean;
  selfRole: string;
}) {
  const [role, setRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();

  // Non-owners cannot assign owner, but always keep the current role visible for display
  const options =
    selfRole === "owner"
      ? ROLE_OPTIONS
      : ROLE_OPTIONS.filter(
          (o) => o.value !== "owner" || o.value === currentRole,
        );

  function handleChange(next: string) {
    const prev = role;
    setRole(next);
    startTransition(async () => {
      try {
        await updateUserRoleAction(
          userId,
          next as "owner" | "admin" | "editor",
        );
      } catch {
        setRole(prev);
      }
    });
  }

  if (isSelf) return <RoleBadge role={role} />;

  return (
    <DropdownSelect
      value={role}
      options={options}
      onChange={handleChange}
      isPending={isPending}
      disabled={false}
      ariaLabel="User role"
    />
  );
}

// ---------------------------------------------------------------------------
// Block button
// ---------------------------------------------------------------------------

function BlockButton({
  userId,
  blocked,
  isSelf,
}: {
  userId: string;
  blocked: boolean;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  if (isSelf) return null;

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleBlockUserAction(userId, !blocked);
      if (result.error) toast.error(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={blocked ? "Unblock user" : "Block user"}
      className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
        blocked
          ? "text-amber-600 hover:bg-amber-500/10"
          : "text-muted hover:bg-black/10"
      }`}
    >
      {isPending ? (
        <Spinner className="h-3 w-3" />
      ) : blocked ? (
        "Unblock"
      ) : (
        "Block"
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Delete button
// ---------------------------------------------------------------------------

function DeleteButton({ userId, isSelf }: { userId: string; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();

  if (isSelf) {
    return (
      <span className="text-xs text-subtle" title="Cannot delete yourself">
        -
      </span>
    );
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.error) toast.error(result.error);
    });
  }

  if (confirm) {
    return (
      <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition whitespace-nowrap inline-flex items-center gap-1.5"
        >
          {isPending && <Spinner className="h-3 w-3" />}
          {isPending ? "Deleting…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          disabled={isPending}
          className="cursor-pointer rounded-full p-1.5 border border-border bg-surface text-muted hover:text-text disabled:opacity-50 transition"
          aria-label="Cancel"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      disabled={isPending}
      className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
    >
      Delete
    </button>
  );
}

// ---------------------------------------------------------------------------
// Add user form
// ---------------------------------------------------------------------------

function AddUserForm({ selfRole }: { selfRole: string }) {
  const [state, action, isPending] = useActionState<CreateUserState, FormData>(
    createUserAction,
    null,
  );
  const [role, setRole] = useState("editor");
  const toast = useToast();

  const roleOptions =
    selfRole === "owner"
      ? ROLE_OPTIONS
      : ROLE_OPTIONS.filter((o) => o.value !== "owner");

  useEffect(() => {
    if (state?.success) {
      toast.success("User added successfully.");
      setRole("editor");
    } else if (state?.formError) {
      toast.error(state.formError);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      action={action}
      className="rounded-[18px] border border-border bg-surface p-5"
    >
      <h2 className="mb-4 text-sm font-semibold">Add user</h2>

      <div className="flex flex-wrap items-start gap-3">
        {/* Name */}
        <div className="flex-1 min-w-40">
          <label
            htmlFor="new-user-name"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Name
          </label>
          <input
            id="new-user-name"
            name="name"
            type="text"
            autoComplete="off"
            placeholder="John Doe"
            key={state?.success ? "name-reset" : "name"}
            defaultValue={state?.values?.name ?? ""}
            className={`w-full rounded-xl border bg-bg px-3 py-2 text-sm text-text outline-none placeholder:text-subtle transition focus-visible:ring-2 focus-visible:ring-gold/30 ${state?.fieldErrors?.name ? "border-red-500" : "border-border"}`}
          />
          {state?.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red-500">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex-1 min-w-48">
          <label
            htmlFor="new-user-email"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Email
          </label>
          <input
            id="new-user-email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="user@example.com"
            key={state?.success ? "email-reset" : "email"}
            defaultValue={state?.values?.email ?? ""}
            className={`w-full rounded-xl border bg-bg px-3 py-2 text-sm text-text outline-none placeholder:text-subtle transition focus-visible:ring-2 focus-visible:ring-gold/30 ${state?.fieldErrors?.email ? "border-red-500" : "border-border"}`}
          />
          {state?.fieldErrors?.email && (
            <p className="mt-1 text-xs text-red-500">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Role
          </label>
          <input type="hidden" name="role" value={role} />
          <DropdownSelect
            value={role}
            options={roleOptions}
            onChange={setRole}
            ariaLabel="New user role"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer rounded-xl bg-brand-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5 mt-5"
        >
          {isPending && <Spinner className="h-3.5 w-3.5" />}
          {isPending ? "Adding…" : "Add user"}
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main table
// ---------------------------------------------------------------------------

function initials(name?: string | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "?").toUpperCase();
}

// ---------------------------------------------------------------------------
// Inline name editor
// ---------------------------------------------------------------------------

function NameCell({
  userId,
  name,
  email,
  imageUrl,
  isSelf,
}: {
  userId: string;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  isSelf: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setDraft(name ?? "");
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  function save() {
    startTransition(async () => {
      const result = await updateUserNameAction(userId, draft);
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
        setError(null);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name ?? email ?? ""}
          className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border"
        />
      ) : (
        <div className="h-8 w-8 shrink-0 rounded-full bg-brand-ink text-white text-xs font-semibold flex items-center justify-center ring-1 ring-border">
          {initials(name, email)}
        </div>
      )}

      {/* Name / editor */}
      <div className="min-w-0">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              disabled={isPending}
              placeholder="Full name"
              className="w-36 rounded-lg border border-border bg-bg px-2 py-1 text-sm text-text outline-none transition focus-visible:ring-2 focus-visible:ring-gold/30 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={save}
              disabled={isPending}
              className="cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-green-600 transition hover:bg-green-500/10 disabled:opacity-50"
            >
              {isPending ? "…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={isPending}
              className="cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-muted transition hover:bg-black/10"
            >
              Cancel
            </button>
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-text truncate capitalize">
              {name ?? <span className="italic text-subtle">No name</span>}
              {isSelf && (
                <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                  you
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={startEdit}
              title="Edit name"
              className="cursor-pointer shrink-0 rounded p-0.5 text-subtle opacity-0 transition hover:text-text group-hover:opacity-100"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        )}
        <p className="mt-0.5 text-xs text-muted truncate">{email ?? "-"}</p>
      </div>
    </div>
  );
}

export default function UsersTable({
  users,
  selfEmail,
  selfRole,
}: {
  users: (UserRow & { imageUrl: string | null })[];
  selfEmail: string;
  selfRole: string;
}) {
  return (
    <div className="space-y-5">
      {/* Add user */}
      <AddUserForm selfRole={selfRole} />

      {/* Users list */}
      <div className="rounded-[18px] border border-border bg-surface overflow-hidden">
        {users.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            No users found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-semibold text-subtle">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-subtle">
                  Role
                </th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold text-subtle sm:table-cell">
                  Added
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-subtle">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => {
                const isSelf = user.email === selfEmail;
                const isOwner = selfRole === "owner";
                // Non-owners cannot touch admins or owners (except themselves)
                const targetIsPrivileged =
                  user.role === "admin" || user.role === "owner";
                const canAct = isOwner || !targetIsPrivileged;
                return (
                  <tr key={user.id} className="group">
                    <td className="px-5 py-3.5">
                      <NameCell
                        userId={user.id}
                        name={user.name}
                        email={user.email}
                        imageUrl={user.imageUrl}
                        isSelf={isSelf}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleSelect
                        userId={user.id}
                        currentRole={user.role}
                        isSelf={isSelf || !canAct}
                        selfRole={selfRole}
                      />
                    </td>
                    <td className="hidden px-5 py-3.5 text-xs text-muted sm:table-cell">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        <BlockButton
                          userId={user.id}
                          blocked={user.blocked}
                          isSelf={isSelf || !canAct}
                        />
                        <DeleteButton
                          userId={user.id}
                          isSelf={isSelf || !canAct}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
