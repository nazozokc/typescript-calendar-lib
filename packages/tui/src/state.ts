import { clampCursor } from "./cursor.ts";
import { buildMonthData } from "./month-data.ts";
import { shiftMonth } from "./month-math.ts";
import { resolveOptions } from "./options.ts";
import { findFirstDayCell, findTodayCell } from "./search.ts";
import type {
  CalendarState,
  CalendarStateOptions,
  MonthData,
  ResolvedOptions,
} from "./types.ts";

// ─── 状態生成 ────────────────────────────────────────────

/**
 * カレンダー状態を初期化する。
 *
 * カーソルはデフォルトで「今日」のセル、今日が当月に無ければ最初の日付セルに置かれる。
 * `initialYear`/`initialMonth` は shiftMonth で正規化される（例: month=13 → 翌年1月）。
 */
export function createCalendarState<T>(
  options: CalendarStateOptions<T> = {},
): CalendarState<T> {
  const resolved = resolveOptions<T>(options);
  const { year, month } = shiftMonth(
    options.initialYear ?? resolved.today.getFullYear(),
    options.initialMonth ?? resolved.today.getMonth() + 1,
    0,
  );

  const monthData = buildMonthData<T>(year, month, resolved);
  const cursor = clampCursor(
    options.initialCursor ??
      findTodayCell(monthData) ??
      findFirstDayCell(monthData),
    monthData,
  );

  return {
    year,
    month,
    cursor,
    selectedDate: null,
    options: resolved,
    monthData,
  };
}

// ─── 状態再構築 ──────────────────────────────────────────

/**
 * カーソル/選択状態を保ったまま、新しい年月で状態を再構築する。
 *
 * ナビゲーション（月移動・年移動・ジャンプ）から利用される。
 * `year`/`month` は shiftMonth で正規化される（例: month=13 → 翌年1月）。
 * `monthData` を渡すと構築を省略できる（検索済みの月データを使い回す場合）。
 */
export function rebuildState<T>(
  year: number,
  month: number,
  cursor: { row: number; col: number } | null,
  selectedDate: Date | null,
  options: ResolvedOptions<T>,
  monthData?: MonthData<T>,
): CalendarState<T> {
  const { year: ny, month: nm } = shiftMonth(year, month, 0);
  const data = monthData ?? buildMonthData<T>(ny, nm, options);
  return {
    year: ny,
    month: nm,
    cursor: clampCursor(cursor, data),
    selectedDate,
    options,
    monthData: data,
  };
}
