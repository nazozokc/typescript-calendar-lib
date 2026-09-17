import {
  buildMonthGrid,
  createDate,
  getCalendarCellState,
  getMonthName,
  getWeekdayHeaders,
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
    weekStart = "sunday",
    highlight,
    highlightStyle = "bracket",
    range,
    color = false,
    theme: themeOption = "default",
    colorScheme: schemeOption = "default",
    today = new Date(),
  } = options;

  const theme = resolveTheme(themeOption);
  const palette = resolveColorScheme(schemeOption);
  const frame = theme.frame;

  const title = `${getMonthName(locale, month)} ${year}`;
  const weekdays = getWeekdayHeaders(locale, weekStart);
  const grid = buildMonthGrid(year, month, weekStart);
  const cols = weekdays.length;

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
    const { isHighlight, isInRange, isToday, isWeekend } = getCalendarCellState(
      date,
      { today, highlight, range },
    );

    const text = (
      isHighlight && highlightStyle === "bracket" ? `[${day}]` : String(day)
    ).padStart(cellWidth);

    let code: number | undefined;
    if (isHighlight && highlightStyle === "reverse") {
      code = palette.highlight ?? 7;
    } else if (isInRange && !isHighlight) {
      code = palette.range ?? 33;
    } else if (isToday && palette.today !== undefined) {
      code = palette.today;
    } else if (isWeekend && palette.weekend !== undefined) {
      code = palette.weekend;
    } else if (palette.day !== undefined) {
      code = palette.day;
    }

    return colorize(text, code, color);
  };

  const lines: string[] = [];

  if (frame === null) {
    // ── 枠なし（default） ──
    const totalWidth = cols * cellWidth + (cols - 1) * sep.length;
    lines.push(centerText(title, totalWidth));
    lines.push(
      weekdays
        .map((d) =>
          colorize(padStartWidth(d, cellWidth), palette.weekday, color),
        )
        .join(sep),
    );
  } else {
    // ── 枠あり（modern） ──
    lines.push(
      colorize(topBorder(frame, cellWidth, cols), palette.frame, color),
    );
    lines.push(
      colorize(
        `${frame.v}${centerTextFull(title, innerWidth(cellWidth, cols))}${frame.v}`,
        palette.title,
        color,
      ),
    );
    lines.push(
      colorize(separatorRow(frame, cellWidth, cols), palette.frame, color),
    );
    lines.push(
      colorize(
        `${frame.v}${weekdays.map((d) => padStartWidth(d, cellWidth)).join(frame.v)}${frame.v}`,
        palette.weekday,
        color,
      ),
    );
    lines.push(
      colorize(separatorRow(frame, cellWidth, cols), palette.frame, color),
    );
  }

  for (const row of grid) {
    if (row.every((d) => d === null)) continue;
    const cells = row.map(renderCell).join(sep);
    lines.push(frame === null ? cells : `${frame.v}${cells}${frame.v}`);
  }

  if (frame !== null) {
    lines.push(
      colorize(bottomBorder(frame, cellWidth, cols), palette.frame, color),
    );
  }

  return lines.join("\n");
}
