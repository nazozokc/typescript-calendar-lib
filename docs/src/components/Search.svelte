<script lang="ts">
  import { onMount, tick } from "svelte";
  import { withBase } from "../nav";
  import {
    searchEntries,
    type SearchEntry,
    type SearchResult,
  } from "../search";

  let { index }: { index: SearchEntry[] } = $props();

  let open = $state(false);
  let query = $state("");
  let active = $state(0);
  let input: HTMLInputElement | undefined = $state();

  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform);
  const shortcut = isMac ? "⌘K" : "Ctrl K";

  const hits = $derived(
    query.trim() ? searchEntries(index, query).slice(0, 12) : [],
  );

  async function openSearch() {
    open = true;
    query = "";
    active = 0;
    await tick();
    input?.focus();
  }

  function close() {
    open = false;
  }

  function go(hit: SearchResult) {
    const hash = hit.anchor ? `#${hit.anchor}` : "";
    window.location.href = withBase(hit.page) + hash;
  }

  function onInputKey(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (hits.length > 0) active = (active + 1) % hits.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (hits.length > 0) active = (active - 1 + hits.length) % hits.length;
    } else if (event.key === "Enter") {
      event.preventDefault();
      const hit = hits[active];
      if (hit) go(hit);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  onMount(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        void openSearch();
      } else if (event.key === "Escape" && open) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
</script>

<button
  type="button"
  class="search-trigger"
  onclick={openSearch}
  aria-label="Search documentation"
>
  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
    <path
      fill="currentColor"
      d="M11.74 10.68a6.5 6.5 0 1 0-1.06 1.06l3.04 3.04 1.06-1.06-3.04-3.04ZM12.5 6.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
    />
  </svg>
  <span>Search</span>
  <kbd>{shortcut}</kbd>
</button>

{#if open}
  <div
    class="search-overlay"
    role="presentation"
    onclick={(event) => {
      if (event.target === event.currentTarget) close();
    }}
  >
    <div
      class="search-dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
      tabindex="-1"
    >
      <div class="search-input-row">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M11.74 10.68a6.5 6.5 0 1 0-1.06 1.06l3.04 3.04 1.06-1.06-3.04-3.04ZM12.5 6.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
          />
        </svg>
        <input
          bind:this={input}
          bind:value={query}
          oninput={() => (active = 0)}
          onkeydown={onInputKey}
          type="search"
          placeholder="Search the docs…"
          aria-label="Search the docs"
          autocomplete="off"
          spellcheck="false"
        />
        <kbd>Esc</kbd>
      </div>

      {#if hits.length > 0}
        <ul class="search-results">
          {#each hits as hit, i}
            <li>
              <button
                type="button"
                class:active={i === active}
                onmouseenter={() => (active = i)}
                onclick={() => go(hit)}
              >
                <span class="search-hit-top">
                  <span class="search-hit-heading">{hit.heading}</span>
                  <span class="search-hit-page">{hit.pageTitle}</span>
                </span>
                {#if hit.snippet}
                  <span class="search-hit-snippet">{hit.snippet}</span>
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="search-empty">
          {query.trim() ? "No matches." : "Search guides, packages, and API notes."}
        </p>
      {/if}

      <div class="search-footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>↵</kbd> open</span>
        <span><kbd>esc</kbd> close</span>
      </div>
    </div>
  </div>
{/if}
