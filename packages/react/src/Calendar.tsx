import type {
  CalendarCellState,
  CalendarOptions,
} from "@typescript-calendar-lib/core";
import {
  buildMonthGrid,
  createDate,
  getCalendarCellState,
  getMonthName,
  getWeekdayHeaders,
  isSameDay,
} from "@typescript-calendar-lib/core";
import { formatCellLabel } from "@typescript-calendar-lib/web";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  Ref,
} from "react";
import { getCellClasses } from "./cell-classes.ts";
import type { CalendarSize } from "./size.ts";
import { buildSizeStyle, isSizeName } from "./size.ts";
import type {
  ColorSchemeName,
  ReactColorScheme,
  ReactTheme,
  ThemeName,
} from "./themes.ts";
import { resolveColorScheme, resolveTheme } from "./themes.ts";

export type {
  CalendarCustomSize,
  CalendarSize,
  CalendarSizeName,
} from "./size.ts";

export interface CalendarProps {
  year: number;
  month: number;
  locale?: CalendarOptions["locale"];
  weekStart?: CalendarOptions["weekStart"];
  highlight?: Date;
  /** 範囲強調 */
  range?: { from: Date; to: Date };
  /** 今日の基準日。カラースキームの today 着色に使用 */
  today?: Date;
  /** 範囲プレビュー（ホバー等の候補範囲）。is-in-range-preview クラスで視覚化される */
  rangePreview?: { from: Date; to: Date };
  /** 見た目テーマ。既定は "default" */
  theme?: ThemeName | ReactTheme;
  /** カラースキーム。既定は "default" */
  colorScheme?: ColorSchemeName | ReactColorScheme;
  /** セルサイズ。既定は "md"。{ width, height } で自由に指定できる */
  size?: CalendarSize;
  /** root 要素に追加するスタイル。CSS変数（--cal-*）で自由に上書きできる */
  style?: CSSProperties;

  // ── インタラクション ──

  /** インタラクティブモードを有効にする。セルクリック・ホバー・キーボード選択が可能になる */
  interactive?: boolean;
  /** セルクリック時のコールバック */
  onDateClick?: (date: Date) => void;
  /** セルホバー時のコールバック */
  onDateHover?: (date: Date) => void;
  /** カレンダーからマウスが離れたときのコールバック */
  onDateLeave?: () => void;
  /** キーボード操作。root 要素で発火（矢印キー等を InteractiveCalendar が処理する） */
  onKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => void;

  // ── セル状態 ──

  /** 選択済み日付。aria-selected と表示スタイルに使用 */
  selectedDate?: Date | null;
  /** カーソル位置の日付。このセルだけ tabIndex=0（roving tabindex）になる */
  cursorDate?: Date | null;
  /** ホバー中の日付。is-hovered クラスで視覚化される */
  hoveredDate?: Date | null;
  /** セル内容のカスタムレンダリング。interactive 時は button の子として描画される */
  renderCell?: (day: number, date: Date, state: CalendarCellState) => ReactNode;

  /** root 要素への ref（React 19 の ref-as-prop） */
  ref?: Ref<HTMLDivElement>;
}

/** 月カレンダーコンポーネント */
export function Calendar({
  year,
  month,
  locale = "en",
  weekStart = "sunday",
  highlight,
  range,
  today,
  theme = "default",
  colorScheme = "default",
  size = "md",
  style,
  interactive = false,
  onDateClick,
  onDateHover,
  onDateLeave,
  onKeyDown,
  selectedDate = null,
  cursorDate = null,
  hoveredDate = null,
  renderCell,
  rangePreview,
  ref,
}: CalendarProps) {
  const cellDate = (day: number): Date => createDate(year, month - 1, day);
  const className = (day: number): string | undefined =>
    getCellClasses(cellDate(day), {
      today,
      highlight,
      range,
      rangePreview,
      hoveredDate,
      selected: selectedDate,
      cursorDate,
    }) || undefined;

  const handleCellClick = (day: number) => {
    if (interactive && onDateClick) onDateClick(cellDate(day));
  };

  const handleCellHover = (day: number) => {
    if (interactive && onDateHover) onDateHover(cellDate(day));
  };

  const handleMouseLeave = () => {
    if (interactive && onDateLeave) onDateLeave();
  };

  const title = `${getMonthName(locale, month)} ${year}`;
  // インタラクティブ時のみ APG の grid セマンティクスを付与する。
  // 静的表示ではネイティブの table/cell セマンティクスをそのまま使う。
  const gridRole = interactive ? "grid" : undefined;
  const cellRole = interactive ? "gridcell" : undefined;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: onMouseLeave はホバー状態クリア用の補助イベント。キーボード操作（role=grid）は独立して対応済み
    <div
      ref={ref}
      className={`calendar ${resolveTheme(theme).className}${isSizeName(size) ? ` calendar-size-${size}` : ""}${interactive ? " calendar-interactive" : ""}`}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
      style={{
        ...(resolveColorScheme(colorScheme) as CSSProperties),
        ...buildSizeStyle(size),
        ...style,
      }}
    >
      <div className="calendar-header">
        <h2>{title}</h2>
      </div>
      <table role={gridRole} aria-label={title} onKeyDown={onKeyDown}>
        <thead>
          <tr>
            {getWeekdayHeaders(locale, weekStart).map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buildMonthGrid(year, month, weekStart).map((row, i) => {
            if (row.every((d) => d === null)) return null;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: 月グリッドは静的で並び順が変わらない
              <tr key={i}>
                {row.map((day, j) => {
                  if (day === null)
                    // biome-ignore lint/suspicious/noArrayIndexKey: パディングセルは位置が唯一の識別子
                    return <td key={j} role={cellRole} />;
                  const date = cellDate(day);
                  const state = getCalendarCellState(date, {
                    today,
                    highlight,
                    range,
                  });
                  const selected =
                    selectedDate !== null && isSameDay(date, selectedDate);
                  const cursor =
                    cursorDate !== null && isSameDay(date, cursorDate);
                  return (
                    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: interactive 時は td に role=gridcell が付き aria-selected は有効（role が動的なため静的解析できない）
                    <td
                      // パディングセル（key=j）との衝突を避けるため日番号に "d-" を付与する。日番号は列位置 j と異なり配列の index ではない
                      key={`d-${day}`}
                      role={cellRole}
                      tabIndex={interactive ? -1 : undefined}
                      className={className(day)}
                      aria-selected={selected || undefined}
                      aria-current={state.isToday ? "date" : undefined}
                    >
                      {interactive ? (
                        <button
                          type="button"
                          className="calendar-day-btn"
                          onClick={() => handleCellClick(day)}
                          onMouseEnter={() => handleCellHover(day)}
                          tabIndex={cursor ? 0 : -1}
                          data-cursor={cursor ? "true" : undefined}
                          aria-label={formatCellLabel(locale, year, month, day)}
                        >
                          {renderCell ? renderCell(day, date, state) : day}
                        </button>
                      ) : renderCell ? (
                        renderCell(day, date, state)
                      ) : (
                        day
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Calendar;
