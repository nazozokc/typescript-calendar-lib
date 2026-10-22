import type { CalendarCellState, Locale } from "@typescript-calendar-lib/core";
import {
  getCalendarCellState,
  isDateInRange,
  isSameDay,
} from "@typescript-calendar-lib/core";

// ─── セル状態クラス ───────────────────────────────────────
// react / svelte の両パッケージが同じ CSS クラス名を必要とするため、
// ロジックは web に一元化し各 UI 層は再エクスポートのみ行う。

export interface CellStateOptions {
  today?: Date;
  /** 祝日の判定に使うロケール。省略時は "ja" */
  holidayLocale?: Locale;
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

/** ホバー・選択・カーソル・範囲プレビューの比較対象のみを含むオプション */
export interface SelectionCellOptions
  extends Pick<
    CellStateOptions,
    "rangePreview" | "hoveredDate" | "selected" | "cursorDate"
  > {}

// 範囲の from > to は不正入力として RangeError（isDateInRange が検証する）

/** 算出済みの CalendarCellState から状態クラス（is-weekend 等）を組み立てる */
export function getCellStateClasses(state: CalendarCellState): string {
  const classes: string[] = [];
  if (state.isWeekend) classes.push("is-weekend");
  if (state.isHoliday) classes.push("is-holiday");
  if (state.isToday) classes.push("is-today");
  if (state.isHighlight) classes.push("is-highlight");
  if (state.isInRange) classes.push("is-in-range");
  if (state.isDisabled) classes.push("is-disabled");
  return classes.join(" ");
}

/** 日付がホバー・選択・カーソル・範囲プレビューの対象かによるクラスを組み立てる */
export function getSelectionCellClasses(
  date: Date,
  options: SelectionCellOptions,
): string {
  const classes: string[] = [];
  if (
    options.rangePreview !== undefined &&
    isDateInRange(date, options.rangePreview)
  )
    classes.push("is-in-range-preview");
  if (options.hoveredDate != null && isSameDay(date, options.hoveredDate))
    classes.push("is-hovered");
  if (options.selected != null && isSameDay(date, options.selected))
    classes.push("is-selected");
  if (options.cursorDate != null && isSameDay(date, options.cursorDate))
    classes.push("is-cursor");
  return classes.join(" ");
}

/** 日付セルの状態（週末・今日・ハイライト・範囲・選択・カーソル）に応じた CSS クラスを組み立てる */
export function getCellClasses(date: Date, options: CellStateOptions): string {
  const state = getCalendarCellState(date, options);
  return joinCellClassLists(
    getCellStateClasses(state),
    getSelectionCellClasses(date, options),
  );
}

/** 空でないクラス候補をスペースで結合する（全て空なら空文字） */
export function joinCellClassLists(...parts: readonly string[]): string {
  return parts.filter((part) => part !== "").join(" ");
}

/** 前後の空きマスに付けるクラス。テーマの `is-blank` ルールで使う */
export function getBlankClasses(): string {
  return "is-blank";
}
