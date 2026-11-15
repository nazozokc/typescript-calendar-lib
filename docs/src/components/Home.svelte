<script lang="ts">
  import { GITHUB_URL, withBase } from "../nav";

  interface Feature {
    title: string;
    details: string;
  }

  interface PackageCard {
    name: string;
    description: string;
    link: string;
  }

  const FEATURES: Feature[] = [
    {
      title: "Month / Year / Range",
      details:
        "Render a single month, a full year (4×3 grid), or any arbitrary date range.",
    },
    {
      title: "7 locales",
      details:
        "English, Japanese, Spanish, German, French, Korean, and Chinese out of the box.",
    },
    {
      title: "Zero dependencies",
      details:
        "The core package has no runtime dependencies. ANSI colors only when enabled.",
    },
    {
      title: "Multiple targets",
      details:
        "Plain text (CLI), React 19, Svelte 5, or headless data for any TUI framework.",
    },
    {
      title: "Themes & colors",
      details:
        "Built-in themes and color schemes, or bring your own custom definitions.",
    },
    {
      title: "Fully typed",
      details:
        "Every option, return type, and export is fully typed for excellent IDE support.",
    },
  ];

  const PACKAGE_CARDS: PackageCard[] = [
    {
      name: "core",
      description: "Date math, locales, grid building — shared by everything.",
      link: "/packages/core",
    },
    {
      name: "cli",
      description: "Terminal renderer with themes and a ready-made binary.",
      link: "/packages/cli",
    },
    {
      name: "tui",
      description: "Headless cursor, selection, and navigation state machine.",
      link: "/packages/tui",
    },
    {
      name: "react",
      description: "React 19 Calendar, InteractiveCalendar, and hooks.",
      link: "/packages/react",
    },
    {
      name: "svelte",
      description: "Svelte 5 components and runes-based state.",
      link: "/packages/svelte",
    },
    {
      name: "web",
      description: "Shared themes, color schemes, sizing, and CSS.",
      link: "/packages/web",
    },
  ];

  const INSTALL = "pnpm add @typescript-calendar-lib/cli";
  const USAGE = `import { calendar } from "@typescript-calendar-lib/cli";

console.log(calendar({ year: 2026, month: 9 }));`;

  const EXAMPLE_OUTPUT = `      September 2026
Sun Mon Tue Wed Thu Fri Sat
          1   2   3   4   5
  6   7   8   9  10  11  12
 13  14  15  16  17  18  19
 20  21  22  23  24  25  26
 27  28  29  30`;

  let copied = $state(false);

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(INSTALL);
      copied = true;
      window.setTimeout(() => {
        copied = false;
      }, 1600);
    } catch {
      copied = false;
    }
  }
</script>

<section class="hero">
  <h1 class="hero-name">typescript-calendar-lib</h1>
  <p class="hero-text">Type-safe calendars for the terminal and the web</p>
  <p class="hero-tagline">
    Render month, year, or date-range calendars as plain text, React components,
    Svelte components, or headless TUI data. Zero runtime dependencies.
  </p>
  <div class="hero-actions">
    <a class="btn btn-brand" href={withBase("/guide/getting-started")}>Get Started</a>
    <a class="btn btn-alt" href={withBase("/guide/examples")}>Browse examples</a>
  </div>
</section>

<section class="features">
  {#each FEATURES as feature}
    <article class="feature">
      <h2>{feature.title}</h2>
      <p>{feature.details}</p>
    </article>
  {/each}
</section>

<section class="home-section quickstart">
  <div class="home-section-copy">
    <p class="eyebrow">Quick start</p>
    <h2>One install away</h2>
    <p>
      Install only the layer you need. The CLI package includes the
      <code>typescript-calendar-lib</code> binary; React and Svelte ship component
      styles as a separate CSS entry.
    </p>
    <div class="install-row">
      <code>{INSTALL}</code>
      <button type="button" class="copy-install" onclick={copyInstall}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
    <div class="home-links">
      <a href={withBase("/guide/getting-started")}>Getting Started →</a>
      <a href={withBase("/guide/theming")}>Theming &amp; Styling →</a>
      <a href={withBase("/guide/accessibility")}>Accessibility →</a>
    </div>
  </div>

  <div class="code-card">
    <div class="code-card-bar"><span>index.ts</span></div>
    <pre><code>{USAGE}</code></pre>
  </div>
</section>

<section class="home-section">
  <div class="section-heading">
    <p class="eyebrow">Packages</p>
    <h2>Pick your layer</h2>
    <p>
      Every package shares the same typed core. Compose them, or use one on its
      own.
    </p>
  </div>
  <div class="package-grid">
    {#each PACKAGE_CARDS as pkg}
      <a class="package-card" href={withBase(pkg.link)}>
        <span class="package-name">@typescript-calendar-lib/{pkg.name}</span>
        <span class="package-desc">{pkg.description}</span>
        <span class="package-arrow">Read the API →</span>
      </a>
    {/each}
  </div>
</section>

<section class="home-section output-section">
  <div class="home-section-copy">
    <p class="eyebrow">Output</p>
    <h2>Plain text by default</h2>
    <p>
      No ANSI codes unless you ask for them, so output is safe to pipe into
      files, diffs, and other tools. Add <code>color: true</code> and a color
      scheme when you want it.
    </p>
    <a class="text-link" href={withBase("/guide/examples")}>See more recipes →</a>
  </div>
  <pre class="home-output"><code>{EXAMPLE_OUTPUT}</code></pre>
</section>

<section class="home-cta">
  <h2>Ready to build?</h2>
  <p>Start with the guide, then copy a recipe that matches your UI.</p>
  <div class="hero-actions">
    <a class="btn btn-brand" href={withBase("/guide/getting-started")}>Read the guide</a>
    <a class="btn btn-alt" href={GITHUB_URL} target="_blank" rel="noreferrer"
      >View on GitHub</a
    >
  </div>
</section>
