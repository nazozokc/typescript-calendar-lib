import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@typescript-calendar-lib/core": resolve("../core/src/index.ts"),
      "@typescript-calendar-lib/tui": resolve("../tui/src/index.ts"),
    },
  },
});
