import { afterEach, describe, expect, it } from "vitest";
import { schedulerEnabled } from "@/server/scheduler";
import { store } from "@/server/db/store";
import { newId } from "@/server/db/id";
import type { SystemRecord } from "@/server/db/types";

describe("schedulerEnabled (multi-instance switch)", () => {
  const ORIGINAL = process.env.AUTOMSP_SCHEDULER;
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.AUTOMSP_SCHEDULER;
    else process.env.AUTOMSP_SCHEDULER = ORIGINAL;
  });

  it("defaults to enabled when unset or blank", () => {
    delete process.env.AUTOMSP_SCHEDULER;
    expect(schedulerEnabled()).toBe(true);
    process.env.AUTOMSP_SCHEDULER = "   ";
    expect(schedulerEnabled()).toBe(true);
  });

  it("disables on off/0/false/no/disabled, case-insensitively", () => {
    for (const v of ["off", "OFF", "0", "false", "False", "no", "disabled"]) {
      process.env.AUTOMSP_SCHEDULER = v;
      expect(schedulerEnabled()).toBe(false);
    }
  });

  it("stays enabled for any other value", () => {
    for (const v of ["on", "1", "true", "yes"]) {
      process.env.AUTOMSP_SCHEDULER = v;
      expect(schedulerEnabled()).toBe(true);
    }
  });
});

describe("store.query (equality pushdown)", () => {
  const orgA = `org-query-${newId()}`;
  const orgB = `org-query-${newId()}`;

  function system(organizationId: string, name: string): SystemRecord {
    const now = new Date().toISOString();
    return {
      id: newId(),
      organizationId,
      name,
      description: "test system",
      status: "healthy",
      businessOutcome: "test",
      ownerName: "test",
      createdAt: now,
      updatedAt: now,
    };
  }

  it("filters by a single equality field", async () => {
    await store.insert("systems", system(orgA, "A1"));
    await store.insert("systems", system(orgB, "B1"));
    const rows = await store.query("systems", { organizationId: orgA });
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe("A1");
  });

  it("ANDs multiple fields and returns [] when nothing matches", async () => {
    await store.insert("systems", system(orgA, "A2"));
    const both = await store.query("systems", { organizationId: orgA, name: "A2" });
    expect(both.length).toBe(1);
    const none = await store.query("systems", { organizationId: orgA, name: "nope" });
    expect(none.length).toBe(0);
  });
});
