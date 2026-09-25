# typescript-calendar-lib

A TypeScript calendar library spanning the terminal and the web. Render month, year, or arbitrary date-range calendars as plain text (with optional ANSI color) or as interactive React 19 / Svelte 5 components — all sharing one headless core.

## Features

- **Month / Year / Range** — render a single month, a full year (4 columns × 3 rows), or any date range
- **7 locales** — English, Japanese, Spanish, German, French, Korean, Chinese (Simplified)
- **Week start** — Sunday or Monday
- **Highlight today** — bracket (`[8]`) or reverse-video styles
- **Range coloring** — emphasize a span of dates (opt-in)
- **Disabled dates** — block dates with an `isDateDisabled` predicate in every layer (cursor skips them, selection is blocked)
- **Range selection** — `selectionMode: "range"` (React/Svelte/TUI) commits a start–end range with a click sequence: anchor → range → reset
- **Week numbers** — `showWeekNumbers` prints the ISO/week-of-year number at the start of each row (CLI, React, Svelte)
- **Date utilities** — a full `date-math` API: add/subtract, diffs, `startOf`/`endOf`, week (ISO/Year), day-of-year, compare, clamp, and `formatDate` token formatting
- **Interactive React 19** — `useCalendarState` hook + clickable/keyboard cells
- **Interactive Svelte 5** — the same headless state, as a runes-based `useCalendarState` hook + `Calendar` component
- **Responsive web components (opt-in)** — a `responsive` prop (React/Svelte) shrinks cells, fonts, and padding so the 7-column grid stays inside phone screens
- **Headless TUI state** — cursor, selection, and navigation state machine for any TUI framework
- **Zero runtime dependencies** — plain text by default; ANSI colors only when enabled

## Packages

| Package | Description |
| :--- | :--- |
| [`@typescript-calendar-lib/core`](packages/core/README.md) | Date math, locales, grid building — shared by everything else |
| [`@typescript-calendar-lib/cli`](packages/cli/README.md) | Terminal renderer with themes, ANSI colors, and a `typescript-calendar-lib` binary |
| [`@typescript-calendar-lib/tui`](packages/tui/README.md) | Headless calendar data & state machine for any TUI framework |
| [`@typescript-calendar-lib/web`](packages/web/README.md) | Shared presentation data (themes, color schemes, sizes, CSS) |
| [`@typescript-calendar-lib/react`](packages/react/README.md) | React 19 component + `useCalendarState` hook |
| [`@typescript-calendar-lib/svelte`](packages/svelte/README.md) | Svelte 5 component + `useCalendarState` hook |

## Install

```sh
pnpm add @typescript-calendar-lib/cli
# or
npm install @typescript-calendar-lib/cli
# or
bun add @typescript-calendar-lib/cli
```

## Usage

### CLI (plain text)

```ts
import { calendar, calendarYear, calendarRange } from "@typescript-calendar-lib/cli";

// Month calendar
console.log(calendar({ year: 2026, month: 9 }));

// Year calendar (4 columns × 3 rows)
console.log(calendarYear({ year: 2026 }));

// Arbitrary date range
console.log(calendarRange({
  from: new Date(2026, 5, 1),
  to: new Date(2026, 8, 30),
}));
```

Or use the `typescript-calendar-lib` binary:

```sh
typescript-calendar-lib 2026 9
```

### React

```tsx
import { Calendar } from "@typescript-calendar-lib/react";
import "@typescript-calendar-lib/react/calendar.css";

function App() {
  return <Calendar year={2026} month={9} colorScheme="ocean" />;
}
```

### Svelte

```svelte
<script lang="ts">
  import Calendar from "@typescript-calendar-lib/svelte";
  import "@typescript-calendar-lib/svelte/calendar.css";
</script>

<Calendar year={2026} month={9} colorScheme="ocean" theme="modern" />
```

### Responsive (React / Svelte)

The React and Svelte calendars keep a fixed 7-column grid, which can overflow narrow phone screens. Pass `responsive` to make the grid shrink its cells, fonts, and padding below `480px` (and a touch more below `360px`) so it always fits:

```tsx
<Calendar year={2026} month={9} responsive />
```

```svelte
<Calendar year={2026} month={9} responsive />
```

It is **off by default** — existing layouts are untouched. Both `Calendar` and `InteractiveCalendar` accept the prop.

### Week numbers (CLI / React / Svelte)

Pass `showWeekNumbers` to print the week number at the start of each row. With `weekStart: "monday"` it uses ISO 8601 week numbers; with `"sunday"` it uses the US convention (week containing January 1 is week 1):

```ts
console.log(calendar({ year: 2026, month: 9, weekStart: "monday", showWeekNumbers: true }));
```

```
         September 2026
 Mon Tue Wed Thu Fri Sat Sun
 36                         1   2   3   4   5   6
 ...
```

```tsx
<Calendar year={2026} month={9} weekStart="monday" showWeekNumbers />
```

```svelte
<Calendar year={2026} month={9} weekStart="monday" showWeekNumbers />
```

### Range selection (React / Svelte)

`selectionMode: "range"` commits a start–end range with two clicks. Clicking a third date starts a new selection:

```tsx
<InteractiveCalendar selectionMode="range" />
```

The committed range stays highlighted until the next pick starts; `useCalendarState` exposes it via `selectedRange` and `selectRange(from, to)`. The same mode is available headlessly in the TUI package.

### Output

```
      September 2026
Sun Mon Tue Wed Thu Fri Sat
          1   2   3   4   5
  6   7   8   9  10  11  12
 13  14  15  16  17  18  19
 20  21  22  23  24  25  26
 27  28  29  30
```

