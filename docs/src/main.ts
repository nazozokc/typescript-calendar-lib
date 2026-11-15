import { mount } from "svelte";
import { html as accessibility } from "../guide/accessibility.md";
import accessibilityRaw from "../guide/accessibility.md?raw";
import { html as architecture } from "../guide/architecture.md";
import architectureRaw from "../guide/architecture.md?raw";
import { html as examples } from "../guide/examples.md";
import examplesRaw from "../guide/examples.md?raw";
import { html as gettingStarted } from "../guide/getting-started.md";
import gettingStartedRaw from "../guide/getting-started.md?raw";
import { html as interactiveDemo } from "../guide/interactive-demo.md";
import interactiveDemoRaw from "../guide/interactive-demo.md?raw";
import { html as theming } from "../guide/theming.md";
import themingRaw from "../guide/theming.md?raw";
import { html as cli } from "../packages/cli.md";
import cliRaw from "../packages/cli.md?raw";
import { html as core } from "../packages/core.md";
import coreRaw from "../packages/core.md?raw";
import { html as react } from "../packages/react.md";
import reactRaw from "../packages/react.md?raw";
import { html as svelte } from "../packages/svelte.md";
import svelteRaw from "../packages/svelte.md?raw";
import { html as tui } from "../packages/tui.md";
import tuiRaw from "../packages/tui.md?raw";
import { html as web } from "../packages/web.md";
import webRaw from "../packages/web.md?raw";
import App from "./components/App.svelte";
import { normalizePath, TITLES } from "./nav";
import { buildSearchIndex } from "./search";

const PAGES: Record<string, string> = {
  "/guide/getting-started": gettingStarted,
  "/guide/examples": examples,
  "/guide/theming": theming,
  "/guide/accessibility": accessibility,
  "/guide/interactive-demo": interactiveDemo,
  "/guide/architecture": architecture,
  "/packages/core": core,
  "/packages/cli": cli,
  "/packages/react": react,
  "/packages/svelte": svelte,
  "/packages/tui": tui,
  "/packages/web": web,
};

const RAW_PAGES: Record<string, string> = {
  "/guide/getting-started": gettingStartedRaw,
  "/guide/examples": examplesRaw,
  "/guide/theming": themingRaw,
  "/guide/accessibility": accessibilityRaw,
  "/guide/interactive-demo": interactiveDemoRaw,
  "/guide/architecture": architectureRaw,
  "/packages/core": coreRaw,
  "/packages/cli": cliRaw,
  "/packages/react": reactRaw,
  "/packages/svelte": svelteRaw,
  "/packages/tui": tuiRaw,
  "/packages/web": webRaw,
};

const SEARCH_INDEX = buildSearchIndex(
  Object.entries(RAW_PAGES).map(([pagePath, raw]) => ({
    path: pagePath,
    title: (TITLES[pagePath] ?? pagePath).split(" | ")[0] ?? pagePath,
    raw,
  })),
);

const path = normalizePath(window.location.pathname);
document.title = TITLES[path] ?? "typescript-calendar-lib";

const root = document.getElementById("root");
if (!root) throw new Error("missing #root element");

mount(App, {
  target: root,
  props: { path, html: PAGES[path] ?? "", searchIndex: SEARCH_INDEX },
});
