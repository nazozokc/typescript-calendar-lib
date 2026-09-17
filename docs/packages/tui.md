# @typescript-calendar-lib/tui

Framework-agnostic, headless calendar data & state for building TUI calendars. No rendering — you get structured data (`MonthData`) and a state machine (`CalendarState`) that your TUI framework (Ink, React-Blessed, raw ANSI, etc.) consumes to draw pixels.

## Installation

```sh
pnpm add @typescript-calendar-lib/tui
# or
npm install @typescript-calendar-lib/tui
# or
bun add @typescript-calendar-lib/tui
```

## Concepts

The package is split into two layers:

1. **Data** — `buildMonthData()` produces a complete, render-ready month grid with per-cell metadata (today, highlight, range, weekend…).
2. **State** — `createCalendarState()` returns an immutable state object with cursor, selection, month data, and navigation helpers that return new states.

State is **immutable**: every function returns a new `CalendarState` — perfect for React/TUI render loops.

## Month Data

### `buildMonthData(year, month, options?): MonthData`

```ts
import { buildMonthData } from "@typescript-calendar-lib/tui";

const data = buildMonthData(2026, 9, { weekStart: "monday" });
```

### `MonthData`

```ts
interface MonthData {
  year: number;
  month: number; // 1–12
  title: string;             // e.g. "September 2026" or "9月 2026"
  weekdays: readonly string[];  // e.g. ["Sun", "Mon", ...]
  cells: CalendarCell[][];      // 6×7 grid
  visibleRows: number;          // rows that contain dates
}
```

### `CalendarCell`

```ts
interface CalendarCell<T = unknown> {
  day: number | null;       // day of month (1–31), null for empty
  date: Date | null;        // full Date, null when day is null
  dayOfWeek: number;        // 0 = first day per weekStart
  isCurrentMonth: boolean;  // false for padded cells
  isWeekend: boolean;       // true for Saturday/Sunday
  isToday: boolean;
  isHighlight: boolean;
  isInRange: boolean;
  data?: T;                 // cellData's resolved value; omitted when undefined
}
```

### `MonthDataOptions`

```ts
interface MonthDataOptions<T = unknown> {
  locale?: Locale;              // "en" | "ja" | "es" | "de" | "fr" | "ko" | "zh", default "en"
  weekStart?: WeekStart;        // "sunday" | "monday", default "sunday"
  today?: Date;                 // reference for isToday, default new Date()
  highlight?: Date;             // sets isHighlight
  range?: { from: Date; to: Date }; // sets isInRange
  cellData?: (date: Date) => T | undefined; // per-cell data; undefined = no data
}
```

### Per-cell custom data (`cellData`)

Pass `cellData` to attach your own data to specific dates. It is called once per real cell (never for empty cells), and returning `undefined` means "no data" — the `data` field is then omitted:

```ts
type Schedule = { title: string };

const data = buildMonthData<Schedule>(2026, 9, {
  cellData: (date) =>
    date.getDate() === 15 ? { title: "Meeting" } : undefined,
});

data.cells[0]![2]!.data; // { title: "Meeting" } | undefined
```

`MonthData<T>`, `CalendarCell<T>`, and `CalendarState<T>` are generic — `T` defaults to `unknown`, so existing code keeps working without annotations. The same `cellData` is accepted by `createCalendarState()` so the state machine carries it too.

