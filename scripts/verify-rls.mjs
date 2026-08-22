/**
 * RLS verification harness.
 *
 * Runs the full migration set plus docs/rls-policies.sql against an embedded
 * Postgres (PGlite — the WASM build of Postgres 16, real SQL engine, no
 * server needed) and executes the verification queries from the bottom of
 * the policy script:
 *
 *   1. org-scoped reads return only the context org's rows
 *   2. cross-org INSERT is rejected by the policy (WITH CHECK)
 *   3. FK-child policies (automation_versions) enforce the same boundary
 *   4. organizations is self-read only
 *   5. unset context ⇒ deny-all default
 *
 * What this proves: the SQL is syntactically valid on Postgres 16 and the
 * policies enforce tenant isolation as designed, on a real Postgres engine.
 * What it does NOT prove: behaviour of your specific staging database —
 * managed Postgres provisioning, the automsp_app login role in your pooler,
 * and the pool's `DISCARD ALL` on release still need a staging pass.
 *
 * Usage: node scripts/verify-rls.mjs   (exit 0 = all checks passed)
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

const root = process.cwd();
let failures = 0;

function check(name, cond, detail = "") {
  const mark = cond ? "PASS" : "FAIL";
  if (!cond) failures += 1;
  console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
}

const db = new PGlite();

// 1. Apply every migration in order.
const migDir = path.join(root, "prisma", "migrations");
for (const dir of readdirSync(migDir).sort()) {
  const file = path.join(migDir, dir, "migration.sql");
  await db.exec(readFileSync(file, "utf8"));
  console.log(`migration applied: ${dir}`);
}

// 2. Apply the RLS policy script under test.
await db.exec(readFileSync(path.join(root, "docs", "rls-policies.sql"), "utf8"));
console.log("rls-policies.sql applied");

// 3. Grant table privileges so the checks exercise RLS itself, not ACLs.
//    (The policy script deliberately leaves grants to staging hardening.)
await db.exec(`
  GRANT USAGE ON SCHEMA public TO automsp_app;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO automsp_app;
`);

// 4. Seed two tenant orgs with rows in a direct table and an FK child.
await db.exec(`
  INSERT INTO organizations (id, name, slug, kind, updated_at) VALUES
    ('org-a', 'Org A', 'org-a', 'customer', now()),
    ('org-b', 'Org B', 'org-b', 'customer', now());
  INSERT INTO automations (id, organization_id, name, status, updated_at) VALUES
    ('auto-a', 'org-a', 'A automation', 'active', now()),
    ('auto-b', 'org-b', 'B automation', 'active', now());
  INSERT INTO automation_versions (id, automation_id, version, definition) VALUES
    ('ver-a', 'auto-a', 1, '{}'),
    ('ver-b', 'auto-b', 1, '{}');
`);

// 5. Become the application role for everything that follows.
await db.exec("SET ROLE automsp_app");

// ── Check 1: org-scoped reads ────────────────────────────────────────────────
await db.exec("BEGIN");
await db.exec("SET LOCAL automsp.org_id = 'org-a'");
const own = await db.query("SELECT count(*)::int AS n FROM automations");
check("org context sees only its own automations", own.rows[0].n === 1, `count=${own.rows[0].n}`);
const foreign = await db.query(
  "SELECT count(*)::int AS n FROM automations WHERE organization_id = 'org-b'",
);
check("org context cannot read another org's rows", foreign.rows[0].n === 0);
const child = await db.query("SELECT count(*)::int AS n FROM automation_versions");
check("FK-child rows scoped via parent (org A sees 1 version)", child.rows[0].n === 1);
const orgs = await db.query("SELECT count(*)::int AS n FROM organizations");
check("organizations self-read only", orgs.rows[0].n === 1);

// ── Check 2: cross-org INSERT must fail ──────────────────────────────────────
let smuggleBlocked = false;
try {
  await db.query(
    "INSERT INTO automations (id, organization_id, name, status, updated_at) VALUES ('smuggle', 'org-b', 'smuggle', 'draft', now())",
  );
} catch {
  smuggleBlocked = true;
}
check("cross-org INSERT rejected by WITH CHECK", smuggleBlocked);
await db.exec("ROLLBACK");

// ── Check 3: FK-child INSERT across the boundary must fail ──────────────────
await db.exec("BEGIN");
await db.exec("SET LOCAL automsp.org_id = 'org-a'");
let childSmuggleBlocked = false;
try {
  await db.query(
    "INSERT INTO automation_versions (id, automation_id, version, definition) VALUES ('ver-x', 'auto-b', 2, '{}')",
  );
} catch {
  childSmuggleBlocked = true;
}
check("FK-child INSERT into another org's parent rejected", childSmuggleBlocked);
await db.exec("ROLLBACK");

// ── Check 4: unset context ⇒ deny-all ────────────────────────────────────────
const noContext = await db.query("SELECT count(*)::int AS n FROM automations");
check("unset tenant context denies all reads", noContext.rows[0].n === 0);

await db.close();

console.log(
  failures === 0
    ? "\nAll RLS checks passed on embedded Postgres 16 (PGlite)."
    : `\n${failures} check(s) FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);
