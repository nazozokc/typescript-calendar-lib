import {
  assertValidDate,
  MAX_YEAR,
  MIN_YEAR,
} from "@typescript-calendar-lib/core";
import { buildMonthData } from "./month-data.ts";
import { shiftMonth } from "./month-math.ts";
import { findDateCell, findFirstDayCell, findTodayCell } from "./search.ts";
import { rebuildState } from "./state.ts";
import type { CalendarState, MonthData, MonthDirection } from "./types.ts";

// ─── 年月の算術 ───────────────────────────────────────────

/**
 * year/month を delta ヶ月ずらす（月跨ぎ・年跨ぎを正規化）。
 *
 * 詳細な挙動は month-math.ts を参照。年は MIN_YEAR..MAX_YEAR にクランプされる。
 */
export { shiftMonth };

// ─── 公開API ─────────────────────────────────────────────

type LocateDate = (data: MonthData) => { row: number; col: number } | null;

/** カーソル/選択/オプションを保って年月で状態を再構築する */
function withMonth<T>(
  state: CalendarState<T>,
  year: number,
  month: number,
): CalendarState<T> {
  return rebuildState<T>(
    year,
    month,
    state.cursor,
    state.selectedDate,
    state.options,
    undefined,
    state.selectedRange,
  );
}

/** 月データを構築してカーソルを置き、状態を再構築する */
function jumpTo<T>(
  state: CalendarState<T>,
  year: number,
  month: number,
  locate: LocateDate,
): CalendarState<T> {
  const data = buildMonthData<T>(year, month, state.options);
  return rebuildState<T>(
    year,
    month,
    locate(data),
    state.selectedDate,
    state.options,
    data,
    state.selectedRange,
  );
}

/** 前月/翌月へ移動する（カーソルは新しい月の範囲にクランプされる） */
export function navigateMonth<T>(
  state: CalendarState<T>,
  direction: MonthDirection,
): CalendarState<T> {
  const { year, month } = shiftMonth(
    state.year,
    state.month,
    direction === "next" ? 1 : -1,
  );
  return withMonth<T>(state, year, month);
}

/** 前年/翌年へ移動する（サポート範囲の端では移動しない） */
export function navigateYear<T>(
  state: CalendarState<T>,
  direction: MonthDirection,
): CalendarState<T> {
  const year = state.year + (direction === "next" ? 1 : -1);
  if (year < MIN_YEAR || year > MAX_YEAR) return state;
  return withMonth<T>(state, year, state.month);
}

/** 指定した年月へジャンプする。month は正規化される（例: 13 → 翌年1月） */
export function goToMonth<T>(
  state: CalendarState<T>,
  year: number,
  month: number,
): CalendarState<T> {
  return withMonth<T>(state, year, month);
}

/** 指定した日付の月へジャンプし、カーソルをその日付のセルに置く。選択不可の日付なら状態を変えない */
export function goToDate<T>(
  state: CalendarState<T>,
  date: Date,
): CalendarState<T> {
  assertValidDate(date);
  const data = buildMonthData<T>(
    date.getFullYear(),
    date.getMonth() + 1,
    state.options,
  );
  const pos = findDateCell(data, date);
  // クランプ後も日付が存在する場合は選択不可チェックをする
  if (pos !== null) {
    const cell = data.cells[pos.row]![pos.col]!;
    if (cell.isDisabled) return state;
  }
  return rebuildState<T>(
    date.getFullYear(),
    date.getMonth() + 1,
    pos,
    state.selectedDate,
    state.options,
    data,
    state.selectedRange,
  );
}

/** 今日の月へジャンプし、カーソルを今日のセルに置く。今日が選択不可なら最初の有効セルに置く */
export function goToToday<T>(state: CalendarState<T>): CalendarState<T> {
  const { today } = state.options;
  return jumpTo<T>(
    state,
    today.getFullYear(),
    today.getMonth() + 1,
    (data) => findTodayCell(data) ?? findFirstDayCell(data),
  );
}
