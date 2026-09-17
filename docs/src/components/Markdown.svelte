<script lang="ts">
  import { onMount } from "svelte";
  import DOMPurify from "dompurify";
  import hljs from "highlight.js";
  import "highlight.js/styles/github-dark.css";

  let { html }: { html: string } = $props();
  // .md 由来の HTML は markdown-it が html:true で生 HTML を通すため、
  // スクリプト・イベントハンドラ・javascript: URI を除去してから描画する
  const safeHtml = $derived(DOMPurify.sanitize(html));
  let container: HTMLDivElement | undefined = $state();

  function slugify(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
  }

  onMount(() => {
    if (!container) return;
    for (const h of container.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
      if (!h.id) h.id = slugify(h.textContent ?? "");
    }
    for (const code of container.querySelectorAll("pre code")) {
      // Only highlight fenced blocks with an explicit language;
      // plain text/output blocks are left as-is (avoid auto-detection).
      if ((code.className ?? "").includes("language-")) {
        hljs.highlightElement(code as HTMLElement);
      }
    }
  });
</script>

<div class="markdown-body" bind:this={container}>
  {@html safeHtml}
</div>