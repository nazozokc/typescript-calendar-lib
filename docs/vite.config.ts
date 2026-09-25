import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { Mode, plugin as markdown } from "vite-plugin-markdown";

// Docs site SPA.
//
// Dev:     pnpm docs:dev     (Vite dev server, HMR)
// Build:   pnpm docs:build   (vite build -> docs/dist), deployed to GitHub Pages
// Preview: pnpm docs:preview (vite preview of the built site)
//
// The config lives in docs/, so pin the root there regardless of the cwd the
// scripts are invoked from.
//
// GitHub Pages serves project sites under `/<repo>/`, so the base is fixed to
// `/typescript-calendar-lib`. Dev/preview serve under the same base path, which
// keeps asset URLs consistent and matches production; the client detects the
// base from the URL (`docs/src/nav.ts`).
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  base: "/typescript-calendar-lib",
  plugins: [
    svelte(),
    // `.md` imports (docs/guide/*.md, docs/packages/*.md) resolve to their
    // rendered HTML, matching the previous Bun markdown loader contract.
    markdown({ mode: [Mode.HTML] }),
  ],
});
