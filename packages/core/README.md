# @typescript-calendar-lib/core

Shared, framework-agnostic calendar utilities: date math, locale data, and grid building. Zero runtime dependencies.

> **Tip:** You normally don't need `core` directly — the `cli`, `react`, `svelte`, and `tui` packages re-export the types and utilities you'll need. Reach for `core` when building your own renderer.

## Installation

```sh
pnpm add @typescript-calendar-lib/core
# or
npm install @typescript-calendar-lib/core
# or
bun add @typescript-calendar-lib/core
```

## Types

### `Locale`

```ts
type Locale = "en" | "ja" | "es" | "de" | "fr" | "ko" | "zh";
```

English, Japanese, Spanish, German, French, Korean, and Chinese (Simplified).

### `WeekStart`

```ts
type WeekStart = "sunday" | "monday";
```

### `HighlightStyle`

```ts
type HighlightStyle = "bracket" | "reverse";
```

`"bracket"` wraps the day in brackets (`[8]`), `"reverse"` uses reverse-video styling.

### `CalendarOptions`

```ts
interface CalendarOptions {
  year: number;
  month: number; // 1-indexed (1–12)
  locale?: Locale;          // default: "en"
  weekStart?: WeekStart;    // default: "sunday"
  highlight?: Date;         // date to highlight (e.g. today)
  highlightStyle?: HighlightStyle; // default: "bracket"
  range?: { from: Date; to: Date };
  color?: boolean;          // default: false
}
```

### `CalendarYearOptions`

Same as `CalendarOptions` minus `month` — renders a full year:

```ts
interface CalendarYearOptions {
  year: number;
  locale?: Locale;
  weekStart?: WeekStart;
  highlight?: Date;
  highlightStyle?: HighlightStyle;
  range?: { from: Date; to: Date };
  color?: boolean;
}
```

### `CalendarRangeOptions`

Same as `CalendarOptions` minus `year`/`month`, rendered for every month between `from` and `to` (inclusive):

```ts
interface CalendarRangeOptions {
  from: Date;
  to: Date;
  locale?: Locale;
  weekStart?: WeekStart;
  highlight?: Date;
  highlightStyle?: HighlightStyle;
  range?: { from: Date; to: Date };
  color?: boolean;
}
```

### `RenderMonthOptions`

Same as `CalendarOptions` minus `year`/`month`. Used by the low-level `renderMonth` helper.

## Constants

### `LOCALES`

```ts
const LOCALES: Record<Locale, LocaleData>;
```

Contains month names, weekday headers, and short weekday headers for each locale.

### `MIN_YEAR` / `MAX_YEAR`

The supported year range (`1` / `9999`). Values outside this range are rejected by validation.

## Functions

### `getMonthName(locale, month): string`

Returns the localized month name for a 1-indexed month:

```ts
getMonthName("en", 9); // "September"
getMonthName("ja", 9); // "9月"
```

### `getWeekdayHeaders(locale, weekStart): readonly string[]`

Returns the weekday header array respecting `weekStart`:

```ts
getWeekdayHeaders("en", "sunday"); // ["Sun", "Mon", ..., "Sat"]
getWeekdayHeaders("en", "monday"); // ["Mon", "Tue", ..., "Sun"]
```

### `getLocaleData(locale): LocaleData`

Returns the raw locale data (`months`, `weekdays`, `weekdaysShort`, plus the Monday-start rotations `weekdaysMonday` and `weekdaysMondayShort`). Throws `RangeError` for an unknown locale.

```ts
getLocaleData("en").weekdays;            // ["Sun", "Mon", ..., "Sat"]
getLocaleData("ja").weekdaysMonday;      // ["月", "火", ..., "日"]
```

### `buildMonthGrid(year, month, weekStart): (number | null)[][]`

Builds a 6×7 grid of day numbers (`1`–`31`) with `null` for empty cells. The grid is always 6 rows tall for stable layouts:

```ts
buildMonthGrid(2026, 9, "sunday");
// [
//   [null, null, 1, 2, 3, 4, 5],
//   [6, 7, 8, 9, 10, 11, 12],
//   ...
// ]
```

### `firstDayOfMonth(year, month): Date`

Returns a `Date` for the 1st of the month:

