# @typescript-calendar-lib/core

Shared, framework-agnostic calendar utilities: date math, locale data, and grid building. Zero runtime dependencies.

> **Tip:** You normally don't need `core` directly. The `cli`, `react`, `svelte`, and `tui` packages build on `core`, but each exposes only its own surface — reach for `core` directly when you want the date math, locale tables, or grid builder itself.

## Installation

```sh
pnpm add @typescript-calendar-lib/core
# or
npm install @typescript-calendar-lib/core
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
  holidayLocale?: Locale;   // default: "ja" (see Holidays)
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
  holidayLocale?: Locale; // default: "ja"
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
  holidayLocale?: Locale; // default: "ja"
  weekStart?: WeekStart;
  highlight?: Date;
  highlightStyle?: HighlightStyle;
  range?: { from: Date; to: Date };
  color?: boolean;
}
```

### `RenderMonthOptions`

Same as `CalendarOptions` minus `year`/`month`. Used by the low-level `renderMonth` helper.

### `CalendarCellState`

Flags computed by `getCalendarCellState` for a single day cell:

```ts
interface CalendarCellState {
  isWeekend: boolean;   // Saturday or Sunday
  isToday: boolean;     // matches `today`
  isHighlight: boolean; // matches `highlight`
  isInRange: boolean;   // within `range` (inclusive)
  isDisabled: boolean;  // matches `isDateDisabled`
}
```

### `LocaleData`

The shape of the per-locale data held in `LOCALES`:

```ts
interface LocaleData {
  months: readonly string[];
  weekdays: readonly string[];
  weekdaysShort: readonly string[];
  weekdaysMonday: readonly string[];
  weekdaysMondayShort: readonly string[];
}
```

## Constants

### `LOCALES`

```ts
const LOCALES: Record<Locale, LocaleData>;
```

Contains month names, weekday headers, and short weekday headers for each locale.

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

### `getCalendarCellState(date, options?): CalendarCellState`

Computes the display state of a single day cell (weekend, today, highlight, in-range, disabled):

```ts
const state = getCalendarCellState(new Date(2026, 8, 6), {
  today: new Date(2026, 8, 6),
  highlight: new Date(2026, 8, 6),
  range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 10) },
});
// { isWeekend: true, isToday: true, isHighlight: true, isInRange: true, isDisabled: false }
```

Pass `isDateDisabled` to mark specific dates as non-selectable. It is called once per cell with the cell's `Date`; returning `true` sets `isDisabled` (this is what the `tui`, `cli`, `react`, and `svelte` packages use to block selection/cursor movement):

```ts
const state = getCalendarCellState(new Date(2026, 8, 15), {
  isDateDisabled: (date) => date.getDay() === 0, // disable Sundays
});
// state.isDisabled === true
```

With no options every flag is `false` (except `isWeekend`, which is derived from the date itself). Throws `RangeError` when `date` is invalid.

### `isLeapYear(year): boolean`

Returns `true` for Gregorian leap years (divisible by 4, except by 100 unless also by 400):

```ts
isLeapYear(2024); // true
isLeapYear(1900); // false
isLeapYear(2000); // true
```

Works for years `1`–`99` too (no 1900-interpretation). Throws `RangeError` for out-of-range or non-integer years.

### `daysInMonth(year, month): number`

Returns the number of days in the month (`28`–`31`):

```ts
daysInMonth(2026, 2); // 28
daysInMonth(2024, 2); // 29 (leap year)
daysInMonth(2026, 4); // 30
```

Throws `RangeError` for invalid `year`/`month`.


## Holidays

`core` ships a complete Japanese holiday table — fixed-date holidays, happy-Monday
rules, and the equinox-based `春分の日` / `秋分の日` approximations — plus the
2019/2020/2021 reforms and the pre-1973 fixed-date rules.

```ts
import { getHolidayName, isHoliday } from "@typescript-calendar-lib/core";

isHoliday(new Date(2026, 4, 4));        // true
getHolidayName(new Date(2026, 4, 4));   // "みどりの日"
isHoliday(new Date(2026, 4, 6));        // true
getHolidayName(new Date(2026, 4, 6));   // "振替休日"  (happy-Monday rule)
isHoliday(new Date(2026, 8, 22));        // true
getHolidayName(new Date(2026, 8, 22));   // "国民の休日"
isHoliday(new Date(2026, 8, 24));        // false
getHolidayName(new Date(2026, 8, 24));   // undefined
```

