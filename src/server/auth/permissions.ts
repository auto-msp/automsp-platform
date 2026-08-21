import type { Role } from "@/server/db/types";

/**
 * Role → permission map. Server-side enforcement lives in
 * requireRole()/hasPermission() callers — never only in the UI.
 */

export const ALL_PERMISSIONS = [
  "org.view",
  "org.update",
  "members.invite",
  "systems.view",
  "systems.manage",
  "systems.operate",
  "automations.view",
  "automations.manage",
  "automations.run",
  "executions.view",
  "approvals.view",
  "approvals.decide",
  "analytics.view",
  "billing.view",
  "billing.manage",
  "platform.admin",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  platform_owner: ALL_PERMISSIONS,
  automsp_admin: ALL_PERMISSIONS.filter((p) => p !== "platform.admin"),
  automsp_operator: [
    "org.view",
    "systems.view",
    "systems.operate",
    "automations.view",
    "automations.manage",
    "automations.run",
    "executions.view",
    "approvals.view",
    "approvals.decide",
    "analytics.view",
  ],
  automsp_analyst: ["org.view", "systems.view", "automations.view", "executions.view", "analytics.view"],
  customer_owner: [
    "org.view",
    "org.update",
    "members.invite",
    "systems.view",
    "systems.manage",
    "systems.operate",
    "automations.view",
    "automations.manage",
    "automations.run",
    "executions.view",
    "approvals.view",
    "approvals.decide",
    "analytics.view",
    "billing.view",
    "billing.manage",
  ],
  customer_admin: [
    "org.view",
    "org.update",
    "members.invite",
    "systems.view",
    "systems.manage",
    "systems.operate",
    "automations.view",
    "automations.manage",
    "automations.run",
    "executions.view",
    "approvals.view",
    "approvals.decide",
    "analytics.view",
    "billing.view",
  ],
  customer_member: [
    "org.view",
    "systems.view",
    "systems.operate",
    "automations.view",
    "automations.run",
    "executions.view",
    "approvals.view",
    "approvals.decide",
    "analytics.view",
  ],
  customer_viewer: ["org.view", "systems.view", "automations.view", "executions.view", "analytics.view"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function permissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
