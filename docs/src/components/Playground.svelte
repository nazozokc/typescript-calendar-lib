<script lang="ts">
  import InteractiveCalendar from "../../../packages/svelte/src/InteractiveCalendar.svelte";
  import "../../../packages/web/src/calendar.css";

  const themes = ["default", "modern", "minimal", "rounded", "retro"] as const;
  const schemes = [
    "default",
    "auto",
    "ocean",
    "forest",
    "sunset",
    "mono",
    "midnight",
    "blossom",
  ] as const;
  const locales = ["en", "ja", "es", "de", "fr", "ko", "zh"] as const;
  const selectionModes = ["single", "range"] as const;

  let theme = $state<(typeof themes)[number]>("modern");
  let colorScheme = $state<(typeof schemes)[number]>("auto");
  let locale = $state<(typeof locales)[number]>("en");
  let selectionMode = $state<(typeof selectionModes)[number]>("single");
  let showNavigation = $state(true);
  let swipeToNavigate = $state(false);
  let responsive = $state(true);
  let lastClicked = $state<Date | null>(null);

  const lastClickedLabel = $derived(
    lastClicked === null ? "—" : lastClicked.toDateString(),
  );
</script>

<section class="playground" aria-labelledby="playground-title">
  <h2 id="playground-title">Live playground</h2>
  <p>
    Svelte の <code>InteractiveCalendar</code> をそのまま埋め込んでいます。オプションを変えると即座に反映されます。
  </p>

  <div class="playground-controls">
    <label>
      <span>Theme</span>
      <select bind:value={theme}>
        {#each themes as value}
          <option {value}>{value}</option>
        {/each}
      </select>
    </label>
    <label>
      <span>Color scheme</span>
      <select bind:value={colorScheme}>
        {#each schemes as value}
          <option {value}>{value}</option>
        {/each}
      </select>
    </label>
    <label>
      <span>Locale</span>
      <select bind:value={locale}>
        {#each locales as value}
          <option {value}>{value}</option>
        {/each}
      </select>
    </label>
    <label>
      <span>Selection</span>
      <select bind:value={selectionMode}>
        {#each selectionModes as value}
          <option {value}>{value}</option>
        {/each}
      </select>
    </label>
    <label class="playground-check">
      <input type="checkbox" bind:checked={showNavigation} />
      <span>Navigation</span>
    </label>
    <label class="playground-check">
      <input type="checkbox" bind:checked={swipeToNavigate} />
      <span>Swipe</span>
    </label>
    <label class="playground-check">
      <input type="checkbox" bind:checked={responsive} />
      <span>Responsive</span>
    </label>
  </div>

  <div class="playground-calendar" class:playground-compact={responsive}>
    <InteractiveCalendar
      initialYear={2026}
      initialMonth={9}
      {theme}
      {colorScheme}
      {locale}
      {selectionMode}
      {showNavigation}
      {swipeToNavigate}
      {responsive}
      onDateClick={(date) => (lastClicked = date)}
    />
  </div>

  <p class="playground-status">Last click: <strong>{lastClickedLabel}</strong></p>
</section>