> **Note:** `holidayLocale` defaults to `"ja"` — *independently of `locale`*. Calling
> `isHoliday(date)` with no arguments answers the **Japanese** calendar question, so an
> `locale: "en"` calendar still flags Japanese holidays. Pass `holidayLocale` explicitly
> if that is not what you want.

Rules are implemented for `HOLIDAY_MIN_YEAR` (`1949`) through `HOLIDAY_MAX_YEAR`
(`2100`). Outside that window the functions report "no holiday" rather than throwing.
Only `"ja"` has a rule table today: any other `holidayLocale` behaves as "no holidays",
which lets a caller opt out explicitly instead of relying on the default.

### Business days

```ts
import { addBusinessDays, diffInBusinessDays, isBusinessDay } from "@typescript-calendar-lib/core";

isBusinessDay(new Date(2026, 8, 5));                                  // false — Saturday
addBusinessDays(new Date(2026, 8, 4), 1);                            // Mon Sep 7 2026
diffInBusinessDays(new Date(2026, 8, 4), new Date(2026, 8, 7));     // 1
```

A business day is a day that is neither a weekend nor a holiday under `holidayLocale`.
All three take an optional trailing `holidayLocale`.

## Input validation

All functions validate their inputs and throw `RangeError` on invalid values instead of silently
producing wrong results:

| Input | Accepted range | Example of invalid input |
| :--- | :--- | :--- |
| `year` | integer `1`–`9999` | `0`, `-1`, `10000`, `2026.5`, `NaN` |
| `month` | integer `1`–`12` | `0`, `13`, `2.5`, `NaN` |
| `weekStart` | `"sunday"` \| `"monday"` | `"tuesday"` |
| `locale` | `"en"` \| `"ja"` \| `"es"` \| `"de"` \| `"fr"` \| `"ko"` \| `"zh"` | `"xx"` |
| `range` | `from <= to`, valid `Date`s | reversed or invalid dates |

> **Note:** `new Date(year, ...)` interprets years `0`–`99` as `1900 + year`. The library avoids
> this by using `setFullYear` internally (`createDate`), so `firstDayOfMonth(50, 9)` correctly
> returns the year `50` — but you still cannot pass year `0` or `10000`.

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
  HOLIDAY_MAX_YEAR,
  HOLIDAY_MIN_YEAR,
  LOCALES,
  MAX_YEAR,
  MIN_YEAR,
  addBusinessDays,
  addDays,
  addMonths,
  addWeeks,
  addYears,
  assertValidDate,
  buildMonthGrid,
  clampDate,
  createDate,
  daysInMonth,
  diffInBusinessDays,
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
  getHolidayName,
  getISOWeek,
  getLocaleData,
  getMonthName,
  getMonthRange,
  getWeekOfYear,
  getWeekdayHeaders,
  isAfter,
  isBefore,
  isBusinessDay,
  isDateInRange,
  isHoliday,
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

### `createDate(year, monthIndex, day): Date`

Creates a local `Date` at `00:00:00` without the `new Date(year, ...)` 1900-interpretation for
years `0`–`99`. `monthIndex` is 0-based like `Date`.

`year` must be an integer `1`–`9999`, `monthIndex` an integer `0`–`12`, and `day` an integer
`0`–`31`. `monthIndex 12` rolls to January of the following year, and `day 0` means the last day
of the previous month (the internal idiom used by `lastDayOfMonth`); a `day` beyond the end of
the month rolls over to the next month — all exactly like `new Date`. Anything else throws
`RangeError`.

### `assertValidDate(date): void`

Throws `RangeError` when `date` is not a `Date` instance or is an `Invalid Date`.

### `MIN_YEAR` / `MAX_YEAR`

The supported year range (`1` / `9999`). Values outside this range are rejected by validation.

### `HOLIDAY_MIN_YEAR` / `HOLIDAY_MAX_YEAR`

The year range for which holiday rules are implemented (`1949` / `2100`). Outside that
range the holiday functions report "no holiday" rather than throwing — see
[Holidays](#holidays).