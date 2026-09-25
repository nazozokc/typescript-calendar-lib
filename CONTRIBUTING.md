# Contributing to typescript-calendar-lib

Thanks for your interest in contributing! This guide covers how to set up the repository, what the quality gates are, and how changes get merged and released.

## AI-assisted contributions

AI-assisted and AI-generated contributions are welcome. This repository is developed with AI assistance and ships a `CLAUDE.md` with environment-specific guidance for AI agents.

AI-generated changes must still meet the same bar as any other change:

- pass `pnpm lint`, `pnpm typecheck`, and `pnpm test`
- follow the commit conventions below (conventional commits)
- be reviewed by a human before merging

## Development setup

Prerequisites:

- Node.js 22+ (CI runs on 22 and 24)
- pnpm (version per `packageManager` in `package.json`)

```sh
pnpm install
pnpm hooks:install   # enable git hooks (commit message + typecheck/test)
```

## Available scripts

| Script | Description |
| :--- | :--- |
| `pnpm build` | Build all packages with tsdown (`pnpm -r run build`) |
| `pnpm lint` | Biome check across the repo |
| `pnpm lint:fix` | Biome check with autofix |
| `pnpm typecheck` | TypeScript typecheck from the root tsconfig + svelte-check for the svelte package |
| `pnpm test` | Run the vitest suite |
| `pnpm test:coverage` | Run vitest with v8 coverage report |
| `pnpm docs:dev` | Start the docs SPA dev server (Vite) |
| `pnpm docs:build` | Build the docs site to `docs/dist` (Vite) |
| `pnpm docs:preview` | Preview the built docs site |

## Repository structure

pnpm workspace monorepo with six packages:

```
packages/
  core/    # Pure calendar logic: date utilities, month/year/range computation
  cli/     # CLI binary (`typescript-calendar-lib`) and text rendering
  tui/     # Framework-agnostic headless state (cursor, selection, navigation)
  web/     # Shared presentation data (themes, color schemes, sizes, calendar.css)
  react/   # React component + useCalendarState hook, calendar.css
  svelte/  # Svelte 5 component + useCalendarState hook, calendar.css
docs/      # Docs SPA (Vite build, deployed to GitHub Pages)
```

- `core` has no runtime dependencies; the other packages depend on it via `workspace:*`.
- Each package builds with its own `tsdown.config.ts`; pnpm runs builds in topological order.

## Making changes

- Work on the `AI-agent` branch; changes are merged into `main` via pull requests.
- One commit = one logical change. Split unrelated changes into separate commits.
- Keep PRs focused: refactors, features, and fixes belong in separate PRs.

## Commit conventions

The `commit-msg` hook enforces conventional commits (https://www.conventionalcommits.org/):

```
<type>(<scope>)?!?: <summary>
```

Allowed types: `feat`, `fix`, `perf`, `refactor`, `docs`, `style`, `test`, `chore`, `build`, `ci`

```
feat: add year calendar
fix(cli): handle empty range
chore: update dependencies
```

Merge and revert commits are exempt.

## Git hooks

Enabled per-repo via `core.hooksPath` (`pnpm hooks:install`):

- `pre-commit` — rejects trailing whitespace and leftover conflict markers, then runs `pnpm typecheck` and `pnpm test`
- `commit-msg` — enforces the conventional commit format above

Commits fail if the quality gates don't pass, so run `pnpm typecheck` and `pnpm test` before committing.

## Code style

Formatting and linting are enforced by [Biome](https://biomejs.dev/) (`biome.json`):

```sh
pnpm lint
pnpm lint:fix
```

Biome lints `*.d.ts` too, so don't commit stray declaration files. Build output lives in `dist/` and must not be committed.

## Testing

```sh
pnpm test
pnpm test:coverage   # v8 coverage with thresholds (statements/lines 75%, functions 80%, branches 60%)
```

The suite covers date utilities (leap years, month boundaries), locale headers, grid layout, highlight/range rendering, and public API integration. Package-specific environments (e.g. jsdom for `react` and `svelte`) are configured per-package in `vitest.config.ts`.

The `svelte` package needs extra care:

- Relative imports use `.js` extensions (Node ESM convention required by `svelte-package`).
- `src/` holds only publishable files; tests and the `HookHarness.svelte` helper live in `test/` (everything under `src/` is shipped).
- Build with `svelte-package -i src` (see `packages/svelte/svelte.config.js`). The repo pins a `typescript@^5.9` devDependency and a `packageExtensions` patch in `pnpm-workspace.yaml` because svelte3tooling (svelte2tsx/svelte-check) is incompatible with the repo's tsgo (`typescript@^7`).
- `useCalendarState` accepts a plain options object (snapshot) or a getter function `() => options` for reactive props/`$state` values. Don't pass a `$derived` object from another module — derived tracking does not cross module boundaries.

## CI

`.github/workflows/ci.yml` runs on every PR and push to `main`:

- typecheck + tests on Node 22 and 24
- Biome lint
- coverage with thresholds (report uploaded as an artifact)
- publish-check: `pnpm pack` every package and verify the tarballs contain `dist/index.js`

Dependabot keeps npm dependencies and GitHub Actions updated weekly.

## Releases

Releases are triggered by GitHub Releases (`.github/workflows/publish-*.yml`):

1. Create a tag `vX.Y.Z` and a GitHub Release with release notes.
2. The version from the tag is synced to all packages, then `pnpm -r run build` runs before publishing to npm.
3. If the release notes contain a `publish:` line, only the listed packages are published (e.g. `publish: cli, react`). Without that line, all packages are published.

> **Risk: `@typescript-calendar-lib/web@1.0.0` already exists on npm.** It was published ahead of the other packages with a stale `@typescript-calendar-lib/core@^0.5.1` dependency. Publishing a tag `v1.0.0` again fails for `web` with `409` (version already exists). **Start the next release from a tag higher than `v1.0.0` (e.g. `v1.0.1`)** so `web` republishes with the corrected `core@^1.0.0` range. Until then, consumers of `react`/`svelte` that resolve `web@1.0.0` install it with `core@0.5.x` (duplicate `core` in the tree).

## Docs

The docs site is an SPA built with Vite (`docs/vite.config.ts` → `docs/dist`) and deployed to GitHub Pages by `.github/workflows/deploy-docs.yml`.

- `docs/guide/*.md` and `docs/packages/*.md` are imported directly by `docs/src/main.ts` and rendered as pages — they are page content, not leftovers. Don't delete them.
- Use `pnpm docs:dev` for local development. There is no Jekyll/Liquid processing, so `{{`/`}}` in code samples is fine.

## License

By contributing, you agree that your contributions are licensed under the MIT License (see `LICENSE`).