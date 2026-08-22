// Seed the AutoMSP operator workspace in the local JSON dev store.
//
// The commercial workspace (audits inbox, pipeline, clients, projects) lives in
// the organization with kind "automsp". Dev stores created before slice 6 have
// only customer orgs, so /app/commercial has no tenant to read. This script
// creates the operator org + two internal users, idempotently.
//
//   node scripts/seed-operator.mjs            # write (default password demo12345a)
//   OPERATOR_PASSWORD=... node scripts/seed-operator.mjs
//
// Local dev only — production tenants are provisioned through the platform, not
// this script. The demo password never leaves the local store.

import { scryptSync, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";

const STORE_DIR = join(process.cwd(), ".data", "store");
const PASSWORD = process.env.OPERATOR_PASSWORD || "demo12345a";

function hashPassword(plain) {
  const N = 16384, r = 8, p = 1, KEYLEN = 64;
  const salt = randomBytes(16);
  const derived = scryptSync(plain, salt, KEYLEN, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

function read(name) {
  const file = join(STORE_DIR, `${name}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
}

// mirror the json-store's atomic write (tmp + rename)
function write(name, rows) {
  const file = join(STORE_DIR, `${name}.json`);
  const tmp = `${file}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(rows, null, 2));
  renameSync(tmp, file);
}

const now = new Date().toISOString();
const id = () => randomBytes(8).toString("hex");

const orgs = read("organizations");
let operator = orgs.find((o) => o.kind === "automsp");
if (!operator) {
  operator = {
    id: id(),
    name: "AutoMSP",
    slug: "automsp",
    kind: "automsp",
    industry: "AI automation services",
    size: "1–50 employees",
    createdAt: now,
    updatedAt: now,
  };
  orgs.push(operator);
  write("organizations", orgs);
  console.log(`created operator org ${operator.id}`);
} else {
  console.log(`operator org exists: ${operator.id}`);
}

const users = read("users");
const memberships = read("memberships");

function ensureUser(email, name, role) {
  let user = users.find((u) => u.email === email);
  if (!user) {
    user = { id: id(), email, name, passwordHash: hashPassword(PASSWORD), createdAt: now };
    users.push(user);
    console.log(`created user ${email}`);
  }
  const existing = memberships.find(
    (m) => m.userId === user.id && m.organizationId === operator.id,
  );
  if (!existing) {
    memberships.push({
      id: id(),
      organizationId: operator.id,
      userId: user.id,
      role,
      createdAt: now,
    });
    console.log(`granted ${email} role ${role}`);
  }
}

ensureUser("operator@automsp.us", "AutoMSP Operator", "automsp_operator");
ensureUser("analyst@automsp.us", "AutoMSP Analyst", "automsp_analyst");

write("users", users);
write("memberships", memberships);
console.log("done — sign in as operator@automsp.us /", PASSWORD === "demo12345a" ? "demo12345a" : "(custom password)");
