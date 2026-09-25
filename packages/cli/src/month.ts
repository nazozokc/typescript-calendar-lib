import {
  addDays,
  buildMonthGrid,
  createDate,
  getCalendarCellState,
  getISOWeek,
  getMonthName,
  getWeekdayHeaders,
  getWeekOfYear,
} from "@typescript-calendar-lib/core";
import {
  centerText,
  centerTextFull,
  displayWidth,
  padStartWidth,
} from "./align.ts";
import { colorize } from "./ansi.ts";
import { bottomBorder, innerWidth, separatorRow, topBorder } from "./border.ts";
import { resolveColorScheme, resolveTheme } from "./theme.ts";
import type { RenderMonthOptions } from "./types.ts";

/** 週番号の表示幅（最大 2 桁: 1-53） */
const WEEK_WIDTH = 2;

/**
 * 1ヶ月分のカレンダーテキストを描画する
 */
export function renderMonth(
  year: number,
  month: number,
  options: RenderMonthOptions = {},
): string {
  const {
    locale = "en",
    holidayLocale,
    weekStart = "sunday",
    highlight,
    highlightStyle = "bracket",
    range,
    color = false,
    theme: themeOption = "default",
    colorScheme: schemeOption = "default",
    today = new Date(),
    isDateDisabled,
    cellData,
    renderCell: customRenderCell,
    showWeekNumbers = false,
  } = options;

  const theme = resolveTheme(themeOption);
  const palette = resolveColorScheme(schemeOption);
  const frame = theme.frame;

  const title = `${getMonthName(locale, month)} ${year}`;
  const weekdays = getWeekdayHeaders(locale, weekStart);
  const grid = buildMonthGrid(year, month, weekStart);
  const cols = weekdays.length;
  const weekWidth = showWeekNumbers ? WEEK_WIDTH : 0;

  // セル幅はテーマ指定を基本としつつ、以下を満たすように広げる:
  // - 曜日ヘッダーの表示幅（fr の "dim." 等がセル幅を超えると列が崩れる）
  // - bracket ハイライトは2桁の日付で `[10]` の4文字になるため
  const cellWidth = Math.max(
    theme.cellWidth,
    ...weekdays.map(displayWidth),
    highlight !== undefined && highlightStyle === "bracket" ? 4 : 2,
  );

  // 枠なしテーマは separator、枠ありテーマは縦線でセルを繋ぐ
  const sep = frame === null ? theme.separator : frame.v;

  /** 1セルを描画する（day は日数または null=空欄） */
  const renderCell = (day: number | null): string => {
    if (day === null) return " ".repeat(cellWidth);

    const date = createDate(year, month - 1, day);
    const state = getCalendarCellState(date, {
      today,
      holidayLocale,
      highlight,
      range,
      isDateDisabled,
    });
    const data = cellData?.(date);

    // ユーザー定義の描画があれば、解決済みデータを渡して委譲する
    if (customRenderCell !== undefined) {
      return customRenderCell(day, date, state, data);
    }

    const {
      isHighlight,
      isInRange,
      isToday,
      isDisabled,
      isWeekend,
      isHoliday,
    } = state;

    const text = (
      isHighlight && highlightStyle === "bracket" ? `[${day}]` : String(day)
    ).padStart(cellWidth);

    // 優先順位: highlight > range > today > disabled > weekend > holiday > day
    let code: number | undefined;
    if (isHighlight && highlightStyle === "reverse") {
      code = palette.highlight ?? 7;
    } else if (isInRange && !isHighlight) {
      code = palette.range ?? 33;
    } else if (isToday && palette.today !== undefined) {
      code = palette.today;
    } else if (isDisabled) {
      code = palette.dim ?? 90;
    } else if (isWeekend && palette.weekend !== undefined) {
      code = palette.weekend;
    } else if (isHoliday && palette.holiday !== undefined) {
      code = palette.holiday;
    } else if (palette.day !== undefined) {
      code = palette.day;
    }

    return colorize(text, code, color);
  };

  /**
   * 行の週番号を表示幅に揃えて返す。週の開始日（行の先頭セルの曜日位置から
   * 逆算）の週番号を使う。weekStart が "monday" なら ISO 週番号、それ以外は
   * 年始を含む週を第1週とする番号（北米の cal -w 相当）。
   */
  const weekLabel = (row: (number | null)[]): string => {
    if (weekWidth === 0) return "";
    const firstIdx = row.findIndex((d) => d !== null);
    if (firstIdx === -1) return " ".repeat(weekWidth);
    const firstDate = createDate(year, month - 1, row[firstIdx]!);
    const weekStartDate = addDays(firstDate, -firstIdx);
    const number =
      weekStart === "monday"
        ? getISOWeek(weekStartDate)
        : getWeekOfYear(weekStartDate);
    return String(number).padStart(weekWidth);
  };

  const lines: string[] = [];

  if (frame === null) {
    // ── 枠なし（default） ──
    const weekCol = weekWidth > 0 ? weekWidth + sep.length : 0;
    const totalWidth = weekCol + cols * cellWidth + (cols - 1) * sep.length;
    lines.push(centerText(title, totalWidth));
    const headerCells = weekdays
      .map((d) => colorize(padStartWidth(d, cellWidth), palette.weekday, color))
      .join(sep);
    lines.push(
      weekWidth > 0 ? " ".repeat(weekWidth) + sep + headerCells : headerCells,
    );
  } else {
    // ── 枠あり（modern） ──
    lines.push(
      colorize(
        topBorder(frame, cellWidth, cols, weekWidth),
        palette.frame,
        color,
      ),
    );
    lines.push(
      colorize(
        `${frame.v}${centerTextFull(title, innerWidth(cellWidth, cols, weekWidth))}${frame.v}`,
        palette.title,
        color,
      ),
    );
    lines.push(
      colorize(
        separatorRow(frame, cellWidth, cols, weekWidth),
        palette.frame,
        color,
      ),
    );
    const headerCells = weekdays
      .map((d) => padStartWidth(d, cellWidth))
      .join(frame.v);
    const header =
      weekWidth > 0
        ? " ".repeat(weekWidth) + frame.v + headerCells
        : headerCells;
    lines.push(
      colorize(`${frame.v}${header}${frame.v}`, palette.weekday, color),
    );
    lines.push(
      colorize(
        separatorRow(frame, cellWidth, cols, weekWidth),
        palette.frame,
        color,
      ),
    );
  }

  for (const row of grid) {
    if (row.every((d) => d === null)) continue;
    const cells = row.map(renderCell).join(sep);
    const week = weekWidth > 0 ? weekLabel(row) + sep : "";
    lines.push(
      frame === null ? week + cells : `${frame.v}${week}${cells}${frame.v}`,
    );
  }

  if (frame !== null) {
    lines.push(
      colorize(
        bottomBorder(frame, cellWidth, cols, weekWidth),
        palette.frame,
        color,
      ),
    );
  }

  return lines.join("\n");
}
