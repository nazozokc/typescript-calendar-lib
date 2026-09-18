import { findDateCell } from "./search.ts";
import type { CalendarState } from "./types.ts";

// ─── 日付選択 ────────────────────────────────────────────

/** カーソル位置の日付を選択する。空欄セル・選択不可セル上では選択されない */
export function selectDate<T>(state: CalendarState<T>): CalendarState<T> {
  if (state.cursor === null) return state;
  const cell = state.monthData.cells[state.cursor.row]?.[state.cursor.col];
  if (cell?.date === null || cell?.date === undefined) return state;
  if (cell.isDisabled) return state;
  return { ...state, selectedDate: cell.date };
}

/** 指定した日付のセルへカーソルを移し選択する。当月外・選択不可の日付なら状態を変えない */
export function selectDateAt<T>(
  state: CalendarState<T>,
  date: Date,
): CalendarState<T> {
  const pos = findDateCell(state.monthData, date);
  if (pos === null) return state;
  const cell = state.monthData.cells[pos.row]![pos.col]!;
  if (cell.isDisabled) return state;
  return selectDate({ ...state, cursor: pos });
}

/** 選択中の日付を取得する。未選択なら null */
export function getSelectedDate<T>(state: CalendarState<T>): Date | null {
  return state.selectedDate;
}

/** 選択を解除する */
export function clearSelection<T>(state: CalendarState<T>): CalendarState<T> {
  return { ...state, selectedDate: null };
}
