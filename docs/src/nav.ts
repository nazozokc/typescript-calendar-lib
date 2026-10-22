export interface NavItem {
  text: string;
  link: string;
}

export interface NavGroup {
  text: string;
  items: NavItem[];
}

export const GITHUB_URL = "https://github.com/nazozokc/typescript-calendar-lib";

/**
 * Base path of the docs site.
 *
 * GitHub Pages serves project sites under `/<repo>/`, so every link needs the
 * `/typescript-calendar-lib` prefix there. The dev server also serves under the
 * base path — detect which case we are in from the URL.
 */
export const BASE = window.location.pathname.startsWith(
  "/typescript-calendar-lib",
)
  ? "/typescript-calendar-lib"
  : "";

/** Prefix a docs-relative path (e.g. `/guide/getting-started`) with `BASE`. */
export function withBase(path: string): string {
  return BASE + path;
}

export const SIDEBAR: NavGroup[] = [
  {
    text: "Guide",
    items: [
      { text: "Getting Started", link: "/guide/getting-started" },
      { text: "Interactive Demo", link: "/guide/interactive-demo" },
      { text: "Architecture", link: "/guide/architecture" },
    ],
  },
  {
    text: "Packages",
    items: [
      { text: "core", link: "/packages/core" },
      { text: "cli", link: "/packages/cli" },
      { text: "react", link: "/packages/react" },
      { text: "svelte", link: "/packages/svelte" },
      { text: "tui", link: "/packages/tui" },
      { text: "web", link: "/packages/web" },
    ],
  },
];

export const PACKAGES: NavItem[] = [
  { text: "core", link: "/packages/core" },
  { text: "cli", link: "/packages/cli" },
  { text: "react", link: "/packages/react" },
  { text: "svelte", link: "/packages/svelte" },
  { text: "tui", link: "/packages/tui" },
  { text: "web", link: "/packages/web" },
];

/** Page title by URL path (used for <title>). */
export const TITLES: Record<string, string> = {
  "/": "typescript-calendar-lib",
  "/guide/getting-started": "Getting Started | typescript-calendar-lib",
  "/guide/interactive-demo": "Interactive Demo | typescript-calendar-lib",
  "/guide/architecture": "Architecture | typescript-calendar-lib",
  "/packages/core": "@typescript-calendar-lib/core | typescript-calendar-lib",
  "/packages/cli": "@typescript-calendar-lib/cli | typescript-calendar-lib",
  "/packages/react": "@typescript-calendar-lib/react | typescript-calendar-lib",
  "/packages/svelte":
    "@typescript-calendar-lib/svelte | typescript-calendar-lib",
  "/packages/tui": "@typescript-calendar-lib/tui | typescript-calendar-lib",
  "/packages/web": "@typescript-calendar-lib/web | typescript-calendar-lib",
};

/** Normalize an incoming pathname (strip `.html` suffix and the base path). */
export function normalizePath(pathname: string): string {
  const path = pathname
    .replace(/\.html$/, "")
    .replace(new RegExp(`^${BASE}`), "");
  return path in TITLES ? path : "/";
}
