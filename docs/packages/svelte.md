# @typescript-calendar-lib/svelte

A `<Calendar />` Svelte 5 component with CSS-based themes and color schemes, plus a `useCalendarState` hook for full interactivity. The component is fully controlled — you pass `year` and `month` and it renders the grid.

> **Warning: Peer dependency** — Requires Svelte 5 (runes). The package doesn't bundle Svelte; install it in your app:
>
> ```sh
> npm install svelte @typescript-calendar-lib/svelte
> ```

> **Note: Build tooling** — This package ships Svelte component sources (`.svelte`), so your app must have a Svelte compiler wired up, e.g. Vite with [`@sveltejs/vite-plugin-svelte`](https://github.com/sveltejs/vite-plugin-svelte) or SvelteKit. It is not designed to be imported directly in Node.js (SSR without a compiler fails with `ERR_UNKNOWN_FILE_EXTENSION`).

## Installation

```sh
pnpm add @typescript-calendar-lib/svelte
# or
npm install @typescript-calendar-lib/svelte
# or
bun add @typescript-calendar-lib/svelte
```

## Quick Start

```svelte
<script lang="ts">
  import Calendar from "@typescript-calendar-lib/svelte";
  import "@typescript-calendar-lib/svelte/calendar.css"; // required — component styles
</script>

<Calendar year={2026} month={9} colorScheme="ocean" theme="modern" />
```

## Server-side rendering

SvelteKit enables SSR for `+page.svelte` by default. Render the component normally and SvelteKit will produce the initial HTML before hydrating it in the browser:

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import Calendar from "@typescript-calendar-lib/svelte";
  import "@typescript-calendar-lib/svelte/calendar.css";
</script>

<Calendar year={2026} month={9} today={new Date(2026, 8, 15)} />
```

For a standalone Svelte 5 server render, use `render` from `svelte/server`:

```ts
import { render } from "svelte/server";
import Calendar from "@typescript-calendar-lib/svelte";

const { body, head } = render(Calendar, {
  props: { year: 2026, month: 9, today: new Date(2026, 8, 15) },
});
```

Run the component through a Svelte compiler such as Vite or SvelteKit; the package ships `.svelte` sources and is not a bare-Node component entry.

## Component API

### `Calendar`

```svelte
<Calendar year={2026} month={9} />
```

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `year` | `number` | — (required) | Calendar year |
| `month` | `number` | — (required) | Month, 1-indexed (`1`–`12`) |
| `locale` | `"en" \| "ja" \| "es" \| "de" \| "fr" \| "ko" \| "zh"` | `"en"` | Language |
| `weekStart` | `"sunday" \| "monday"` | `"sunday"` | First day of the week |
| `highlight` | `Date` | — | Date to highlight |
| `range` | `{ from: Date; to: Date }` | — | Dates to emphasize |
| `rangePreview` | `{ from: Date; to: Date }` | — | Candidate range preview (hover preview), rendered with the `is-in-range-preview` class |
| `today` | `Date` | — | Reference date for "today" styling |
| `isDateDisabled` | `(date: Date) => boolean` | — | Mark dates as non-selectable (rendered with the `is-disabled` class; blocks clicks, hover, and cursor movement) |
| `selected` | `Date \| null` | — | Selected date (`.is-selected` class, `aria-pressed="true"` in interactive mode; other buttons are `"false"`) |
| `cursorDate` | `Date \| null` | — | Cursor position (`.is-cursor` class) |
| `hoveredDate` | `Date \| null` | — | Hovered date (`.is-hovered` class) |
| `theme` | `ThemeName \| SvelteTheme` | `"default"` | CSS class-based theme |
| `colorScheme` | `ColorSchemeName \| SvelteColorScheme` | `"default"` | CSS variable-based colors |
| `size` | `CalendarSize` | `"md"` | Cell size |
| `responsive` | `boolean` | `false` | Shrink cells & padding below `480px` so the grid fits phone screens |
| `showWeekNumbers` | `boolean` | `false` | Render a leading week-number column (`th[scope="row"]` with class `calendar-week`); the number follows `weekStart` (`"monday"` → ISO week, `"sunday"` → week-containing-Jan-1 week) |
| `style` | `CSSProperties` | — | Extra styles for the root element |
| `interactive` | `boolean` | `false` | Enable cell click/hover/keyboard selection |
| `onDateClick` | `(date: Date, data?: unknown) => void` | — | Called when a day cell is clicked (or Enter/Space pressed); `data` is that cell's `cellData` value (`undefined` when none) |
| `onDateHover` | `(date: Date) => void` | — | Called when a day cell is hovered |
| `onDateLeave` | `() => void` | — | Called when the mouse leaves the calendar |
| `cellData` | `(date: Date) => unknown` | — | Resolve per-cell data; passed to `renderCell` and `onDateClick` |
| `renderCell` | `(day, date, state, data?) => string` | — | Custom cell content; the returned string is inserted as plain text (XSS-safe) |

The component exports as both named `Calendar` and default.

## InteractiveCalendar

A turnkey component that wires `useCalendarState` and `Calendar` together with built-in mouse and keyboard handling. No manual event wiring required:

```svelte
<script lang="ts">
  import InteractiveCalendar from "@typescript-calendar-lib/svelte";
  import "@typescript-calendar-lib/svelte/calendar.css";
</script>

<InteractiveCalendar
  initialYear={2026}
  initialMonth={9}
  theme="modern"
  colorScheme="ocean"
  onDateClick={(date, data) => console.log("Selected", date, data)}
  onDateLeave={() => console.log("Mouse left")}
/>
```

### Behavior

- **Click** — selects the date and moves the cursor there (Enter/Space via keyboard behaves identically)
- **Hover** — adds `is-hovered` class to the hovered cell
- **Mouse leave** — clears the hover state
- **Selected + hover** — shows `is-in-range-preview` between the selected and hovered dates (reversed hover is sorted correctly)
- **Arrow keys** — moves the cursor with focus tracking
- **PageUp/PageDown** — navigates to the previous/next month

### Props

Combines `useCalendarState` options, `Calendar` visual props, and event callbacks:

| Prop | Type | Description |
| :--- | :--- | :--- |
| `initialYear` | `number` | Starting year (defaults to today's year) |
| `initialMonth` | `number` | Starting month `1`–`12` (normalized if out of range) |
| `locale` | `Locale` | Language |
| `weekStart` | `WeekStart` | First day of the week |
| `highlight` | `Date` | Date to highlight |
| `range` | `{ from: Date; to: Date }` | Dates to emphasize |
| `today` | `Date` | Reference date for "today" styling |
| `isDateDisabled` | `(date: Date) => boolean` | Mark dates as non-selectable |
| `theme` | `ThemeName \| SvelteTheme` | CSS class-based theme |
| `colorScheme` | `ColorSchemeName \| SvelteColorScheme` | CSS variable-based colors |
| `size` | `CalendarSize` | Cell size |
| `responsive` | `boolean` | Shrink cells & padding below `480px` so the grid fits phone screens |
| `style` | `CSSProperties` | Extra styles for the root element |
| `cellData` | `(date: Date) => unknown` | Resolve per-cell data; passed to `renderCell` and `onDateClick` |
| `renderCell` | `(day, date, state, data?) => string` | Custom cell content (plain text, XSS-safe) |
| `onDateClick` | `(date: Date, data?: unknown) => void` | Called when a date is selected; `data` is the cell's `cellData` value |
| `onDateHover` | `(date: Date) => void` | Called on cell hover |
| `onDateLeave` | `() => void` | Called when the mouse leaves the calendar |

## Interactive Mode

Set `interactive` to make day cells clickable. Each cell becomes a `<button class="calendar-day-btn">` — clickable, hoverable, and keyboard-accessible (Enter / Space). Buttons are announced with a localized `aria-label` and an explicit `aria-pressed="true"` or `"false"`; today's cell gets `aria-current="date"`. The table has an `aria-label`, weekday headers use `scope="col"`, and week-number cells use `th[scope="row"]`:

```svelte
<Calendar
  year={2026}
  month={9}
  interactive
  selected={cal.selectedDate}
  cursorDate={cal.cursorDate}
  onDateClick={(date) => console.log("Selected", date)}
  onDateHover={(date) => console.log("Hovered", date)}
/>
```

## Per-cell data & custom cells

`cellData` attaches your own data to specific dates; consume it in `renderCell` (4th argument) or `onDateClick` (2nd argument). `cellData` is called once per real day cell (never for empty cells), and returning `undefined` means "no data":

```svelte
<Calendar
  year={2026}
  month={9}
  interactive
  cellData={(date) => (date.getDate() === 15 ? "meeting" : undefined)}
  renderCell={(day, date, state, data) =>
    data === undefined ? String(day) : `${day} (${data})`}
  onDateClick={(date, data) => console.log(date, data)} // data: "meeting" | undefined
/>
```

`renderCell` receives `(day, date, state, data)` — `state` is the core `CalendarCellState` (`isWeekend`, `isToday`, …). The returned string is inserted **as plain text**, never as HTML, so it's XSS-safe.

`cellData`/`renderCell` are render-layer options — they are **not** part of `useCalendarState` (`Calendar` re-renders from its props, so hook-level cell data would have no visible effect).

## `useCalendarState` hook

For full interactivity (cursor movement, month navigation, selection), use the `useCalendarState` hook. It wraps the [`tui`](/packages/tui) state machine as Svelte 5 runes state.

> **Reactive options:** Pass a **getter function** instead of a plain object if any option should track reactive props or `$state` values. A plain object is snapshot-only.
>
> ```svelte
> <script lang="ts">
>   import Calendar, { useCalendarState } from "@typescript-calendar-lib/svelte";
>   import "@typescript-calendar-lib/svelte/calendar.css";
>
>   let { highlight, today } = $props();
>
>   const cal = useCalendarState(() => ({
>     initialYear: 2026,
>     initialMonth: 9,
>     today,
>     highlight,
>   }));
> </script>
>
> <button onclick={cal.goPrev}>‹</button>
> <Calendar
>   year={cal.state.year}
>   month={cal.state.month}
>   selected={cal.selectedDate}
>   cursorDate={cal.cursorDate}
>   interactive
> />
> <button onclick={cal.goNext}>›</button>
> ```

### Return value

| Field | Type | Description |
| :--- | :--- | :--- |
| `state` | `CalendarState` | Current calendar state (from tui) |
| `goNext` | `() => void` | Move to next month |
| `goPrev` | `() => void` | Move to previous month |
| `goToday` | `() => void` | Jump to today's month |
| `moveCursor` | `(direction: Direction) => void` | Move cursor: `"up"` / `"down"` / `"left"` / `"right"` |
| `selectDate` | `() => void` | Select the date under the cursor |
| `selectDateAt` | `(date: Date) => void` | Move cursor to a date and select it (useful for mouse click) |
| `setCursorToDate` | `(date: Date) => void` | Move the cursor to a specific date (no-op if outside current month) |
| `clearSelection` | `() => void` | Clear the selection |
| `cursorDate` | `Date \| null` | Date under the cursor |
| `selectedDate` | `Date \| null` | Currently selected date |
| `hoveredDate` | `Date \| null` | Currently hovered date |
| `setHoveredDate` | `(date: Date \| null) => void` | Set or clear the hovered date |

## Themes

### `ThemeName`

```ts
type ThemeName = "default" | "modern" | "minimal" | "rounded" | "retro";
```

Themes are implemented as CSS classes applied to the root element:

- `calendar-theme-default`
- `calendar-theme-modern`
- `calendar-theme-minimal`
- `calendar-theme-rounded`
- `calendar-theme-retro`

Pass a custom theme as an object:

```ts
const myTheme: SvelteTheme = { className: "my-calendar" };
```

### `SvelteTheme`

```ts
interface SvelteTheme {
  className: string;
}
```

### `THEMES` / `resolveTheme(theme?)`

Predefined theme map and resolver.

## Color Schemes

### `ColorSchemeName`

```ts
type ColorSchemeName =
  | "default" | "ocean" | "forest" | "sunset"
  | "mono" | "midnight" | "blossom";
```

### `SvelteColorScheme`

A color scheme is a map of `--cal-*` CSS custom properties:

```ts
type SvelteColorScheme = Record<`--cal-${string}`, string>;
```

Available variables:

| Variable | Purpose |
| :--- | :--- |
| `--cal-bg` | Background |
| `--cal-fg` | Foreground |
| `--cal-accent` | Accent (highlight) |
| `--cal-weekend-fg` | Weekend foreground |
| `--cal-border` | Borders |
| `--cal-header-bg` | Header background |
| `--cal-highlight-bg` | Highlight background |
| `--cal-highlight-fg` | Highlight foreground |
| `--cal-range-bg` | Range background |
| `--cal-range-preview-bg` | Range preview background (falls back to `--cal-range-bg`) |
| `--cal-today-bg` | Today background |
| `--cal-today-fg` | Today foreground |
| `--cal-disabled-fg` | Disabled date foreground |
| `--cal-selected-bg` | Selected background |
| `--cal-selected-fg` | Selected foreground |

Pass a custom scheme directly:

```ts
const myScheme: SvelteColorScheme = {
  "--cal-bg": "#ffffff",
  "--cal-fg": "#1e293b",
  "--cal-accent": "#6366f1",
};
```

### `COLOR_SCHEMES` / `resolveColorScheme(scheme?)`

Predefined schemes and resolver.

## Sizing

### `CalendarSize`

```ts
type CalendarSize = "sm" | "md" | "lg" | { width?: number | string; height?: number | string };
```

| Size | Cell dimensions |
| :--- | :--- |
| `"sm"` | `1.75rem` × `1.5rem` |
| `"md"` | `2.25rem` × `2rem` |
| `"lg"` | `3.125rem` × `2.75rem` |

Custom objects set the `--cal-cell-w` / `--cal-cell-h` CSS variables (numbers become px, strings pass through):

```svelte
<Calendar year={2026} month={9} size={{ width: 48, height: 40 }} />
```

### `buildSizeStyle(size?)`

Returns `CSSProperties` for the given size name or custom object.

## CSS

The stylesheet must be imported once in your application:

```svelte
<script lang="ts">
  import "@typescript-calendar-lib/svelte/calendar.css";
</script>
```

## Cell Classes

Each day cell gets semantic classes you can target with CSS. The table has an `aria-label`, weekday headers use `scope="col"`, week-number cells use `th[scope="row"]`, today's cell uses `aria-current="date"`, and interactive day buttons expose `aria-pressed="true"` or `"false"`:

| Class | When |
| :--- | :--- |
| `is-weekend` | Saturday or Sunday |
| `is-today` | Matches `today` |
| `is-highlight` | Matches `highlight` |
| `is-in-range` | Inside `range` |
| `is-in-range-preview` | Inside `rangePreview` |
| `is-hovered` | Matches `hoveredDate` (interactive mode) |
| `is-disabled` | Matches `isDateDisabled` |
| `is-selected` | Matches `selected` |
| `is-cursor` | Matches `cursorDate` |

## Exports

```ts
import Calendar, {
  Calendar,
  buildRangePreview,
  buildSizeStyle,
  COLOR_SCHEMES,
  getCellClasses,
  InteractiveCalendar,
  isSizeName,
  resolveColorScheme,
  resolveTheme,
  THEMES,
  useCalendarState,
} from "@typescript-calendar-lib/svelte";

import type {
  CalendarCustomSize,
  CalendarSize,
  CalendarSizeName,
  CellStateOptions,
  ColorSchemeName,
  CSSProperties,
  SvelteColorScheme,
  SvelteTheme,
  ThemeName,
  UseCalendarStateOptions,
  UseCalendarStateOptionsInput,
  UseCalendarStateReturn,
} from "@typescript-calendar-lib/svelte";
```

## License

MIT