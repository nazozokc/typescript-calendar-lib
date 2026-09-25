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

## Server-side rendering

`Calendar` and `InteractiveCalendar` do not access browser APIs while rendering, so they can be rendered on the server:

```tsx
import { renderToString } from "react-dom/server";
import { Calendar } from "@typescript-calendar-lib/react";

const html = renderToString(
  <Calendar year={2026} month={9} today={new Date(2026, 8, 15)} />,
);
```

In the Next.js App Router, a Server Component renders the calendar on the server by default:

```tsx
// app/page.tsx
import { Calendar } from "@typescript-calendar-lib/react";

export default function Page() {
  return <Calendar year={2026} month={9} />;
}
```

Use a Client Component when the calendar needs browser interaction:

```tsx
// app/calendar-panel.tsx
"use client";

import { InteractiveCalendar } from "@typescript-calendar-lib/react";

export function CalendarPanel() {
  return <InteractiveCalendar initialYear={2026} initialMonth={9} />;
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
| `rangePreview` | `{ from: Date; to: Date }` | — | Candidate range preview (hover preview), rendered with the `is-in-range-preview` class |
| `today` | `Date` | — | Reference date for "today" styling |
| `theme` | `ThemeName \| ReactTheme` | `"default"` | CSS class-based theme |
| `colorScheme` | `ColorSchemeName \| ReactColorScheme` | `"default"` | CSS variable-based colors |
| `size` | `CalendarSize` | `"md"` | Cell size |
| `responsive` | `boolean` | `false` | Shrink cells & padding below `480px` so the grid fits phone screens |
| `showWeekNumbers` | `boolean` | `false` | Render a leading week-number column (`th[scope="row"]` with class `calendar-week`); the number follows `weekStart` (`"monday"` → ISO week, `"sunday"` → week-containing-Jan-1 week) |
| `style` | `CSSProperties` | — | Extra styles for the root element |
| `interactive` | `boolean` | `false` | Enable cell click/hover/keyboard selection |
| `onDateClick` | `(date: Date, data?: unknown) => void` | — | Called when a day cell is clicked (or Enter/Space pressed); `data` is that cell's `cellData` value (`undefined` when none) |
| `onDateHover` | `(date: Date) => void` | — | Called when a day cell is hovered |
| `onDateLeave` | `() => void` | — | Called when the mouse leaves the calendar |
| `onKeyDown` | `(e: KeyboardEvent) => void` | — | Keyboard handler on the grid element |
| `selectedDate` | `Date \| null` | `null` | Marks the gridcell `aria-selected` and its interactive button `aria-pressed` |
| `cursorDate` | `Date \| null` | `null` | The cell that gets `tabIndex=0` (roving tabindex) |
| `hoveredDate` | `Date \| null` | `null` | Marks the hovered cell with the `is-hovered` class |
| `cellData` | `(date: Date) => unknown` | — | Resolve per-cell data; passed to `renderCell` and `onDateClick` |
| `renderCell` | `(day, date, state, data?) => ReactNode` | — | Custom cell content renderer |

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

`onDateClick` / `onDateHover` notify the caller but don't touch internal state. To select on click, either use `useCalendarState`'s `selectDateAt(date)` (see below) or the ready-made [`InteractiveCalendar`](#interactivecalendar), which wires click-to-select, hover tracking, and range preview out of the box.

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
    setCursorToDate, // (date) => void — move cursor to a date (same month only)
    selectDateAt, // (date) => void — move cursor to a date and select it
    selectRange,  // (from, to) => void — set a committed range (range mode)
    clearSelection,
    cursorDate,   // Date | null
    selectedDate, // Date | null
    selectedRange, // DateRange | null — committed range (range mode)
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
      />
      <button onClick={goNext}>›</button>
    </>
  );
}
```

`options` also accepts `selectionMode: "single" | "range"` (default `"single"`) and `onMonthChange: (year, month) => void`, called whenever the displayed month changes.

## InteractiveCalendar

`InteractiveCalendar` bundles `useCalendarState` + `<Calendar>` into a single self-contained component. It manages its own state and supports mouse and keyboard interaction out of the box:

