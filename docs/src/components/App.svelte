<script lang="ts">
  import Home from "./Home.svelte";
  import Markdown from "./Markdown.svelte";
  import Playground from "./Playground.svelte";
  import Search from "./Search.svelte";
  import { FLAT_NAV, GITHUB_URL, PACKAGES, SIDEBAR, withBase } from "../nav";
  import type { SearchEntry } from "../search";

  let {
    path,
    html,
    searchIndex,
  }: { path: string; html: string; searchIndex: SearchEntry[] } = $props();

  const navIndex = $derived(FLAT_NAV.findIndex((item) => item.link === path));
  const previous = $derived(navIndex > 0 ? FLAT_NAV[navIndex - 1] : undefined);
  const next = $derived(
    navIndex >= 0 && navIndex < FLAT_NAV.length - 1
      ? FLAT_NAV[navIndex + 1]
      : undefined,
  );

  function isActive(link: string): boolean {
    return path === link;
  }
</script>

<header class="site-header">
  <a class="brand" href={withBase("/")}>typescript-calendar-lib</a>
  <nav class="site-nav">
    <a href={withBase("/guide/getting-started")}>Guide</a>
    <details class="dropdown">
      <summary>Packages</summary>
      <div class="dropdown-menu">
        {#each PACKAGES as pkg}
          <a href={withBase(pkg.link)}>{pkg.text}</a>
        {/each}
      </div>
    </details>
    <Search index={searchIndex} />
    <a
      class="github"
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="GitHub repository"
    >
      <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
        />
      </svg>
    </a>
  </nav>
</header>

<div class="site-layout">
  <aside class="site-sidebar">
    {#each SIDEBAR as group}
      <p class="sidebar-group-title">{group.text}</p>
      <ul class="sidebar-links">
        {#each group.items as item}
          <li>
            <a class:active={isActive(item.link)} href={withBase(item.link)}>{item.text}</a>
          </li>
        {/each}
      </ul>
    {/each}
  </aside>

  <main class="site-content">
    {#if path === "/"}
      <Home />
    {:else}
      <Markdown {html} />
      {#if path === "/guide/interactive-demo"}
        <Playground />
      {/if}
      {#if previous || next}
        <nav class="page-nav" aria-label="Page navigation">
          {#if previous}
            <a class="page-nav-link page-nav-prev" href={withBase(previous.link)}>
              <span>← Previous</span>
              <strong>{previous.text}</strong>
            </a>
          {:else}
            <span></span>
          {/if}
          {#if next}
            <a class="page-nav-link page-nav-next" href={withBase(next.link)}>
              <span>Next →</span>
              <strong>{next.text}</strong>
            </a>
          {/if}
        </nav>
      {/if}
    {/if}
  </main>
</div>

<footer class="site-footer">
  <span>Released under the MIT License.</span>
  <span>Copyright © 2026 nazozokc</span>
</footer>