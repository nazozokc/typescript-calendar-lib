# Getting Started

## Installation

```sh
# pnpm
pnpm add @typescript-calendar-lib/cli

# npm
npm install @typescript-calendar-lib/cli

# bun
bun add @typescript-calendar-lib/cli
```

Replace `cli` with the package you need: `core`, `cli`, `react`, `svelte`, or `tui`.

## Quick Start

### Plain Text (CLI package)

```ts
import { calendar, calendarYear, calendarRange } from "@typescript-calendar-lib/cli";

// Single month
console.log(calendar({ year: 2026, month: 9 }));

// Full year (4 columns × 3 rows)
console.log(calendarYear({ year: 2026 }));

// Arbitrary date range
console.log(calendarRange({
  from: new Date(2026, 5, 1),
  to: new Date(2026, 8, 30),
}));
```

Output:

```
      September 2026
Sun Mon Tue Wed Thu Fri Sat
          1   2   3   4   5
  6   7   8   9  10  11  12
 13  14  15  16  17  18  19
 20  21  22  23  24  25  26
 27  28  29  30
```

Locales: `en`, `ja`, `es`, `de`, `fr`, `ko`, `zh`

```ts
calendar({ year: 2026, month: 9, locale: "es", weekStart: "monday" });
```

### React Component

```tsx
import { Calendar } from "@typescript-calendar-lib/react";

function App() {
  return <Calendar year={2026} month={9} colorScheme="ocean" />;
}
```

For interactivity (click, hover, cursor, month navigation), see the [Interactive Demo](/guide/interactive-demo).

### TUI (Headless)

```ts
import { createCalendarState, moveCursor, navigateMonth } from "@typescript-calendar-lib/tui";

const state = createCalendarState({ year: 2026, month: 9 });
const moved = moveCursor(state, "right");
const nextMonth = navigateMonth(state, "next");
```

## Package Overview

| Package | Description |
| :--- | :--- |
| [`core`](/packages/core) | Shared utilities: date math, locale data, grid building |
| [`cli`](/packages/cli) | Plain-text rendering with themes and ANSI colors |
| [`react`](/packages/react) | `<Calendar />` React component with CSS themes |
| [`tui`](/packages/tui) | Headless state & data for building TUI calendars |

## Dependency Graph

```
core (zero dependencies)
 ├── cli   (+ cli-table3)
 ├── react (+ react peer)
 └── tui   (zero extra deps)
```

All packages depend on `@typescript-calendar-lib/core`. You can use any package independently, or compose them together.

## TypeScript

All options and return types are fully exported:

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

## Development

```sh
git clone https://github.com/nazozokc/typescript-calendar-lib.git
cd typescript-calendar-lib
pnpm install
pnpm test
```
