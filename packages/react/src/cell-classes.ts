import {
  type CalendarCellState,
  getCalendarCellState,
} from "@typescript-calendar-lib/core";

// ─── セル状態クラス ───────────────────────────────────────

export interface CellStateOptions {
  today?: Date;
  highlight?: Date;
  range?: { from: Date; to: Date };
}

// 範囲の from > to は不正入力として RangeError（isDateInRange が検証する）

/** セル状態に応じた CSS クラスを組み立てる */
export function stateToClasses(state: CalendarCellState): string {
  const classes: string[] = [];
  if (state.isWeekend) classes.push("is-weekend");
  if (state.isToday) classes.push("is-today");
  if (state.isHighlight) classes.push("is-highlight");
  if (state.isInRange) classes.push("is-in-range");
  return classes.join(" ");
}

/** 日付セルの状態（週末・今日・ハイライト・範囲）に応じたCSSクラスを組み立てる */
export function getCellClasses(date: Date, options: CellStateOptions): string {
  return stateToClasses(getCalendarCellState(date, options));
}
