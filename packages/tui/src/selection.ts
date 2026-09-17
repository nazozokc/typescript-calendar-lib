import { getCursorDate } from "./cursor.ts";
import { findDateCell } from "./search.ts";
import type { CalendarState } from "./types.ts";

// ─── 日付選択 ────────────────────────────────────────────

/** カーソル位置の日付を選択する。空欄セル上では選択されない */
export function selectDate(state: CalendarState): CalendarState {
  const date = getCursorDate(state);
  if (date === null) return state;
  return { ...state, selectedDate: date };
}

/** 指定した日付のセルへカーソルを移し選択する。当月外なら状態を変えない */
export function selectDateAt(state: CalendarState, date: Date): CalendarState {
  const pos = findDateCell(state.monthData, date);
  if (pos === null) return state;
  return selectDate({ ...state, cursor: pos });
}

/** 選択中の日付を取得する。未選択なら null */
export function getSelectedDate(state: CalendarState): Date | null {
  return state.selectedDate;
}

/** 選択を解除する */
export function clearSelection(state: CalendarState): CalendarState {
  return { ...state, selectedDate: null };
}