```ts
firstDayOfMonth(2026, 9); // Tue Sep 01 2026
```

### `lastDayOfMonth(year, month): Date`

Returns a `Date` for the last day of the month:

```ts
lastDayOfMonth(2026, 2); // Sat Feb 28 2026 (no leap year)
lastDayOfMonth(2028, 2); // Tue Feb 29 2028 (leap year)
```

### `isDateInRange(date, range?): boolean`

Returns `true` if `date` falls within `range` (inclusive). Returns `false` when `range` is `undefined`.

Throws `RangeError` when `range.from` is after `range.to`, or when any date is invalid.

### `isSameDay(a, b): boolean`

Compares dates by year, month, and day only (ignores time component). Throws `RangeError` when either date is invalid.

### `getMonthRange(from, to): { year: number; month: number }[]`

Returns the list of all months from `from` to `to` (inclusive):

```ts
getMonthRange(new Date(2026, 5, 1), new Date(2026, 8, 30));
// [{ year: 2026, month: 6 }, { year: 2026, month: 7 },
//  { year: 2026, month: 8 }, { year: 2026, month: 9 }]
```

Throws `RangeError` when `from` is after `to`, or when either date is invalid.

### `createDate(year, monthIndex, day): Date`

Creates a local `Date` at `00:00:00` without the `new Date(year, ...)` 1900-interpretation for years `0`–`99`. `monthIndex` is 0-based like `Date`.

### `assertValidDate(date): void`

Throws `RangeError` when `date` is not a `Date` instance or is an `Invalid Date`.

#### Arithmetic

### `addDays(date, amount): Date`

Adds whole days (negative subtracts). Calendar-day based (`setDate`), so DST transitions don't shift the time — the same local time is preserved. Returns a new `Date`; the input is unchanged.

```ts
addDays(new Date(2026, 8, 25), 7);   // Oct 02 2026, same time
addDays(new Date(2026, 8, 25), -25); // Aug 31 2026
```

### `addWeeks(date, amount): Date`

Adds whole weeks — equivalent to `addDays(date, amount * 7)`. `amount` must be an integer.

### `addMonths(date, amount): Date`

Adds whole months. When the target day doesn't exist in the destination month, the result clamps to the month's last day.

```ts
addMonths(new Date(2026, 0, 31), 1); // Feb 28 2026 (Jan 31 + 1 month)
addMonths(new Date(2028, 0, 31), 1); // Feb 29 2028 (leap year)
```

### `addYears(date, amount): Date`

Adds whole years. Feb 29 clamps to Feb 28 of the target year.

```ts
addYears(new Date(2028, 1, 29), 1); // Feb 28 2029
```

#### Period boundaries

`startOf*` normalize to `00:00:00.000`, `endOf*` to `23:59:59.999`.

### `startOfDay(date): Date`

Returns the date at `00:00:00.000`.

### `endOfDay(date): Date`

Returns the date at `23:59:59.999`.

### `startOfWeek(date, weekStart?): Date`

Returns the first day of the containing week at `00:00:00.000`. `weekStart` defaults to `"sunday"`.

### `endOfWeek(date, weekStart?): Date`

Returns the last day of the containing week at `23:59:59.999`. `weekStart` defaults to `"sunday"`.

### `startOfMonth(date): Date`

Returns the 1st of the month at `00:00:00.000`.

### `endOfMonth(date): Date`

Returns the last day of the month at `23:59:59.999`.

### `startOfYear(date): Date`

Returns Jan 1 at `00:00:00.000`.

### `endOfYear(date): Date`

Returns Dec 31 at `23:59:59.999`.

#### Differences

Calendar differences ignore the time component, may be negative, and are DST-safe.

### `diffInCalendarDays(from, to): number`

Returns `to - from` in calendar days.

### `diffInCalendarMonths(from, to): number`

Returns `to - from` in whole calendar months.

### `diffInCalendarYears(from, to): number`

Returns `to - from` in whole calendar years.

#### Comparison

### `isBefore(date, other): boolean`

`true` when `date` is strictly before `other` (ms comparison).

### `isAfter(date, other): boolean`

`true` when `date` is strictly after `other` (ms comparison).

### `isSameMonth(a, b): boolean`

`true` when both dates share the year and month (day ignored).

