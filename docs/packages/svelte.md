# @typescript-calendar-lib/svelte

A `<Calendar />` Svelte 5 component with CSS-based themes and color schemes, plus a `useCalendarState` hook for full interactivity. The component is fully controlled — you pass `year` and `month` and it renders the grid.

> **Warning: Peer dependency** — Requires Svelte 5 (runes). The package doesn't bundle Svelte; install it in your app:
>
> ```sh
> npm install svelte @typescript-calendar-lib/svelte
> ```

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

## Component API

### `Calendar`

```svelte
<Calendar year={2026} month={9} />
```

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `year` | `number` | — (required) | Calendar year |
| `month` | `number` | — (required) | Month, 1-indexed (`1`–`12`) |
| `locale` | `Locale` | `"en"` | Language |
| `weekStart` | `WeekStart` | `"sunday"` | First day of the week |
| `highlight` | `Date` | — | Date to highlight |
| `range` | `{ from: Date; to: Date }` | — | Dates to emphasize |
| `rangePreview` | `{ from: Date; to: Date }` | — | Candidate range preview (hover preview), rendered with the `is-in-range-preview` class |
| `today` | `Date` | — | Reference date for "today" styling |
| `selected` | `Date \| null` | — | Selected date (`.is-selected` class, `aria-pressed` in interactive mode) |
| `cursorDate` | `Date \| null` | — | Cursor position (`.is-cursor` class) |
| `hoveredDate` | `Date \| null` | — | Hovered date (`.is-hovered` class) |
| `theme` | `ThemeName \| SvelteTheme` | `"default"` | CSS class-based theme |
| `colorScheme` | `ColorSchemeName \| SvelteColorScheme` | `"default"` | CSS variable-based colors |
| `size` | `CalendarSize` | `"md"` | Cell size |
| `style` | `CSSProperties` | — | Extra styles for the root element |
| `interactive` | `boolean` | `false` | Enable cell click/hover/keyboard selection |
| `onDateClick` | `(date: Date) => void` | — | Called when a day cell is clicked (or Enter/Space pressed) |
| `onDateHover` | `(date: Date) => void` | — | Called when a day cell is hovered |
| `onDateLeave` | `() => void` | — | Called when the mouse leaves the calendar |

The component exports as both named `Calendar` and default.

## InteractiveCalendar

A turnkey component that wires `useCalendarState` and `Calendar` together with built-in mouse and keyboard handling. No manual event wiring required.

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
  onDateClick={(date) => console.log("Selected", date)}
  onDateHover={(date) => console.log("Hovered", date)}
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
| `theme` | `ThemeName \| SvelteTheme` | CSS class-based theme |
| `colorScheme` | `ColorSchemeName \| SvelteColorScheme` | CSS variable-based colors |
| `size` | `CalendarSize` | Cell size |
| `style` | `CSSProperties` | Extra styles for the root element |
| `onDateClick` | `(date: Date) => void` | Called when a date is selected |
| `onDateHover` | `(date: Date) => void` | Called on cell hover |
| `onDateLeave` | `() => void` | Called when the mouse leaves the calendar |

## Interactive Mode

Set `interactive` to make day cells clickable. Each cell becomes a focusable `role="button"` supporting click, mouse hover, and Enter / Space keys. Buttons include a localized `aria-label`; today gets `aria-current="date"` and a `selected` date gets `aria-pressed="true"`:

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
| `clearSelection` | `() => void` | Clear the selection |
| `setCursorToDate` | `(date: Date) => void` | Move the cursor to a specific date (no-op if outside current month) |
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

## Cell Classes

Each day cell gets semantic classes you can target with CSS:

| Class | When |
| :--- | :--- |
| `is-weekend` | Saturday or Sunday |
| `is-today` | Matches `today` |
| `is-highlight` | Matches `highlight` |
| `is-in-range` | Inside `range` |
| `is-in-range-preview` | Inside `rangePreview` |
| `is-hovered` | Matches `hoveredDate` (interactive mode) |
| `is-selected` | Matches `selected` |
| `is-cursor` | Matches `cursorDate` |

## CSS

The stylesheet must be imported once in your application:

```svelte
<script lang="ts">
  import "@typescript-calendar-lib/svelte/calendar.css";
</script>
```

## Types

All types are exported from the package entry point:

```ts
export type { CSSProperties } from "@typescript-calendar-lib/svelte/style";
export type { SvelteTheme, SvelteColorScheme, ThemeName, ColorSchemeName } from "@typescript-calendar-lib/svelte/themes";
export type { CalendarSize } from "@typescript-calendar-lib/svelte/size";
```

Utility functions (`getCellClasses`, `buildSizeStyle`, `isSizeName`, `resolveTheme`, `resolveColorScheme`) and constants (`THEMES`, `COLOR_SCHEMES`) are also re-exported.
