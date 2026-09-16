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
| `locale` | `"en" \| "ja" \| "es" \| "de" \| "fr" \| "ko" \| "zh"` | `"en"` | Language |
| `weekStart` | `"sunday" \| "monday"` | `"sunday"` | First day of the week |
| `highlight` | `Date` | — | Date to highlight |
| `range` | `{ from: Date; to: Date }` | — | Dates to emphasize |
| `today` | `Date` | — | Reference date for "today" styling |
| `theme` | `ThemeName \| ReactTheme` | `"default"` | CSS class-based theme |
| `colorScheme` | `ColorSchemeName \| ReactColorScheme` | `"default"` | CSS variable-based colors |
| `size` | `CalendarSize` | `"md"` | Cell size |
| `style` | `CSSProperties` | — | Extra styles for the root element |
| `interactive` | `boolean` | `false` | Enable cell click/hover/keyboard selection |
| `onDateClick` | `(date: Date) => void` | — | Called when a day cell is clicked (or Enter/Space pressed) |
| `onDateHover` | `(date: Date) => void` | — | Called when a day cell is hovered |
| `onKeyDown` | `(e: KeyboardEvent) => void` | — | Keyboard handler on the grid element |
| `selectedDate` | `Date \| null` | `null` | Marks the cell `aria-selected` |
| `cursorDate` | `Date \| null` | `null` | The cell that gets `tabIndex=0` (roving tabindex) |
| `renderCell` | `(day, date, state) => ReactNode` | — | Custom cell content renderer |

The component exports as both named `Calendar` and default.

## Interactive Mode

Set `interactive` to make day cells clickable. Each cell becomes a `<button class="calendar-day-btn">` — clickable, hoverable, and keyboard-accessible (Enter / Space):

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

For full interactivity (cursor movement, month navigation, selection), use the `useCalendarState` hook. It wraps the `@typescript-calendar-lib/tui` state machine as React state:

```tsx
import { Calendar, useCalendarState } from "@typescript-calendar-lib/react";
import "@typescript-calendar-lib/react/calendar.css"; // required — component styles

function App() {
  const {
    state,        // CalendarState (tui)
    goNext,       // () => void — next month
    goPrev,       // () => void — previous month
    goToday,      // () => void — jump to today
    navigateYear, // (direction) => void — "prev" | "next" year
    goToMonth,    // (year, month) => void — jump to a specific month
    goToDate,     // (date) => void — jump to a date's month, cursor on that date
    moveCursor,   // (direction) => void — "up" | "down" | "left" | "right"
    selectDate,   // () => void — select date under cursor
    clearSelection,
    cursorDate,   // Date | null
    selectedDate, // Date | null
  } = useCalendarState({
    initialYear: 2026,
    initialMonth: 9,
  });

  return (
    <>
      <button onClick={goPrev}>‹</button>
      <Calendar year={state.year} month={state.month} interactive />
      <button onClick={goNext}>›</button>
    </>
  );
}
```

`options` also accepts `onMonthChange: (year, month) => void`, called whenever the displayed month changes.

## InteractiveCalendar

`InteractiveCalendar` bundles `useCalendarState` + `<Calendar>` into a single self-contained component. It manages its own state and supports keyboard navigation out of the box:

| Key | Action |
| :--- | :--- |
| Arrow keys | Move the cursor (focus follows the cursor cell) |
| `PageUp` / `PageDown` | Previous / next month |
| Enter / Space | Same as clicking the focused cell |

```tsx
import { InteractiveCalendar } from "@typescript-calendar-lib/react";
import "@typescript-calendar-lib/react/calendar.css"; // required — component styles

function App() {
  return (
    <InteractiveCalendar
      initialYear={2026}
      initialMonth={9}
      theme="modern"
      colorScheme="ocean"
      onMonthChange={(year, month) => console.log("Month:", year, month)}
      onDateClick={(date) => console.log("Selected", date)}
    />
  );
}
```

It accepts the `useCalendarState` options (`initialYear`, `initialMonth`, `locale`, `weekStart`, `highlight`, `range`, `today`, `onMonthChange`) plus the `Calendar` visual props (`theme`, `colorScheme`, `size`, `style`, `renderCell`) and event callbacks (`onDateClick`, `onDateHover`).

## Custom Cell Rendering

Pass `renderCell` to replace the default day-number content of each cell. It receives the day, the full `Date`, and the cell state:

```tsx
import type { CalendarCellState } from "@typescript-calendar-lib/core";

<Calendar
  year={2026}
  month={9}
  renderCell={(day, date, state) => (
    <span>
      {day}
      {state.isToday && "★"}
      {state.isInRange && "•"}
    </span>
  )}
/>
```

---

See the interactive demo in the repository docs (`docs/guide/interactive-demo.md`) for a complete example.

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

Each day cell gets semantic classes you can target with CSS. In interactive mode, the grid is exposed as a `role="grid"` table with `role="gridcell"` cells (WAI-ARIA APG calendar pattern): today's cell gets `aria-current="date"`, the selected date gets `aria-selected`, and only the cursor cell is tabbable (`tabIndex=0`, roving tabindex).

| Class | When |
| :--- | :--- |
| `is-weekend` | Saturday or Sunday |
| `is-today` | Matches `today` |
| `is-highlight` | Matches `highlight` |
| `is-in-range` | Inside `range` |

## Exports

```ts
import Calendar, {
  Calendar,
  COLOR_SCHEMES,
  resolveColorScheme,
  resolveTheme,
  THEMES,
  useCalendarState,
  InteractiveCalendar,
} from "@typescript-calendar-lib/react";

import type {
  CalendarCustomSize,
  CalendarProps,
  CalendarSize,
  CalendarSizeName,
  ColorSchemeName,
  InteractiveCalendarProps,
  ReactColorScheme,
  ReactTheme,
  ThemeName,
  UseCalendarStateOptions,
  UseCalendarStateReturn,
} from "@typescript-calendar-lib/react";
```

## License

MIT