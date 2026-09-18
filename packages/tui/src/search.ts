import { isSameDay } from "@typescript-calendar-lib/core";
import type { CalendarCell, CalendarState, MonthData } from "./types.ts";

// ─── セル検索 ────────────────────────────────────────────

type CellPos = { row: number; col: number } | null;

/** 月データを行優先で走査し、条件に一致する最初のセル位置を返す */
function findCell<T>(
  monthData: MonthData<T>,
  match: (cell: CalendarCell<T>) => boolean,
): CellPos {
  for (let row = 0; row < monthData.cells.length; row++) {
    const col = monthData.cells[row]!.findIndex(match);
    if (col !== -1) return { row, col };
  }
  return null;
}

/** 月データから「今日」のセル位置を探す。選択不可の日付は対象外。なければ null */
export function findTodayCell<T>(monthData: MonthData<T>): CellPos {
  return findCell(monthData, (c) => c.isToday && !c.isDisabled);
}

/** 月データから指定日付のセル位置を探す。選択不可でも位置は返す（呼び出し側が判断）。なければ null */
export function findDateCell<T>(monthData: MonthData<T>, date: Date): CellPos {
  return findCell(monthData, (c) => c.date !== null && isSameDay(c.date, date));
}

/** 月データから最初の日付セルを探す。選択不可の日付は対象外 */
export function findFirstDayCell<T>(monthData: MonthData<T>): CellPos {
  return findCell(monthData, (c) => c.day !== null && !c.isDisabled);
}

// ─── データ取得 ──────────────────────────────────────────

/** 指定日付に付与されたユーザー定義データを取得する。当月に日付が無ければ undefined */
export function getDateData<T>(
  state: CalendarState<T>,
  date: Date,
): T | undefined {
  const pos = findDateCell(state.monthData, date);
  if (pos === null) return undefined;
  return state.monthData.cells[pos.row]![pos.col]!.data;
}
