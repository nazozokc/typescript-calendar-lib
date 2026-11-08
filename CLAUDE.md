# CLAUDE.md

Default to using pnpm + Node.js.

- Use `pnpm <script>` to run repo scripts.
- Use `node <file>` instead of `ts-node <file>`.
- Use `pnpm test` (vitest) to run the test suite.
- Use `pnpm build` (tsdown) to build packages; use `vite build` for the docs site.
- Use `pnpm install` instead of `npm install` or `yarn install` or `bun install`.
- Use `pnpm dlx <package> <command>` instead of `npx <package> <command>`.
- This repo does not use Bun. If you see `bun` in a command, replace it with the pnpm/Node equivalent.
- pnpm automatically loads `.npmrc` configuration; don't use dotenv.

## APIs

- `node:sqlite` for SQLite. Don't use `better-sqlite3` or `bun:sqlite`.
- Use `Bun`-free Node APIs: `node:http` / `node:fs` instead of Bun equivalents.
- `fetch` / `WebSocket` are built-in in Node 22+.
- Prefer `node:fs`'s `readFile`/`writeFile` with `import { readFile, writeFile } from "node:fs/promises"`.

## Testing

Use `pnpm test` to run tests.

```ts#index.test.ts
import { test, expect } from "vitest";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

The docs site is a Vite SPA (`docs/vite.config.ts`):

- `pnpm docs:dev` — Vite dev server with HMR (root: `docs/`).
- `pnpm docs:build` — `vite build` → `docs/dist` (base: `/typescript-calendar-lib`), then copies `index.html` → `404.html` for the GitHub Pages SPA fallback.
- `pnpm docs:preview` — `vite preview` for the built site.
- `.md` files are imported as rendered HTML via `vite-plugin-markdown` (`markdown({ mode: ["html"] })`); `docs/src/app.d.ts` declares the `*.md` module.

For example, a Vite dev server:

```ts#vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
});
```

For more information, read the Vite docs: https://vite.dev/ or `node_modules/vite/README.md`.
