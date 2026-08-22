import { describe, expect, it } from "vitest";
import { hasPermission, permissionsForRole } from "@/server/auth/permissions";
import type { Role } from "@/server/db/types";

const ALL_ROLES: Role[] = [
  "platform_owner",
  "automsp_admin",
  "automsp_operator",
  "automsp_analyst",
  "customer_owner",
  "customer_admin",
  "customer_member",
  "customer_viewer",
];

describe("permission matrix", () => {
  it("the commercial workspace is AutoMSP-internal — no customer role gets it", () => {
    expect(hasPermission("automsp_operator", "commercial.view")).toBe(true);
    expect(hasPermission("automsp_operator", "commercial.manage")).toBe(true);
    expect(hasPermission("automsp_analyst", "commercial.view")).toBe(true);
    expect(hasPermission("automsp_analyst", "commercial.manage")).toBe(false);
    for (const role of ["customer_owner", "customer_admin", "customer_member", "customer_viewer"] as Role[]) {
      expect(hasPermission(role, "commercial.view")).toBe(false);
      expect(hasPermission(role, "commercial.manage")).toBe(false);
    }
  });

  it("billing stays customer-side — operator roles do not manage customer billing", () => {
    expect(hasPermission("customer_owner", "billing.manage")).toBe(true);
    expect(hasPermission("customer_admin", "billing.view")).toBe(true);
    expect(hasPermission("automsp_operator", "billing.manage")).toBe(false);
  });

  it("consequential-action approval rights are limited to operators and above", () => {
    expect(hasPermission("customer_viewer", "approvals.decide")).toBe(false);
    expect(hasPermission("automsp_analyst", "approvals.decide")).toBe(false);
    expect(hasPermission("customer_member", "approvals.decide")).toBe(true);
  });

  it("only the platform owner holds platform.admin", () => {
    for (const role of ALL_ROLES) {
      expect(hasPermission(role, "platform.admin")).toBe(role === "platform_owner");
    }
  });

  it("every role has a non-empty, duplicate-free permission set", () => {
    for (const role of ALL_ROLES) {
      const perms = permissionsForRole(role);
      expect(perms.length).toBeGreaterThan(0);
      expect(new Set(perms).size).toBe(perms.length);
    }
  });
});
