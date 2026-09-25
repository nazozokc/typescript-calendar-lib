import {
  createDate,
  getCalendarCellState,
} from "@typescript-calendar-lib/core";
import type { CalendarCell, MonthDataOptions } from "./types.ts";

/** Build one cell from the core calendar state, keeping cell concerns out of month assembly. */
export function buildMonthCell<T>(
  year: number,
  month: number,
  day: number | null,
  dayOfWeek: number,
  options: MonthDataOptions<T>,
): CalendarCell<T> {
  if (day === null) {
    return {
      day: null,
      date: null,
      dayOfWeek,
      isCurrentMonth: false,
      isWeekend: false,
      isHoliday: false,
      isToday: false,
      isHighlight: false,
      isInRange: false,
      isDisabled: false,
    };
  }

  const date = createDate(year, month - 1, day);
  const state = getCalendarCellState(date, {
    today: options.today,
    holidayLocale: options.holidayLocale,
    highlight: options.highlight,
    range: options.range,
    isDateDisabled: options.isDateDisabled,
  });
  const cell: CalendarCell<T> = {
    day,
    date,
    dayOfWeek,
    isCurrentMonth: true,
    ...state,
  };
  const data = options.cellData?.(date);
  if (data !== undefined) cell.data = data;
  return cell;
}

/** Remove trailing rows that contain only padding cells. */
export function getVisibleRowCount<T>(cells: CalendarCell<T>[][]): number {
  let visibleRows = cells.length;
  while (
    visibleRows > 0 &&
    cells[visibleRows - 1]!.every((cell) => cell.day === null)
  ) {
    visibleRows--;
  }
  return visibleRows;
}