Retrieve the data for an arbitrary date with `getDateData(state, date)` — returns `T | undefined` (`undefined` when the date isn't in the current month or the cell has no data):

```ts
import { getDateData } from "@typescript-calendar-lib/tui";

const schedule = getDateData(state, new Date(2026, 8, 15)); // Schedule | undefined
```

## State Management

### `createCalendarState(options?): CalendarState<T>`

Initializes state. The cursor defaults to today's cell — or the first day cell if today isn't in the displayed month:

```ts
import { createCalendarState } from "@typescript-calendar-lib/tui";

const state = createCalendarState<Schedule>({
  initialYear: 2026,
  initialMonth: 9,
  weekStart: "monday",
  cellData: (date) =>
    date.getDate() === 15 ? { title: "Meeting" } : undefined,
});
```

### `CalendarStateOptions`

```ts
interface CalendarStateOptions<T = unknown> {
  initialYear?: number;         // default: today's year
  initialMonth?: number;        // default: today's month
  initialCursor?: { row: number; col: number } | null; // null = unfocused
  today?: Date;                 // resolved once at creation, fixed in state
  locale?: Locale;
  weekStart?: WeekStart;
  highlight?: Date;
  range?: { from: Date; to: Date };
  cellData?: (date: Date) => T | undefined; // per-cell data; undefined = no data
}
```

### `CalendarState`

```ts
interface CalendarState<T = unknown> {
  year: number;
  month: number; // 1–12
  cursor: { row: number; col: number } | null; // null = unfocused
  selectedDate: Date | null;
  options: ResolvedOptions<T>;  // options fixed at creation
  monthData: MonthData<T>;      // cached data for current month
}
```

## Cursor Operations

```ts
import {
  moveCursor,
  setCursorToDate,
  getCursorDate,
  selectDate,
  getSelectedDate,
  clearSelection,
} from "@typescript-calendar-lib/tui";
```

### `moveCursor(state, direction): CalendarState`

`direction` is `"up" | "down" | "left" | "right"`. Movement wraps around grid edges. When the cursor is `null`, it snaps to today (or the first day cell):

```ts
const next = moveCursor(state, "right");
```

### `setCursorToDate(state, date): CalendarState`

Moves the cursor to the cell containing `date`. Returns the state unchanged if the date isn't in the current month.

### `getCursorDate(state): Date | null`

Returns the date under the cursor, or `null` when the cursor is `null` or on an empty cell.

### `selectDate(state): CalendarState`

Selects the date under the cursor. Nothing happens on empty cells.

### `getSelectedDate(state): Date | null`

Returns the selected date, or `null` if none.

### `clearSelection(state): CalendarState`

Clears the selected date.

## Navigation

```ts
import {
  navigateMonth,
  navigateYear,
  goToMonth,
  goToDate,
  goToToday,
} from "@typescript-calendar-lib/tui";
```

### `navigateMonth(state, direction)`

Move to previous/next month. `direction` is `"prev" | "next"`. The cursor is clamped to the new month's grid.

### `navigateYear(state, direction)`

Move to previous/next year (same month).

### `goToMonth(state, year, month)`

Jump to a specific month. Year/month are normalized (e.g. month `13` → next year's January).

### `goToDate(state, date)`

Jump to the month containing `date` and place the cursor on that date's cell.

### `goToToday(state)`

Jump to today's month and place the cursor on today's cell.

### Search helpers

```ts
import {
  findTodayCell,
  findDateCell,
  findFirstDayCell,
  clampCursor,
  getDateData,
} from "@typescript-calendar-lib/tui";

findTodayCell(monthData);    // { row, col } | null
findDateCell(monthData, date); // { row, col } | null
findFirstDayCell(monthData); // { row, col } | null
clampCursor(cursor, monthData); // clamps to visible rows/cols
getDateData(state, date);    // resolved user data for a date (T | undefined)
```

## Option Sync (for UI framework wrappers)

`resolveOptions`, `sameStateOptions`, and `updateStateOptions` power the React/Svelte wrapper hooks: they detect option changes by value (so inline `Date`/object literals don't cause rebuild loops) and rebuild state while preserving the cursor and selection.

```ts
import { sameStateOptions, updateStateOptions, resolveOptions } from "@typescript-calendar-lib/tui";

resolveOptions(options);        // fix `today` into state, apply defaults
sameStateOptions(a, b);         // true when options are value-equal (Dates via getTime)
updateStateOptions(state, next, prev);
// - preserves cursor & selectedDate
// - jumps only when initialYear/initialMonth actually changed
// - carries over resolved `today` when `next.today` is omitted
```

`rebuildState(year, month, cursor, selectedDate, options, monthData?)` is the low-level state reconstruction used by `createCalendarState` and navigation — pass a pre-built `MonthData` to skip re-computation.

## Themes & Color Schemes

Themes describe layout (cell width, separators, frames); color schemes map calendar elements to `CellStyle`. Since the package is headless, the consuming framework performs the actual rendering from these definitions.

### `ThemeName`

```ts
type ThemeName = "default" | "modern";
```

### `Theme`

```ts
interface Theme {
  cellWidth: number;
  separator: string;
  frame: FrameChars | null;
}
```

### `ColorSchemeName`

```ts
type ColorSchemeName = "default" | "ocean" | "forest" | "sunset" | "mono";
```

### `CellStyle`

```ts
interface CellStyle {
  fg?: number;        // ANSI foreground (0–255)
  bg?: number;        // ANSI background (0–255)
  bold?: boolean;
  dim?: boolean;
  underline?: boolean;
  reverse?: boolean;
}
```

### `ColorScheme`

```ts
interface ColorScheme {
  title: CellStyle;
  weekday: CellStyle;
  day: CellStyle;
  weekend: CellStyle;
  today: CellStyle;
  highlight: CellStyle;
  range: CellStyle;
  dim: CellStyle;
  frame: CellStyle;
}
```

### `THEMES` / `COLOR_SCHEMES` / `resolveTheme` / `resolveColorScheme`

Same pattern as the `@typescript-calendar-lib/cli` package — predefined maps and resolvers accepting either a name or a custom object.

## Example: Minimal TUI Loop

```ts
import {
  createCalendarState,
  getCursorDate,
  moveCursor,
  navigateMonth,
  selectDate,
} from "@typescript-calendar-lib/tui";

let state = createCalendarState({ weekStart: "monday" });

// Arrow-key style interaction loop
const onKey = (key: string) => {
  switch (key) {
    case "left":  state = moveCursor(state, "left");  break;
    case "right": state = moveCursor(state, "right"); break;
    case "up":    state = moveCursor(state, "up");    break;
    case "down":  state = moveCursor(state, "down");  break;
    case "p":     state = navigateMonth(state, "prev"); break;
    case "n":     state = navigateMonth(state, "next"); break;
    case "enter": state = selectDate(state); break;
  }
  const cursorDate = getCursorDate(state);
  // Draw state.monthData.cells using your TUI framework
  // state.selectedDate holds the last selection
};
```

## Exports

```ts
import {
  buildMonthData,
  clampCursor,
  clearSelection,
  COLOR_SCHEMES,
  createCalendarState,
  findDateCell,
  findFirstDayCell,
  findTodayCell,
  getCursorDate,
  getDateData,
  getSelectedDate,
  goToDate,
  goToMonth,
  goToToday,
  moveCursor,
  navigateMonth,
  navigateYear,
  rebuildState,
  resolveColorScheme,
  resolveOptions,
  resolveTheme,
  sameStateOptions,
  selectDate,
  setCursorToDate,
  THEMES,
  updateStateOptions,
} from "@typescript-calendar-lib/tui";

import type {
  CalendarCell,
  CalendarState,
  CalendarStateOptions,
  CellStyle,
  ColorScheme,
  ColorSchemeName,
  Direction,
  FrameChars,
  MonthData,
  MonthDataOptions,
  MonthDirection,
  ResolvedOptions,
  Theme,
  ThemeName,
} from "@typescript-calendar-lib/tui";
```

## License

MIT