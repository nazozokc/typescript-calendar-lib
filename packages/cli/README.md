# @typescript-calendar-lib/cli

Render month, year, or date-range calendars as plain text — with optional ANSI colors, themes, and color schemes. Includes a command-line binary.

## Installation

```sh
pnpm add @typescript-calendar-lib/cli
# or
npm install @typescript-calendar-lib/cli
# or
bun add @typescript-calendar-lib/cli
```

## Rendering API

### `calendar(options: CalendarOptions): string`

Render a single month:

```ts
import { calendar } from "@typescript-calendar-lib/cli";

console.log(calendar({ year: 2026, month: 9 }));
```

```
      September 2026
Sun Mon Tue Wed Thu Fri Sat
          1   2   3   4   5
  6   7   8   9  10  11  12
 13  14  15  16  17  18  19
 20  21  22  23  24  25  26
 27  28  29  30
```

### `calendarYear(options: CalendarYearOptions): string`

Render a full year as a 4 columns × 3 rows grid:

```ts
console.log(calendarYear({ year: 2026 }));
```

### `calendarRange(options: CalendarRangeOptions): string`

Render every month from `from` to `to` (inclusive), each on its own block:

```ts
console.log(calendarRange({
  from: new Date(2026, 5, 1),
  to: new Date(2026, 8, 30),
}));
```

### Options

All options from `@typescript-calendar-lib/core` are supported, plus these CLI-specific extras:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `theme` | `ThemeName \| CliTheme` | `"default"` | Visual theme (`"default"` \| `"modern"`) or custom theme object |
| `colorScheme` | `ColorSchemeName \| CliPalette` | `"default"` | Color scheme, active when `color: true` |
| `today` | `Date` | `new Date()` | Reference date for "today" coloring |

## CLI Binary

The package ships a `typescript-calendar-lib` binary:

```sh
typescript-calendar-lib                       # current month
typescript-calendar-lib 2026                  # current month of 2026
typescript-calendar-lib 2026 9                # September 2026
typescript-calendar-lib --year                # current year as a 4×3 grid
typescript-calendar-lib 2026 --year           # 2026 as a 4×3 grid
typescript-calendar-lib --range 2026-01-01 2026-03-31  # months in a date range
```

### Options

```
--theme <name>           Look: default | modern (default: default)
--color-scheme <name>    Colors: default | ocean | forest | sunset | mono
--color                  Enable ANSI colors (auto-detected for TTY)
--no-color               Disable ANSI colors
--locale <lang>          Language: en | ja | es | de | fr | ko | zh (default: en)
--week-start <day>       First weekday: sunday | monday (default: sunday)
--highlight <YYYY-MM-DD> Highlight a date (e.g. 2026-09-08)
--highlight-style <style> Highlight style: bracket | reverse (default: bracket)
--today <YYYY-MM-DD>     Override today (marks the date, defaults year/month)
--year                   Render the whole year as a 4×3 grid
--range <FROM> <TO>      Render months from FROM to TO (YYYY-MM-DD)
-v, --version            Show version
-h, --help               Show this help
```

### Color detection

Colors are enabled automatically when stdout is a TTY, and disabled when piped or redirected. `--color` and `--no-color` override the detection; `NO_COLOR` and `FORCE_COLOR` environment variables are also respected (explicit flags always win).

Example with `modern` theme and `ocean` color scheme:

```sh
typescript-calendar-lib 2026 9 --theme modern --color-scheme ocean --color
```

Localized, Monday-start, with a highlighted date:

```sh
typescript-calendar-lib 2026 9 --locale ja --week-start monday --highlight 2026-09-08
```

## Themes

### `ThemeName`

```ts
type ThemeName = "default" | "modern";
```

- **`"default"`** — plain text, space-separated cells, no frame
- **`"modern"`** — box-drawing frame (`┌───┬───┐` style)

### `CliTheme`

Custom themes are plain objects:

```ts
import type { CliTheme } from "@typescript-calendar-lib/cli";

const myTheme: CliTheme = {
  cellWidth: 4,
  separator: " | ",
  frame: null, // or a FrameChars object for bordered layout
};
```

| Property | Type | Description |
| :--- | :--- | :--- |
| `cellWidth` | `number` | Width of each date cell |
| `separator` | `string` | Separator between cells |
| `frame` | `FrameChars \| null` | Frame characters, or `null` for no frame |

### `FrameChars`

```ts
interface FrameChars {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  h: string;      // horizontal line
  v: string;      // vertical line
  j: string;      // header/body intersection (┬, ┼)
  footJ: string;  // bottom intersection (┴)
}
```

The built-in `"modern"` theme uses `┌ ┐ └ ┘ ─ │ ┬ ┴`.

### `THEMES`

```ts
const THEMES: Record<ThemeName, CliTheme>;
```

### `resolveTheme(theme?)`

Resolves a `ThemeName | CliTheme` to a `CliTheme` (defaults to `"default"`).

## Color Schemes

### `ColorSchemeName`

```ts
type ColorSchemeName = "default" | "ocean" | "forest" | "sunset" | "mono";
```

- **`"default"`** — colors range (yellow) and highlight (reverse) only
- **`"ocean"`** — cyan/blue palette
- **`"forest"`** — green palette
- **`"sunset"`** — magenta/orange palette
- **`"mono"`** — grayscale

### `CliPalette`

Each field is an ANSI foreground color code (or background code for highlight). `undefined` means "no coloring":

```ts
interface CliPalette {
  title?: number;
  weekday?: number;
  day?: number;
  weekend?: number;
  today?: number;
  highlight?: number; // used with highlightStyle: "reverse"
  range?: number;
  frame?: number;
  dim?: number;
}
```

A custom palette can be passed directly:

```ts
calendar({
  year: 2026,
  month: 9,
  color: true,
  colorScheme: { title: 36, range: 33, today: 33 },
});
```

### `COLOR_SCHEMES` and `resolveColorScheme(scheme?)`

Predefined schemes and the resolver (defaults to `"default"`).

## Examples

### Highlight today

```ts
calendar({
  year: 2026,
  month: 9,
  highlight: new Date(2026, 8, 8),
  highlightStyle: "bracket", // [8]
});
```

Reverse-video highlight requires `color: true`:

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

```ts
calendar({
  year: 2026,
  month: 9,
  range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) },
  color: true,
});
```

When a date is both highlighted and in range, the highlight takes precedence.

### Plain text output

By default (`color: false`) the output contains no ANSI escape codes, so it's safe to pipe into files or other tools:

```sh
typescript-calendar-lib 2026 9 > september.txt
```

Colors are disabled automatically when stdout is not a TTY, so piping works without extra flags.

## Exports

```ts
import {
  calendar,
  calendarRange,
  calendarYear,
  COLOR_SCHEMES,
  resolveColorScheme,
  resolveTheme,
  THEMES,
} from "@typescript-calendar-lib/cli";

import type {
  CalendarOptions,
  CalendarRangeOptions,
  CalendarYearOptions,
  CliPalette,
  CliTheme,
  ColorSchemeName,
  FrameChars,
  RenderMonthOptions,
  ThemeName,
} from "@typescript-calendar-lib/cli";
```

## License

MIT