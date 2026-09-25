import type { DateRange } from "@typescript-calendar-lib/core";
import { sortRange } from "@typescript-calendar-lib/core";
import { findDateCell } from "./search.ts";
import type { CalendarState, SelectionMode } from "./types.ts";

// ─── 日付選択 ────────────────────────────────────────────

/** single 方式: 選択日付を更新して範囲をクリアする */
function selectSingle<T>(
  state: CalendarState<T>,
  date: Date,
): CalendarState<T> {
  return { ...state, selectedDate: date, selectedRange: null };
}

/**
 * range 方式: 選択を交互に「アンカー」と「範囲確定」として扱う。
 *
 * - アンカーなし（selectedDate が null）: この日付をアンカーにする
 * - アンカーあり（selectedDate のみ）: アンカーとこの日付の間を確定範囲にする
 * - 範囲確定済み: この日付を新しいアンカーとして範囲をクリアする
 */
function selectRangeMode<T>(
  state: CalendarState<T>,
  date: Date,
): CalendarState<T> {
  if (state.selectedRange !== null || state.selectedDate === null) {
    return { ...state, selectedDate: date, selectedRange: null };
  }
  return {
    ...state,
    selectedDate: date,
    selectedRange: sortRange(state.selectedDate, date) ?? null,
  };
}

/** 日付を選択する（選択方式は state.options.selectionMode に従う） */
function pickDate<T>(
  state: CalendarState<T>,
  date: Date,
  mode: SelectionMode,
): CalendarState<T> {
  return mode === "range"
    ? selectRangeMode(state, date)
    : selectSingle(state, date);
}

/** カーソル位置の日付を選択する。空欄セル・選択不可セル上では選択されない */
export function selectDate<T>(state: CalendarState<T>): CalendarState<T> {
  if (state.cursor === null) return state;
  const cell = state.monthData.cells[state.cursor.row]?.[state.cursor.col];
  if (cell?.date === null || cell?.date === undefined) return state;
  if (cell.isDisabled) return state;
  return pickDate(state, cell.date, state.options.selectionMode);
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
  const selected = pickDate(state, date, state.options.selectionMode);
  return { ...selected, cursor: pos };
}

/** 範囲を直接指定して選択する（from/to は自動で整列される）。選択方式に関係なく設定できる */
export function selectRange<T>(
  state: CalendarState<T>,
  from: Date,
  to: Date,
): CalendarState<T> {
  const range = sortRange(from, to);
  if (range === undefined) return state;
  return { ...state, selectedDate: range.to, selectedRange: range };
}

/** 選択中の日付を取得する。未選択なら null（range 方式では最後に選択された日付） */
export function getSelectedDate<T>(state: CalendarState<T>): Date | null {
  return state.selectedDate;
}

/** 確定した選択範囲を取得する。未確定（アンカーのみ・未選択）なら null */
export function getSelectedRange<T>(state: CalendarState<T>): DateRange | null {
  return state.selectedRange;
}

/** 選択を解除する（範囲選択もクリアされる） */
export function clearSelection<T>(state: CalendarState<T>): CalendarState<T> {
  return { ...state, selectedDate: null, selectedRange: null };
}
