<script lang="ts">
  import { onMount } from "svelte";
  import DOMPurify from "dompurify";
  import hljs from "highlight.js/lib/core";
  import bash from "highlight.js/lib/languages/bash";
  import css from "highlight.js/lib/languages/css";
  import javascript from "highlight.js/lib/languages/javascript";
  import json from "highlight.js/lib/languages/json";
  import markdown from "highlight.js/lib/languages/markdown";
  import plaintext from "highlight.js/lib/languages/plaintext";
  import typescript from "highlight.js/lib/languages/typescript";
  import xml from "highlight.js/lib/languages/xml";
  import "highlight.js/styles/github-dark.css";
  import { BASE, withBase } from "../nav";
  import { createSlugger } from "../slug";

  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("sh", bash);
  hljs.registerLanguage("shell", bash);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("js", javascript);
  hljs.registerLanguage("jsx", javascript);
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("markdown", markdown);
  hljs.registerLanguage("md", markdown);
  hljs.registerLanguage("plaintext", plaintext);
  hljs.registerLanguage("text", plaintext);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("ts", typescript);
  hljs.registerLanguage("tsx", typescript);
  hljs.registerLanguage("html", xml);
  hljs.registerLanguage("svelte", xml);
  hljs.registerLanguage("xml", xml);

  let { html }: { html: string } = $props();
  // .md 由来の HTML は markdown-it が html:true で生 HTML を通すため、
  // スクリプト・イベントハンドラ・javascript: URI を除去してから描画する
  const safeHtml = $derived(DOMPurify.sanitize(html));

  const headings = $derived.by(() => {
    if (!safeHtml) return [];
    const doc = new DOMParser().parseFromString(safeHtml, "text/html");
    const nextId = createSlugger();
    const items: Array<{ id: string; text: string; level: number }> = [];
    for (const heading of doc.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
      const text = heading.textContent ?? "";
      const id = nextId(text);
      if (heading.tagName === "H2" || heading.tagName === "H3") {
        items.push({ id, text, level: heading.tagName === "H3" ? 3 : 2 });
      }
    }
    return items;
  });

  let container: HTMLDivElement | undefined = $state();
  let activeId = $state("");

  onMount(() => {
    if (!container) return;

    const nextId = createSlugger();
    for (const heading of container.querySelectorAll(
      "h1, h2, h3, h4, h5, h6",
    )) {
      if (!heading.id) {
        heading.id = nextId(heading.textContent ?? "");
      } else {
        nextId(heading.textContent ?? "");
      }
    }

    // Markdown uses root-relative links (`/packages/core`); on GitHub Pages
    // the site lives under `/typescript-calendar-lib`, so prefix them.
    for (const link of container.querySelectorAll<HTMLAnchorElement>(
      'a[href^="/"]',
    )) {
      const href = link.getAttribute("href");
      if (href && !href.startsWith(`${BASE}/`)) {
        link.setAttribute("href", withBase(href));
      }
    }

    for (const code of container.querySelectorAll("pre code")) {
      // Only highlight fenced blocks with an explicit language;
      // plain text/output blocks are left as-is (avoid auto-detection).
      const language = /language-([\w-]+)/.exec(code.className ?? "")?.[1];
      if (language && hljs.getLanguage(language)) {
        hljs.highlightElement(code as HTMLElement);
      }
    }

    for (const pre of container.querySelectorAll("pre")) {
      if (pre.querySelector(".copy-btn")) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-btn";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code to clipboard");
      button.addEventListener("click", async () => {
        const text = pre.querySelector("code")?.textContent ?? "";
        try {
          await navigator.clipboard.writeText(text);
          button.textContent = "Copied";
        } catch {
          button.textContent = "Failed";
        }
        window.setTimeout(() => {
          button.textContent = "Copy";
        }, 1600);
      });
      pre.append(button);
    }

    const headingElements = Array.from(
      container.querySelectorAll<HTMLElement>("h2, h3"),
    );
    activeId = headingElements[0]?.id ?? "";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeId = entry.target.id;
        }
      },
      { rootMargin: "-96px 0px -62% 0px", threshold: 0 },
    );
    for (const heading of headingElements) observer.observe(heading);

    return () => observer.disconnect();
  });
</script>

<div class="page-with-toc">
  <div class="markdown-body" bind:this={container}>
    {@html safeHtml}
  </div>

  {#if headings.length > 0}
    <aside class="page-toc" aria-label="On this page">
      <p class="toc-title">On this page</p>
      <ul>
        {#each headings as heading}
          <li class:level-3={heading.level === 3}>
            <a
              href={`#${heading.id}`}
              class:active={activeId === heading.id}
            >{heading.text}</a>
          </li>
        {/each}
      </ul>
    </aside>
  {/if}
</div>
