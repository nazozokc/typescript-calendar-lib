import { buildMonthData } from "./month-data.ts";
import { resolveOptions } from "./options.ts";
import { rebuildState } from "./state.ts";
import type {
  CalendarState,
  CalendarStateOptions,
  ResolvedOptions,
} from "./types.ts";

function sameDateValue(a: Date | undefined, b: Date | undefined): boolean {
  return (a?.getTime() ?? -1) === (b?.getTime() ?? -1);
}

/** Compare public options by value so inline Date/object values are safe. */
export function sameStateOptions<T>(
  a: CalendarStateOptions<T>,
  b: CalendarStateOptions<T>,
): boolean {
  return (
    a.initialYear === b.initialYear &&
    a.initialMonth === b.initialMonth &&
    a.locale === b.locale &&
    a.weekStart === b.weekStart &&
    sameDateValue(a.today, b.today) &&
    sameDateValue(a.highlight, b.highlight) &&
    sameDateValue(a.range?.from, b.range?.from) &&
    sameDateValue(a.range?.to, b.range?.to) &&
    a.isDateDisabled === b.isDateDisabled &&
    a.cellData === b.cellData
  );
}

/** Rebuild state while preserving navigation-only state when options change. */
export function updateStateOptions<T>(
  state: CalendarState<T>,
  next: CalendarStateOptions<T>,
  previous: CalendarStateOptions<T>,
): CalendarState<T> {
  const options: ResolvedOptions<T> = resolveOptions<T>({
    today: next.today ?? state.options.today,
    locale: next.locale ?? state.options.locale,
    weekStart: next.weekStart ?? state.options.weekStart,
    highlight: next.highlight,
    range: next.range,
    isDateDisabled: next.isDateDisabled,
    cellData: next.cellData ?? state.options.cellData,
  });
  const year =
    next.initialYear !== undefined && next.initialYear !== previous.initialYear
      ? next.initialYear
      : state.year;
  const month =
    next.initialMonth !== undefined &&
    next.initialMonth !== previous.initialMonth
      ? next.initialMonth
      : state.month;
  const monthData = buildMonthData(year, month, options);
  return rebuildState(
    year,
    month,
    state.cursor,
    state.selectedDate,
    options,
    monthData,
  );
}
