import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing: scrypt with per-user salt.
 * Stored as `scrypt$N$r$p$salt_b64$hash_b64`. No secrets ever logged.
 */

const N = 16384;
const r = 8;
const p = 1;
const KEYLEN = 32;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(plain, salt, KEYLEN, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nStr, rStr, pStr, saltB64, hashB64] = parts;
  const params = { N: Number(nStr), r: Number(rStr), p: Number(pStr) };
  if (!params.N || !params.r || !params.p) return false;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  let derived: Buffer;
  try {
    derived = scryptSync(plain, salt, expected.length, params);
  } catch {
    return false;
  }
  return timingSafeEqual(derived, expected);
}
