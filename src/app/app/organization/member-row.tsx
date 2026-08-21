"use client";

import { useActionState } from "react";
import { formatRole } from "@/server/roles";
import type { Role } from "@/server/db/types";
import { changeMemberRoleAction, removeMemberAction, type OrgFormState } from "./actions";
import { formatDate } from "@/lib/format";

export function MemberRow({
  membershipId,
  name,
  email,
  role,
  createdAt,
  isSelf,
  canManage,
}: {
  membershipId: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  isSelf: boolean;
  canManage: boolean;
}) {
  const changeRole = changeMemberRoleAction.bind(null, membershipId);
  const remove = removeMemberAction.bind(null, membershipId);
  const [changeState, changeAction, changePending] = useActionState<OrgFormState | null, FormData>(
    changeRole,
    null,
  );
  const [removeState, removeAction, removePending] = useActionState<OrgFormState | null, FormData>(
    remove,
    null,
  );

  return (
    <tr className="border-b border-fog last:border-0">
      <td className="px-4 py-3 font-medium text-ink">
        {name}
        {isSelf ? <span className="ml-2 text-[11px] text-mute">(you)</span> : null}
      </td>
      <td className="px-4 py-3 text-slate">{email}</td>
      <td className="px-4 py-3">
        {canManage && !isSelf ? (
          <form action={changeAction}>
            <select
              name="role"
              defaultValue={role}
              disabled={changePending}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="border border-fog bg-surface px-2 py-1 text-[13px] text-ink focus:border-ink focus:outline-none"
              aria-label={`Role for ${name}`}
            >
              <option value="customer_owner">Owner</option>
              <option value="customer_admin">Admin</option>
              <option value="customer_member">Member</option>
              <option value="customer_viewer">Viewer</option>
            </select>
          </form>
        ) : (
          <span className="text-slate">{formatRole(role)}</span>
        )}
        {changeState?.error ? <p className="mt-1 text-xs text-risk">{changeState.error}</p> : null}
      </td>
      <td className="tnum px-4 py-3 text-slate">{formatDate(createdAt)}</td>
      {canManage ? (
        <td className="px-4 py-3 text-right">
          {!isSelf ? (
            <form
              action={removeAction}
              onSubmit={(e) => {
                if (!window.confirm(`Remove ${name} from the organization?`)) e.preventDefault();
              }}
            >
              <button
                type="submit"
                disabled={removePending}
                className="text-[13px] text-risk hover:underline disabled:opacity-60"
              >
                {removePending ? "Removing…" : "Remove"}
              </button>
              {removeState?.error ? (
                <p className="mt-1 text-xs text-risk">{removeState.error}</p>
              ) : null}
            </form>
          ) : null}
        </td>
      ) : null}
    </tr>
  );
}
