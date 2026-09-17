// ─── セルラベル ───────────────────────────────────────────

import { getMonthName, type Locale } from "@typescript-calendar-lib/core";

/** セルの aria-label 用テキスト（例: "September 15, 2026"）を組み立てる */
export function formatCellLabel(
  locale: Locale,
  year: number,
  month: number,
  day: number,
): string {
  return `${getMonthName(locale, month)} ${day}, ${year}`;
}
