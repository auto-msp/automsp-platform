import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll } from "vitest";

// The json-store adapter resolves its data directory from process.cwd() at
// import time. Redirect it to a throwaway directory BEFORE any test imports
// the store, so the suite never reads or writes the real .data/store/.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testRoot = mkdtempSync(path.join(tmpdir(), "automsp-test-"));
process.chdir(testRoot);

afterAll(() => {
  process.chdir(projectRoot);
  rmSync(testRoot, { recursive: true, force: true });
});
