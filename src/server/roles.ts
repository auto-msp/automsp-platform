import type { Role } from "@/server/db/types";

const LABELS: Record<Role, string> = {
  platform_owner: "Platform owner",
  automsp_admin: "AutoMSP admin",
  automsp_operator: "AutoMSP operator",
  automsp_analyst: "AutoMSP analyst",
  customer_owner: "Owner",
  customer_admin: "Admin",
  customer_member: "Member",
  customer_viewer: "Viewer",
};

export function formatRole(role: Role): string {
  return LABELS[role] ?? role;
}
