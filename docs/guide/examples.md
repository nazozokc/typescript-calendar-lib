# Examples & Recipes

Copy-paste patterns for the most common calendar UIs. Every snippet uses the
public API and is safe to drop into a TypeScript project.

## Single date picker

`InteractiveCalendar` manages cursor, selection, hover, and keyboard handling
for you. Read the picked date from `onDateClick`.

```tsx
import { useState } from "react";
import { InteractiveCalendar } from "@typescript-calendar-lib/react";
import "@typescript-calendar-lib/react/calendar.css";

export function DatePicker() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div>
      <InteractiveCalendar
        initialYear={2026}
        initialMonth={9}
        onDateClick={(picked) => setDate(picked)}
      />
      <p>{date ? date.toDateString() : "Pick a date"}</p>
    </div>
  );
}
```

```svelte
<script lang="ts">
  import { InteractiveCalendar } from "@typescript-calendar-lib/svelte";
  import "@typescript-calendar-lib/svelte/calendar.css";

  let selected = $state<Date | null>(null);
</script>

<InteractiveCalendar
  initialYear={2026}
  initialMonth={9}
  onDateClick={(date) => (selected = date)}
/>
<p>{selected ? selected.toDateString() : "Pick a date"}</p>
```

## Month navigation header

Build your own header with the `useCalendarState` hook. The hook owns the
displayed month, cursor, and selection.

```tsx
import { Calendar, useCalendarState } from "@typescript-calendar-lib/react";
import "@typescript-calendar-lib/react/calendar.css";

export function MonthView() {
  const cal = useCalendarState({ initialYear: 2026, initialMonth: 9 });

  return (
    <section>
      <header>
        <button type="button" onClick={cal.goPrev} aria-label="Previous month">
          ‹
        </button>
        <h2>{cal.state.monthData.title}</h2>
        <button type="button" onClick={cal.goNext} aria-label="Next month">
          ›
        </button>
        <button type="button" onClick={cal.goToday}>
          Today
        </button>
      </header>

      <Calendar
        year={cal.state.year}
        month={cal.state.month}
        selectedDate={cal.selectedDate}
        cursorDate={cal.cursorDate}
        interactive
        onDateClick={cal.selectDateAt}
        onDateHover={cal.setHoveredDate}
      />
    </section>
  );
}
```

Pass `onMonthChange` to `useCalendarState` if the surrounding app needs to know
when the visible month changes.

## Range picker

Use `selectionMode: "range"` for a two-click anchor → range flow. With the raw
hook, read the committed range from `selectedRange`.

```tsx
import { Calendar, useCalendarState } from "@typescript-calendar-lib/react";
import "@typescript-calendar-lib/react/calendar.css";

export function RangePicker() {
  const cal = useCalendarState({
    initialYear: 2026,
    initialMonth: 9,
    selectionMode: "range",
  });

  return (
    <div>
      <Calendar
        year={cal.state.year}
        month={cal.state.month}
        range={cal.selectedRange ?? undefined}
        selectedDate={cal.selectedDate}
        interactive
        onDateClick={cal.selectDateAt}
        onDateHover={cal.setHoveredDate}
      />
      <p>
        {cal.selectedRange
          ? `${cal.selectedRange.from.toDateString()} → ${cal.selectedRange.to.toDateString()}`
          : "Pick a start date"}
      </p>
    </div>
  );
}
```

`InteractiveCalendar selectionMode="range"` additionally shows the hover
preview and handles the anchor → commit → reset cycle internally. Use it when
you only need the final picks via `onDateClick`.

## Booking availability

`isDateDisabled` runs for every real date. Disabled cells cannot be clicked or
focused, and the keyboard cursor skips them.

```tsx
import { InteractiveCalendar } from "@typescript-calendar-lib/react";
import "@typescript-calendar-lib/react/calendar.css";

const firstBookableDay = new Date(2026, 8, 1);

export function BookingCalendar() {
  return (
    <InteractiveCalendar
      initialYear={2026}
      initialMonth={9}
      isDateDisabled={(date) =>
        date < firstBookableDay || date.getDay() === 0 || date.getDay() === 6
      }
      onDateClick={(date) => console.log("Booking", date)}
    />
  );
}
```

The same predicate works in the CLI and TUI layers, so the rules stay in one
place:

```ts
const isDateDisabled = (date: Date) => date.getDay() === 0;

calendar({ year: 2026, month: 9, isDateDisabled, color: true });
buildMonthData(2026, 9, { isDateDisabled });
```

## Custom cell content

Use `cellData` to attach data to dates and `renderCell` to control what the cell
shows. `renderCell` receives `(day, date, state, data)`.

```tsx
import { Calendar } from "@typescript-calendar-lib/react";
import "@typescript-calendar-lib/react/calendar.css";

const events = new Map<number, number>([
  [3, 2],
  [8, 1],
  [15, 4],
]);

export function EventCalendar() {
  return (
    <Calendar
      year={2026}
      month={9}
      cellData={(date) => events.get(date.getDate())}
      renderCell={(day, _date, _state, count) =>
        count ? `${day}·${count}` : String(day)
      }
    />
  );
}
```

In Svelte, `renderCell` returns a string, which is inserted as plain text:

```svelte
<Calendar
  year={2026}
  month={9}
  cellData={(date) => events.get(date.getDate())}
  renderCell={(day, _date, _state, count) =>
    count ? `${day}·${count}` : String(day)}
/>
```

## Terminal report

The CLI package returns a string, so it composes with any output pipeline.

```ts
import { calendar } from "@typescript-calendar-lib/cli";

const report = calendar({
  year: 2026,
  month: 9,
  locale: "ja",
  weekStart: "monday",
  showWeekNumbers: true,
  highlight: new Date(2026, 8, 15),
  color: process.stdout.isTTY === true,
});

process.stdout.write(report);
```

Pipe it to a file without escape codes (colors are off when stdout is not a
TTY):

```sh
typescript-calendar-lib 2026 9 > september.txt
```

## Headless TUI grid

`buildMonthData` gives you rows, weekday labels, and per-cell metadata without
rendering anything.

```ts
import { buildMonthData } from "@typescript-calendar-lib/tui";

const data = buildMonthData(2026, 9, {
  weekStart: "monday",
  today: new Date(2026, 8, 15),
});

console.log(data.title);
console.log(data.weekdays.join(" "));

for (const row of data.cells.slice(0, data.visibleRows)) {
  console.log(
    row
      .map((cell) => (cell.day === null ? "  " : String(cell.day).padStart(2)))
      .join(" "),
  );
}
```

Each cell exposes `isToday`, `isWeekend`, `isHoliday`, `isHighlight`,
`isInRange`, `isDisabled`, and optional custom `data`. Use the immutable state
machine (`createCalendarState`, `moveCursor`, `selectDate`) when you need
navigation and selection too.

## Server-side rendering

Both web components render without browser globals. See the package guides for
framework-specific boundaries:

- [React: Server-side rendering](/packages/react#server-side-rendering)
- [Svelte: Server-side rendering](/packages/svelte#server-side-rendering)

## Where to go next

- [Theming & Styling](/guide/theming) — colors, sizes, and cell classes
- [Accessibility](/guide/accessibility) — keyboard and screen-reader behavior
- [Interactive Demo](/guide/interactive-demo) — full mouse and keyboard wiring