### `isSameYear(a, b): boolean`

`true` when both dates share the year.

### `isWeekend(date): boolean`

`true` for Saturday or Sunday.

#### Week & year position

### `getISOWeek(date): number`

Returns the ISO 8601 week number (`1`–`53`; week 1 contains the first Thursday).

### `getWeekOfYear(date, weekStart?): number`

Returns the week number using the US convention — the week containing Jan 1 is week 1 (like `cal -w`). `weekStart` defaults to `"sunday"`.

### `getDayOfYear(date): number`

Returns the 1-based day of year (Jan 1 = `1`, Dec 31 = `365`/`366`).

#### Clamping

### `clampDate(date, min, max): Date`

Returns `date` clamped into `[min, max]`: `min` when earlier, `max` when later, otherwise the original `date`. All three dates are validated.

```ts
clampDate(new Date(2026, 8, 25), new Date(2026, 8, 1), new Date(2026, 8, 15)); // Sep 15 2026
```

#### Formatting

### `formatDate(date, pattern, locale?): string`

Formats a date with the given pattern. Tokens are replaced with localized values; everything else is output verbatim.

| Token | Meaning |
| :--- | :--- |
| `yyyy` | 4-digit year (`2026`) |
| `yy` | last 2 digits of the year (`26`) |
| `MMMM` | full month name (`September`, `9月`) |
| `MM` / `M` | zero-padded / plain month (`09` / `9`) |
| `dd` / `d` | zero-padded / plain day (`05` / `5`) |
| `EEE` | short weekday, localized (`Fri`, `金`) |

```ts
formatDate(date, "yyyy-MM-dd");          // "2026-09-25"
formatDate(date, "MMMM d, yyyy (EEE)");  // "September 25, 2026 (Fri)"
formatDate(date, "yyyy年M月d日", "ja");   // "2026年9月25日"
```

> **Note:** all of the above validate their inputs and throw `RangeError` on invalid values: dates are checked with `assertValidDate`, `add*` amounts must be integers, and `weekStart` must be `"sunday" | "monday"`.

## Input validation

All functions validate their inputs and throw `RangeError` on invalid values instead of silently producing wrong results:

| Input | Accepted range | Example of invalid input |
| :--- | :--- | :--- |
| `year` | integer `1`–`9999` | `0`, `-1`, `10000`, `2026.5`, `NaN` |
| `month` | integer `1`–`12` | `0`, `13`, `2.5`, `NaN` |
| `weekStart` | `"sunday"` \| `"monday"` | `"tuesday"` |
| `locale` | `"en"` \| `"ja"` \| `"es"` \| `"de"` \| `"fr"` \| `"ko"` \| `"zh"` | `"xx"` |
| `range` | `from <= to`, valid `Date`s | reversed or invalid dates |

> **Note:** `new Date(year, ...)` interprets years `0`–`99` as `1900 + year`. The library avoids this by using `setFullYear` internally (`createDate`), so `firstDayOfMonth(50, 9)` correctly returns the year `50` — but you still cannot pass year `0` or `10000`.

## Exports

```ts
// Types
import type {
  CalendarCellState,
  CalendarOptions,
  CalendarRangeOptions,
  CalendarYearOptions,
  DateRange,
  HighlightStyle,
  Locale,
  LocaleData,
  RenderMonthOptions,
  WeekStart,
} from "@typescript-calendar-lib/core";

// Values
import {
  LOCALES,
  MAX_YEAR,
  MIN_YEAR,
  addDays,
  addMonths,
  addWeeks,
  addYears,
  assertValidDate,
  buildMonthGrid,
  clampDate,
  createDate,
  daysInMonth,
  diffInCalendarDays,
  diffInCalendarMonths,
  diffInCalendarYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  firstDayOfMonth,
  formatDate,
  getCalendarCellState,
  getDayOfYear,
  getISOWeek,
  getLocaleData,
  getMonthName,
  getMonthRange,
  getWeekOfYear,
  getWeekdayHeaders,
  isAfter,
  isBefore,
  isDateInRange,
  isLeapYear,
  isSameDay,
  isSameMonth,
  isSameYear,
  isWeekend,
  lastDayOfMonth,
  sortRange,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "@typescript-calendar-lib/core";
```

## License

MIT