import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
      // "server-only" is a Next build-time guard; it has no runtime meaning
      // under Vitest, so point it at an empty stub.
      "server-only": path.resolve(root, "tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // The json-store resolves its data directory from process.cwd() at import
    // time; the setup file (run in every worker before the suites) points cwd
    // at a throwaway temp dir so tests never touch the real .data/store/.
    setupFiles: ["tests/setup.ts"],
  },
});
