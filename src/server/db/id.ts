import { randomBytes } from "node:crypto";

/** URL-safe id, 16 chars. Used across all dev-store records. */
export function newId(): string {
  return randomBytes(12).toString("base64url");
}
