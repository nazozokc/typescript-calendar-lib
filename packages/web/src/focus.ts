import {
  createDate,
  daysInMonth,
  getYearMonth,
} from "@typescript-calendar-lib/core";

// ─── フォーカス可能なセルの解決 ──────────────────────────────
// roving tabindex は「1 つだけ tabIndex=0」が原則。cursorDate が無い /
// 表示月外 / 選択不可のときに全セルが tabIndex=-1 になるのを防ぐ。

export interface FocusDateOptions {
  /** 表示中の年 */
  year: number;
  /** 表示中の月 (1–12) */
  month: number;
  /** カーソル位置。表示月内で選択可能なら最優先 */
  cursorDate?: Date | null;
  /** 今日。カーソルが使えないときの次候補 */
  today?: Date;
  /** 選択不可日付の判定 */
  isDateDisabled?: (date: Date) => boolean;
}

/**
 * roving tabindex の対象日付を返す。
 *
 * 優先順位は cursorDate → today → 月の先頭から順に選択可能な日付。
 * 全日が選択不可の場合だけ null を返す（その月はキーボードで操作できない）。
 * 時刻は比較に使わないため、入力の Date はそのまま返す。
 */
export function getFocusDate(options: FocusDateOptions): Date | null {
  const { year, month, cursorDate, today, isDateDisabled } = options;

  const usable = (date: Date | null | undefined): date is Date => {
    if (date == null || Number.isNaN(date.getTime())) return false;
    const ym = getYearMonth(date);
    if (ym.year !== year || ym.month !== month) return false;
    return isDateDisabled?.(date) !== true;
  };

  if (usable(cursorDate)) return cursorDate;
  if (usable(today)) return today;

  const last = daysInMonth(year, month);
  for (let day = 1; day <= last; day++) {
    const date = createDate(year, month - 1, day);
    if (isDateDisabled?.(date) !== true) return date;
  }
  return null;
}
