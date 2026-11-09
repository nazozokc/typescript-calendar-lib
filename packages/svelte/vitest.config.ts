import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [
    // `@testing-library/svelte-core` ships rune-based `.svelte.js` modules inside
    // node_modules. Clearing `exclude` lets the Svelte compiler handle them;
    // without it they reach the runner uncompiled and throw `rune_outside_svelte`.
    svelte({ exclude: [] }),
  ],
  resolve: {
    // jsdom 環境のため svelte の client ビルドを使う（server ビルドだと mount が使えない）
    conditions: ["browser"],
    alias: {
      "@typescript-calendar-lib/core": resolve("../core/src/index.ts"),
      "@typescript-calendar-lib/tui": resolve("../tui/src/index.ts"),
      "@typescript-calendar-lib/web": resolve("../web/src/index.ts"),
    },
  },
  test: {
    // The rune modules above are only transformed when they are inlined into the
    // Vite module graph, so keep the Testing Library packages out of the externalized set.
    server: {
      deps: {
        inline: [/@testing-library[\\/]svelte/],
      },
    },
    environment: "jsdom",
    include: ["test/**/*.test.{ts,svelte}"],
  },
});
