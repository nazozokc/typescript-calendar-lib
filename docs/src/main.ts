import { mount } from "svelte";
import { html as architecture } from "../guide/architecture.md";
import { html as gettingStarted } from "../guide/getting-started.md";
import { html as interactiveDemo } from "../guide/interactive-demo.md";
import { html as cli } from "../packages/cli.md";
import { html as core } from "../packages/core.md";
import { html as react } from "../packages/react.md";
import { html as svelte } from "../packages/svelte.md";
import { html as tui } from "../packages/tui.md";
import { html as web } from "../packages/web.md";
import App from "./components/App.svelte";
import { normalizePath, TITLES } from "./nav";

const PAGES: Record<string, string> = {
  "/guide/getting-started": gettingStarted,
  "/guide/interactive-demo": interactiveDemo,
  "/guide/architecture": architecture,
  "/packages/core": core,
  "/packages/cli": cli,
  "/packages/react": react,
  "/packages/svelte": svelte,
  "/packages/tui": tui,
  "/packages/web": web,
};

const path = normalizePath(window.location.pathname);
document.title = TITLES[path] ?? "typescript-calendar-lib";

const root = document.getElementById("root");
if (!root) throw new Error("missing #root element");

mount(App, {
  target: root,
  props: { path, html: PAGES[path] ?? "" },
});
