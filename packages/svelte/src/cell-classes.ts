import {
  getCalendarCellState,
  isDateInRange,
  isSameDay,
} from "@typescript-calendar-lib/core";

// ─── セル状態クラス ───────────────────────────────────────

export interface CellStateOptions {
  today?: Date;
  highlight?: Date;
  range?: { from: Date; to: Date };
  /** 範囲プレビュー（ホバー等の候補範囲）。is-in-range-preview クラスになる */
  rangePreview?: { from: Date; to: Date };
  /** ホバー中の日付。is-hovered クラスになる */
  hoveredDate?: Date | null;
  /** 選択済み日付。該当セルに is-selected クラスが付く */
  selected?: Date | null;
  /** カーソル位置の日付。該当セルに is-cursor クラスが付く */
  cursorDate?: Date | null;
  /** 選択不可日付の判定。該当セルに is-disabled クラスが付く */
  isDateDisabled?: (date: Date) => boolean;
}

// 範囲の from > to は不正入力として RangeError（isDateInRange が検証する）

/** 日付セルの状態（週末・今日・ハイライト・範囲・選択・カーソル）に応じたCSSクラスを組み立てる */
export function getCellClasses(date: Date, options: CellStateOptions): string {
  const state = getCalendarCellState(date, options);
  const classes: string[] = [];
  if (state.isWeekend) classes.push("is-weekend");
  if (state.isToday) classes.push("is-today");
  if (state.isHighlight) classes.push("is-highlight");
  if (state.isInRange) classes.push("is-in-range");
  if (
    options.rangePreview !== undefined &&
    isDateInRange(date, options.rangePreview)
  )
    classes.push("is-in-range-preview");
  if (state.isDisabled) classes.push("is-disabled");
  if (options.hoveredDate != null && isSameDay(date, options.hoveredDate))
    classes.push("is-hovered");
  if (options.selected != null && isSameDay(date, options.selected))
    classes.push("is-selected");
  if (options.cursorDate != null && isSameDay(date, options.cursorDate))
    classes.push("is-cursor");
  return classes.join(" ");
}
