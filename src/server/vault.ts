import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { IntegrationRecord } from "./db/types";
import { store } from "./db/store";
import { newId } from "./db/id";

/**
 * Credential vault (boundary module for the Integrations domain).
 *
 * Secrets are sealed with AES-256-GCM. Key material comes from
 * AUTOMSP_VAULT_KEY (base64, 32 bytes) in production. In this development
 * environment, if that variable is absent, a random key is generated once into
 * `.data/vault.key` — gitignored, local-only, and labeled as such. Production
 * deploys swap this file's storage backend for a managed KMS; the seal/open
 * interface stays identical.
 *
 * Invariants enforced here:
 *  - plaintext secrets never leave this module (callers receive opaque ids)
 *  - secrets are never written to logs, audit trails, or the frontend
 */

const DEV_KEY_FILE = path.join(process.cwd(), ".data", "vault.key");
let cachedKey: Buffer | null = null;

async function loadVaultKey(): Promise<Buffer> {
  if (cachedKey) return cachedKey;

  const envKey = process.env.AUTOMSP_VAULT_KEY?.trim();
  if (envKey) {
    const raw = Buffer.from(envKey, "base64");
    if (raw.length !== 32) {
      throw new Error("AUTOMSP_VAULT_KEY must decode to exactly 32 bytes (base64)");
    }
    cachedKey = raw;
    return raw;
  }

  // Development mode: persistent random key in gitignored .data/ so sealed
  // records survive restarts.
  try {
    const existing = await readFile(DEV_KEY_FILE, "utf8");
    const raw = Buffer.from(existing.trim(), "base64");
    if (raw.length === 32) {
      cachedKey = raw;
      return raw;
    }
  } catch {
    // fall through to generation
  }
  const generated = randomBytes(32);
  await mkdir(path.dirname(DEV_KEY_FILE), { recursive: true });
  await writeFile(DEV_KEY_FILE, generated.toString("base64") + "\n", "utf8");
  cachedKey = generated;
  return generated;
}

/**
 * Seal a plaintext secret into an opaque base64 blob.
 * Layout inside the blob: iv (12B) | authTag (16B) | ciphertext.
 */
export async function sealSecret(plaintext: string): Promise<string> {
  const key = await loadVaultKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, data]).toString("base64");
}

/**
 * Unseal a vault blob. Returns null when the blob is malformed or the key
 * does not match (e.g. vault key rotated without re-sealing) — callers treat
 * that as "credential unusable" and never get partial plaintext.
 */
export async function openSecret(sealed: string): Promise<string | null> {
  try {
    const key = await loadVaultKey();
    const blob = Buffer.from(sealed, "base64");
    if (blob.length < 12 + 16 + 1) return null;
    const iv = blob.subarray(0, 12);
    const tag = blob.subarray(12, 28);
    const data = blob.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** Store a new credential. Returns the public record (no secret material). */
export async function storeCredential(params: {
  organizationId: string;
  providerKey: string;
  name: string;
  authType: "api_token" | "header_secret";
  secret: string;
  createdBy: string;
}): Promise<IntegrationRecord> {
  const now = new Date().toISOString();
  const record: IntegrationRecord = {
    id: newId(),
    organizationId: params.organizationId,
    providerKey: params.providerKey,
    name: params.name,
    authType: params.authType,
    status: "active",
    sealedSecret: await sealSecret(params.secret),
    secretPreview: params.secret.slice(-4),
    createdBy: params.createdBy,
    createdAt: now,
    updatedAt: now,
    lastUsedAt: null,
  };
  return store.insert("integrations", record);
}

/** Revoke a credential. Sealed material is destroyed with the record. */
export async function revokeCredential(
  organizationId: string,
  id: string,
): Promise<boolean> {
  const row = await store.get("integrations", id);
  if (!row || row.organizationId !== organizationId) return false;
  await store.update("integrations", id, {
    status: "revoked",
    sealedSecret: "",
    secretPreview: "",
    updatedAt: new Date().toISOString(),
  });
  return true;
}

/**
 * True when a production-quality vault key is configured. The integrations UI
 * surfaces this so developers know the store is using the dev key file.
 */
export function usingDevVaultKey(): boolean {
  return !process.env.AUTOMSP_VAULT_KEY?.trim();
}
