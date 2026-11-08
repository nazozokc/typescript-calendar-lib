<script lang="ts">
  import type { CalendarStateOptions } from "@typescript-calendar-lib/tui";
  import { useCalendarState } from "../src/useCalendarState.svelte.js";

  let {
    initialYear,
    initialMonth,
    year,
    month,
    onMonthChange,
    today,
    highlight,
    range,
    locale,
    weekStart,
    selectionMode,
  }: {
    initialYear?: number;
    initialMonth?: number;
    year?: number;
    month?: number;
    onMonthChange?: (year: number, month: number) => void;
    today?: Date;
    highlight?: Date;
    range?: { from: Date; to: Date };
    locale?: CalendarStateOptions["locale"];
    weekStart?: CalendarStateOptions["weekStart"];
    selectionMode?: CalendarStateOptions["selectionMode"];
  } = $props();

  let monthChange = $state("none");

  const cal = useCalendarState(() => ({
    initialYear,
    initialMonth,
    year,
    month,
    onMonthChange: (y: number, m: number) => {
      monthChange = `${y}-${m}`;
      onMonthChange?.(y, m);
    },
    today,
    highlight,
    range,
    locale,
    weekStart,
    selectionMode,
  }));

  const rangeCount = () =>
    cal.state.monthData.cells.flat().filter((c) => c.isInRange).length;
  const todayCell = () =>
    cal.state.monthData.cells.flat().find((c) => c.isToday)?.day ?? "none";
  const rangeText = () => {
    const r = cal.selectedRange;
    if (r === null) return "null";
    return `${r.from.toISOString()}→${r.to.toISOString()}`;
  };
</script>

<span data-testid="title">{cal.state.monthData.title}</span>
<span data-testid="cursor">{cal.cursorDate?.toISOString() ?? "null"}</span>
<span data-testid="selected">{cal.selectedDate?.toISOString() ?? "null"}</span>
<span data-testid="selected-range">{rangeText()}</span>
<span data-testid="hovered">{cal.hoveredDate?.toISOString() ?? "null"}</span>
<span data-testid="highlight">{cal.state.options.highlight?.toISOString() ?? "none"}</span>
<span data-testid="range-count">{rangeCount()}</span>
<span data-testid="today-cell">{String(todayCell())}</span>
<span data-testid="month-change">{monthChange}</span>
<button type="button" data-testid="next" onclick={cal.goNext}>Next</button>
<button type="button" data-testid="next-year" onclick={() => cal.navigateYear("next")}>NextYear</button>
<button type="button" data-testid="prev-year" onclick={() => cal.navigateYear("prev")}>PrevYear</button>
<button type="button" data-testid="goto" onclick={() => cal.goToMonth(2027, 3)}>GoTo</button>
<button type="button" data-testid="goto-date" onclick={() => cal.goToDate(new Date(2025, 0, 20))}>GoToDate</button>
<button type="button" data-testid="prev" onclick={cal.goPrev}>Prev</button>
<button type="button" data-testid="today" onclick={cal.goToday}>Today</button>
<button type="button" data-testid="right" onclick={() => cal.moveCursor("right")}>Right</button>
<button type="button" data-testid="select" onclick={cal.selectDate}>Select</button>
<button type="button" data-testid="clear" onclick={cal.clearSelection}>Clear</button>
<button type="button" data-testid="cursor-to" onclick={() => cal.setCursorToDate(new Date(2026, 8, 20))}>CursorTo</button>
<button type="button" data-testid="cursor-to-outside" onclick={() => cal.setCursorToDate(new Date(2026, 9, 1))}>CursorToOutside</button>
<button type="button" data-testid="select-at" onclick={() => cal.selectDateAt(new Date(2026, 8, 20))}>SelectAt</button>
<button type="button" data-testid="select-at-10" onclick={() => cal.selectDateAt(new Date(2026, 8, 10))}>SelectAt10</button>
<button type="button" data-testid="select-at-15" onclick={() => cal.selectDateAt(new Date(2026, 8, 15))}>SelectAt15</button>
<button type="button" data-testid="select-at-outside" onclick={() => cal.selectDateAt(new Date(2026, 9, 1))}>SelectAtOutside</button>
<button type="button" data-testid="hover" onclick={() => cal.setHoveredDate(new Date(2026, 8, 20))}>Hover</button>
<button type="button" data-testid="unhover" onclick={() => cal.setHoveredDate(null)}>Unhover</button>