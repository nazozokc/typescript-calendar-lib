/// <reference types="svelte" />

/** Markdown imports (vite-plugin-markdown returns rendered HTML). */
declare module "*.md" {
  export const attributes: Record<string, unknown>;
  export const html: string;
}

/** Raw Markdown imports (used to build the client-side search index). */
declare module "*.md?raw" {
  const content: string;
  export default content;
}
