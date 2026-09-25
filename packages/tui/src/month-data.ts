import {
  assertValidDate,
  buildMonthGrid,
  getMonthName,
  getWeekdayHeaders,
} from "@typescript-calendar-lib/core";
import { buildMonthCell, getVisibleRowCount } from "./month-cell.ts";
import { shiftMonth } from "./month-math.ts";
import type { CalendarCell, MonthData, MonthDataOptions } from "./types.ts";

/**
 * 月カレンダーの完全なデータを構築する。
 *
 * core の buildMonthGrid を包み、各セルにメタデータ（今日判定、ハイライト、範囲等）を付与する。
 * プレゼンテーション情報（色、スタイル）は含まない。
 *
 * `year`/`month` は shiftMonth で正規化される（例: month=13 → 翌年1月）。
 * 不正な入力（NaN・非整数の年月、Invalid Date、未対応ロケール等）には RangeError を投げる。
 */
export function buildMonthData<T>(
  year: number,
  month: number,
  options: MonthDataOptions<T> = {},
): MonthData<T> {
  const {
    locale = "en",
    holidayLocale,
    weekStart = "sunday",
    today = new Date(),
    highlight,
    range,
    isDateDisabled,
    cellData,
  } = options;

  // ─── 検証・正規化 ───────────────────────────────────
  // 年月は整数検証 + 範囲 (MIN_YEAR..MAX_YEAR) クランプ、ロケール/曜日は core 側で検証される
  const { year: ny, month: nm } = shiftMonth(year, month, 0);
  assertValidDate(today);
  if (highlight !== undefined) assertValidDate(highlight);

  // from > to の逆転 range も isDateInRange が RangeError を投げる
  if (range !== undefined) {
    assertValidDate(range.from);
    assertValidDate(range.to);
  }

  const title = `${getMonthName(locale, nm)} ${ny}`;
  const weekdays = getWeekdayHeaders(locale, weekStart);
  const rawGrid = buildMonthGrid(ny, nm, weekStart);

  const cells: CalendarCell<T>[][] = rawGrid.map((row) =>
    row.map((day, dayOfWeek) =>
      buildMonthCell(ny, nm, day, dayOfWeek, {
        today,
        holidayLocale,
        highlight,
        range,
        isDateDisabled,
        cellData,
      }),
    ),
  );

  return {
    year: ny,
    month: nm,
    title,
    weekdays,
    cells,
    visibleRows: getVisibleRowCount(cells),
  };
}
