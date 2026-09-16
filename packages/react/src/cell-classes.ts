import {
  type CalendarCellState,
  getCalendarCellState,
  isDateInRange,
  isSameDay,
} from "@typescript-calendar-lib/core";

// ─── セル状態クラス ───────────────────────────────────────

export interface CellStateOptions {
  today?: Date;
  highlight?: Date;
  range?: { from: Date; to: Date };
  /** 範囲プレビュー。is-in-range-preview クラスになる */
  rangePreview?: { from: Date; to: Date };
  /** ホバー中の日付。is-hovered クラスになる */
  hoveredDate?: Date | null;
}

// 範囲の from > to は不正入力として RangeError（isDateInRange が検証する）

/** セル状態をクラスリストに変換する（internal） */
function toClassList(state: CalendarCellState): string[] {
  const classes: string[] = [];
  if (state.isWeekend) classes.push("is-weekend");
  if (state.isToday) classes.push("is-today");
  if (state.isHighlight) classes.push("is-highlight");
  if (state.isInRange) classes.push("is-in-range");
  return classes;
}

/** セル状態に応じた CSS クラスを組み立てる */
export function stateToClasses(state: CalendarCellState): string {
  return toClassList(state).join(" ");
}

/**
 * 日付セルの表示クラスを組み立てる。
 * 週末・今日・ハイライト・範囲に加え、範囲プレビュー・ホバーも判定する。
 */
export function getCellClasses(
  date: Date,
  options: CellStateOptions = {},
): string {
  const classes = toClassList(getCalendarCellState(date, options));
  if (
    options.rangePreview !== undefined &&
    isDateInRange(date, options.rangePreview)
  ) {
    classes.push("is-in-range-preview");
  }
  if (options.hoveredDate != null && isSameDay(date, options.hoveredDate)) {
    classes.push("is-hovered");
  }
  return classes.join(" ");
}