| Input | Action |
| :--- | :--- |
| Click a cell | Selects the date (cursor moves there); fires `onDateClick` |
| Hover a cell | Tracks the hovered date (adds `is-hovered` class); fires `onDateHover` |
| Mouse leaves | Clears the hover state; fires `onDateLeave` |
| Selection + hover | Shows a range preview between the selected date and the hovered date (`is-in-range-preview` class) |
| Picking (range mode) | Alternates anchor → committed range → new anchor (`selectionMode="range"`) |
| Arrow keys | Move the cursor (focus follows the cursor cell) |
| `PageUp` / `PageDown` | Previous / next month |
| Enter / Space | Same as clicking the focused cell (selects it) |

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
      onDateClick={(date, data) => console.log("Selected", date, data)}
      onDateLeave={() => console.log("Mouse left the calendar")}
    />
  );
}
```

It accepts the `useCalendarState` options (`initialYear`, `initialMonth`, `locale`, `weekStart`, `selectionMode`, `highlight`, `range`, `today`, `onMonthChange`) plus the `Calendar` visual props (`theme`, `colorScheme`, `size`, `responsive`, `style`, `cellData`, `renderCell`) and event callbacks (`onDateClick`, `onDateHover`, `onDateLeave`).

## Range selection

Pass `selectionMode="range"` to select a date range by clicking. Selection alternates between **anchor → range → reset**: the 1st click sets an anchor, the 2nd commits the range, and the 3rd starts a new anchor. The committed range is kept as the preview until the next pick begins.

```tsx
<InteractiveCalendar
  initialYear={2026}
  initialMonth={9}
  selectionMode="range"
/>
```

With the raw hook, use `selectRange(from, to)` to set the range explicitly and read it back from the `selectedRange` return value:

```tsx
const { state, selectRange, selectedRange } = useCalendarState({
  initialYear: 2026,
  initialMonth: 9,
  selectionMode: "range",
});
```

## Custom Cell Rendering

Pass `renderCell` to replace the default day-number content of each cell. It receives the day, the full `Date`, the cell state, and (with `cellData`) the resolved data for that date:

```tsx
import type { CalendarCellState } from "@typescript-calendar-lib/core";

<Calendar
  year={2026}
  month={9}
  cellData={(date) => (date.getDate() === 15 ? "holiday" : undefined)}
  renderCell={(day, date, state, data) => (
    <span>
      {day}
      {data && `(${data})`}
      {state.isToday && "★"}
      {state.isInRange && "•"}
    </span>
  )}
/>
```

`cellData` is called once per real day cell (never for empty cells) and receives the cell's full `Date`; returning `undefined` means "no data". Use it to attach anything — strings, objects, IDs — and consume it in `renderCell` (4th argument) or `onDateClick` (2nd argument):

```tsx
<Calendar
  year={2026}
  month={9}
  interactive
  cellData={(date) => (date.getDate() === 15 ? "meeting" : undefined)}
  onDateClick={(date, data) => console.log(date, data)} // data: "meeting" | undefined
/>
```

`cellData`/`renderCell` are render-layer options — they are **not** part of `useCalendarState` (`Calendar` re-renders from its props, so hook-level cell data would have no visible effect).

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

## Responsive

The 7-column grid has fixed cell sizes, so on narrow phone screens it can overflow. Pass `responsive` to make the calendar shrink its cells, fonts, and padding below `480px` (and a step tighter below `360px`) and fill the viewport width:

```tsx
<Calendar year={2026} month={9} responsive />
```

It's **off by default** to keep existing layouts unchanged. The calendar root gets a `calendar-responsive` class that drives CSS media queries — you can also add that class yourself, or use the `style` prop / your own CSS to tune the breakpoints further.

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

Each day cell gets semantic classes you can target with CSS. The table has an `aria-label`, weekday headers use `scope="col"`, and week-number cells use `th[scope="row"]`. In interactive mode, the grid is exposed as a `role="grid"` table with `role="gridcell"` cells (WAI-ARIA APG calendar pattern): today's cell gets `aria-current="date"`, the selected date gets `aria-selected` on the gridcell and `aria-pressed` on its button, and only the cursor cell is tabbable (`tabIndex=0`, roving tabindex).

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