## API

### `calendar(options: CalendarOptions): string`

Render a single month.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `year` | `number` | — | Calendar year (e.g. `2026`) |
| `month` | `number` | — | Month, 1-indexed (`1`–`12`) |
| `locale` | `"en" \| "ja" \| "es" \| "de" \| "fr" \| "ko" \| "zh"` | `"en"` | Language |
| `weekStart` | `"sunday" \| "monday"` | `"sunday"` | First day of the week |
| `highlight` | `Date` | — | Date to highlight (e.g. today) |
| `highlightStyle` | `"bracket" \| "reverse"` | `"bracket"` | Highlight appearance |
| `range` | `{ from: Date; to: Date }` | — | Dates to color |
| `showWeekNumbers` | `boolean` | `false` | Print the week number at the start of each row (`monday` start → ISO 8601 week, `sunday` start → week-of-year containing Jan 1) |
| `isDateDisabled` | `(date: Date) => boolean` | — | Dates to render dimmed as non-selectable |
| `color` | `boolean` | `false` | Emit ANSI color codes |

### `calendarYear(options: CalendarYearOptions): string`

Render a full year as a 4 × 3 grid of months. Same options as `calendar`, but uses `year` instead of `month`.

### `calendarRange(options: CalendarRangeOptions): string`

Render every month from `from` to `to` (inclusive), each on its own block. Same options as `calendar`, but uses `from` / `to` Date ranges.

### `renderMonth(year, month, options?): string`

Low-level API to render a single month. Useful for custom layouts.

## Options

### Locale

```ts
calendar({ year: 2026, month: 9, locale: "ja", weekStart: "monday" });
```

```
          9月 2026
  月   火   水   木   金   土   日
      1   2   3   4   5   6
  7   8   9  10  11  12  13
 ...
```

### Highlight

Bracket (default):

```ts
calendar({ year: 2026, month: 9, highlight: new Date(2026, 8, 8) });
//                       ...  8 is shown as [8]
```

Reverse video (requires `color: true`):

```ts
calendar({
  year: 2026,
  month: 9,
  highlight: new Date(2026, 8, 8),
  highlightStyle: "reverse",
  color: true,
});
```

### Range coloring

Dates within the range are colored yellow when `color: true`:

```ts
calendar({
  year: 2026,
  month: 9,
  range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) },
  color: true,
});
```

When a date is both highlighted and in range, the highlight takes precedence.

`range.from` must not be after `range.to` — a reversed range throws a `RangeError` in every layer (`core`, the CLI, `buildMonthData`, React, and Svelte).

### Disabled dates

`isDateDisabled` marks dates as non-selectable. In the CLI they render dimmed; in the web packages they get the `is-disabled` class (and `--cal-disabled-fg` color), take `aria-disabled`, and block clicks. Keyboard cursor movement skips them:

```ts
calendar({
  year: 2026,
  month: 9,
  isDateDisabled: (date) => date.getDay() === 0, // disable Sundays
});
```

By default (`color: false`) the output is clean plain text with no ANSI escape codes, so it's safe to pipe into files or other tools.

## Input validation

All APIs validate their inputs and throw `RangeError` on invalid values instead of silently producing wrong results. An out-of-range `month` passed to high-level APIs (`calendar()`, `buildMonthData`, the React component) rolls over (e.g. month `13` → January of the next year); every other invalid input is rejected:

- `year`: integer `1`–`9999` (`0`, `-1`, `10000`, `2026.5`, `NaN` are rejected)
- `month`: integer `1`–`12` (`0`, `13`, `2.5`, `NaN` are rejected)
- `locale`: one of `en | ja | es | de | fr | ko | zh`
- `weekStart`: `"sunday" | "monday"`
- `range`: `from <= to`; a reversed or invalid range throws `RangeError` in every layer
- dates: `highlight`, `today`, `range.from`, `range.to`, and `calendarRange`'s `from`/`to` must be valid `Date`s

> **Note:** JavaScript's `new Date(year, ...)` interprets years `0`–`99` as `1900 + year`. This
> library builds dates with `setFullYear` internally, so years below `100` are handled correctly —
> but years `0` and `10000` are out of range and rejected.

## TypeScript

All options are fully typed and exported:

```ts
import type {
  CalendarOptions,
  CalendarYearOptions,
  CalendarRangeOptions,
  RenderMonthOptions,
  Locale,
  WeekStart,
  HighlightStyle,
} from "@typescript-calendar-lib/cli";
```

## Testing

```sh
pnpm test
```

The suite covers date utilities (leap years, month boundaries, ISO/week-of-year numbers, DST-safe arithmetic), locale headers, grid layout, highlight/range/disabled/week-number rendering, cursor movement, single/range selection, and public API integration across all packages.

## Development

```sh
pnpm install
pnpm hooks:install   # enable git hooks (commit message + typecheck/test)
pnpm lint            # biome check
pnpm typecheck
pnpm test
pnpm test:coverage   # vitest + v8 coverage report
```

Git hooks live in `.githooks/` and are enabled per-repo via `core.hooksPath`. The `pre-commit` hook runs a whitespace check, typecheck, and the full test suite; the `commit-msg` hook enforces conventional commit messages (`<type>: <summary>`). Code style and lint rules are enforced by [Biome](https://biomejs.dev/) (`biome.json`).

CI (`.github/workflows/ci.yml`) runs typecheck and tests on Node 22/24, Biome lint, coverage (with configured thresholds), and a dry-run publish check on every PR and push to `main`. Dependabot keeps npm dependencies and GitHub Actions updated.

## License

MIT