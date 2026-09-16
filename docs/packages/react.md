# @typescript-calendar-lib/react

A `<Calendar />` React component with CSS-based themes and color schemes, plus a `useCalendarState` hook for full interactivity. The component is fully controlled — you pass `year` and `month` and it renders the grid.

> **Warning: Peer dependency** — Requires React 19. The package doesn't bundle React; install it in your app:
>
> ```sh
> npm install react @typescript-calendar-lib/react
> ```

## Installation

```sh
pnpm add @typescript-calendar-lib/react
# or
npm install @typescript-calendar-lib/react
# or
bun add @typescript-calendar-lib/react
```

## Quick Start

```tsx
import { Calendar } from "@typescript-calendar-lib/react";
import "@typescript-calendar-lib/react/calendar.css"; // required — component styles

export function App() {
  return (
    <Calendar
      year={2026}
      month={9}
      colorScheme="ocean"
      theme="modern"
    />
  );
}
```

## Component API

### `Calendar`

```tsx
<Calendar year={2026} month={9} />
```

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `year` | `number` | — (required) | Calendar year |
| `month` | `number` | — (required) | Month, 1-indexed (`1`–`12`) |
| `locale` | `"en" \| "ja"` | `"en"` | Language |
| `weekStart` | `"sunday" \| "monday"` | `"sunday"` | First day of the week |
| `highlight` | `Date` | — | Date to highlight |
| `range` | `{ from: Date; to: Date }` | — | Dates to emphasize |
| `rangePreview` | `{ from: Date; to: Date }` | — | Candidate range preview (hover preview), rendered with the `is-in-range-preview` class |
| `today` | `Date` | — | Reference date for "today" styling |
| `theme` | `ThemeName \| ReactTheme` | `"default"` | CSS class-based theme |
| `colorScheme` | `ColorSchemeName \| ReactColorScheme` | `"default"` | CSS variable-based colors |
| `size` | `CalendarSize` | `"md"` | Cell size |
| `style` | `CSSProperties` | — | Extra styles for the root element |
| `interactive` | `boolean` | `false` | Enable cell click/hover/keyboard selection |
| `onDateClick` | `(date: Date) => void` | — | Called when a day cell is clicked (or Enter/Space pressed) |
| `onDateHover` | `(date: Date) => void` | — | Called when a day cell is hovered |
| `onDateLeave` | `() => void` | — | Called when the mouse leaves the calendar |

The component exports as both named `Calendar` and default.

## Interactive Mode

Set `interactive` to make day cells clickable. Each cell becomes a focusable `role="button"` supporting click, mouse hover, and Enter / Space keys:

```tsx
<Calendar
  year={2026}
  month={9}
  interactive
  onDateClick={(date) => console.log("Selected", date)}
  onDateHover={(date) => console.log("Hovered", date)}
/>
```

### `useCalendarState` hook

For full interactivity (cursor movement, month navigation, selection), use the `useCalendarState` hook. It wraps the [`tui`](/packages/tui) state machine as React state:

```tsx
import { Calendar, useCalendarState } from "@typescript-calendar-lib/react";
import "@typescript-calendar-lib/react/calendar.css"; // required — component styles

function App() {
  const {
    state,        // CalendarState (tui)
    goNext,       // () => void — next month
    goPrev,       // () => void — previous month
    goToday,      // () => void — jump to today
    moveCursor,   // (direction) => void — "up" | "down" | "left" | "right"
    selectDate,   // () => void — select date under cursor
    selectDateAt, // (date) => void — move cursor to a date and select it
    clearSelection,
    cursorDate,   // Date | null
    selectedDate, // Date | null
    hoveredDate,  // Date | null
    setHoveredDate, // (date | null) => void
  } = useCalendarState({
    initialYear: 2026,
    initialMonth: 9,
  });

  return (
    <>
      <button onClick={goPrev}>‹</button>
      <Calendar
        year={state.year}
        month={state.month}
        interactive
        onDateClick={selectDateAt}   // click a cell → select it
        onDateHover={setHoveredDate} // track the hovered cell
        hoveredDate={hoveredDate}
      />
      <button onClick={goNext}>›</button>
    </>
  );
}
```

See the [Interactive Demo](/guide/interactive-demo) for a complete example.

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

```tsx
const myTheme: ReactTheme = { className: "my-calendar" };
```

### `ReactTheme`

```ts
interface ReactTheme {
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

### `ReactColorScheme`

A color scheme is a map of `--cal-*` CSS custom properties:

```ts
type ReactColorScheme = Record<`--cal-${string}`, string>;
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

Pass a custom scheme directly:

```tsx
const myScheme: ReactColorScheme = {
  "--cal-bg": "#ffffff",
  "--cal-fg": "#1e293b",
  "--cal-accent": "#6366f1",
  // ...all keys required
};
```

### `COLOR_SCHEMES` / `resolveColorScheme(scheme?)`

Predefined schemes and resolver.

## Sizing

### `CalendarSize`

```ts
type CalendarSizeName = "sm" | "md" | "lg";
type CalendarCustomSize = {
  width?: number | string;
  height?: number | string;
};
type CalendarSize = CalendarSizeName | CalendarCustomSize;
```

Use preset sizes (`"sm" | "md" | "lg"`):

```tsx
<Calendar year={2026} month={9} size="lg" />
```

Or custom pixel sizes:

```tsx
<Calendar
  year={2026}
  month={9}
  size={{ width: 48, height: 40 }}
/>
```

Numbers are treated as pixels; strings pass through as CSS lengths (`"3rem"`, `"2.5em"`, etc.).

## Styling with `style`

The `style` prop can override any CSS variable or add custom styles:

```tsx
<Calendar
  year={2026}
  month={9}
  style={{ "--cal-accent": "#8b5cf6", borderRadius: "1rem" } as React.CSSProperties}
/>
```

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

## Exports

```ts
import Calendar, {
  Calendar,
  COLOR_SCHEMES,
  resolveColorScheme,
  resolveTheme,
  THEMES,
  useCalendarState,
} from "@typescript-calendar-lib/react";

import type {
  CalendarCustomSize,
  CalendarProps,
  CalendarSize,
  CalendarSizeName,
  ColorSchemeName,
  ReactColorScheme,
  ReactTheme,
  ThemeName,
  UseCalendarStateOptions,
  UseCalendarStateReturn,
} from "@typescript-calendar-lib/react";
```