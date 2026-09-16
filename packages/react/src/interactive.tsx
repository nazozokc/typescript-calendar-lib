import type { CalendarOptions } from "@typescript-calendar-lib/core";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef } from "react";
import { Calendar, type CalendarProps } from "./Calendar.tsx";
import { useCalendarState } from "./hooks.ts";
import { buildRangePreview } from "./range-preview.ts";
import type { CalendarSize } from "./size.ts";
import type {
  ColorSchemeName,
  ReactColorScheme,
  ReactTheme,
  ThemeName,
} from "./themes.ts";

export interface InteractiveCalendarProps {
  // ── useCalendarState オプション ──

  /** 表示開始年。既定は today の年 */
  initialYear?: number;
  /** 表示開始月 (1-12)。範囲外は正規化される */
  initialMonth?: number;
  locale?: CalendarOptions["locale"];
  weekStart?: CalendarOptions["weekStart"];
  /** ハイライト対象日 */
  highlight?: Date;
  /** 色付け範囲 */
  range?: { from: Date; to: Date };
  /** 今日の基準日。省略時は初回レンダリング時刻に解決される */
  today?: Date;
  /** 表示中の年月が変わったときに呼ばれる */
  onMonthChange?: (year: number, month: number) => void;

  // ── Calendar の見た目 ──

  theme?: ThemeName | ReactTheme;
  colorScheme?: ColorSchemeName | ReactColorScheme;
  size?: CalendarSize;
  style?: CSSProperties;
  /** セル内容のカスタムレンダリング */
  renderCell?: CalendarProps["renderCell"];

  // ── イベント ──

  /** セルクリック時（キーボードの Enter/Space 含む）。クリックした日付は自動的に選択される */
  onDateClick?: (date: Date) => void;
  /** セルホバー時 */
  onDateHover?: (date: Date) => void;
  /** カレンダーからマウスが離れたとき */
  onDateLeave?: () => void;
}

/**
 * `useCalendarState` と `Calendar` を一体化したインタラクティブカレンダー。
 * 内部で状態を管理し、以下の操作に対応する:
 *
 * - マウス: セルクリックで日付を選択（カーソルもそこへ移動） / ホバー追跡 /
 *   選択済み日付とホバー日付の間を範囲プレビュー表示
 * - キーボード: 矢印キー（カーソル移動）・PageUp/PageDown（月移動）・
 *   Enter/Space（クリックと同じ日付選択）
 */
export function InteractiveCalendar(props: InteractiveCalendarProps) {
  const {
    initialYear,
    initialMonth,
    locale,
    weekStart,
    highlight,
    range,
    today,
    onMonthChange,
    theme,
    colorScheme,
    size,
    style,
    renderCell,
    onDateClick,
    onDateHover,
    onDateLeave,
  } = props;

  const hook = useCalendarState({
    initialYear,
    initialMonth,
    locale,
    weekStart,
    today,
    highlight,
    range,
    onMonthChange,
  });

  const { state, moveCursor, goPrev, goNext, selectDateAt, setHoveredDate } =
    hook;
  const rootRef = useRef<HTMLDivElement>(null);

  // クリック（マウス・Enter/Space 共通）で日付を選択する。
  // 従来の onDateClick コールバックも引き続き発火する。
  const handleDateClick = useCallback(
    (date: Date) => {
      selectDateAt(date);
      onDateClick?.(date);
    },
    [selectDateAt, onDateClick],
  );

  const handleDateHover = useCallback(
    (date: Date) => {
      setHoveredDate(date);
      onDateHover?.(date);
    },
    [setHoveredDate, onDateHover],
  );

  const handleDateLeave = useCallback(() => {
    setHoveredDate(null);
    onDateLeave?.();
  }, [setHoveredDate, onDateLeave]);

  // 選択済み日付とホバー日付の間を範囲プレビューとして表示する
  const rangePreview = buildRangePreview(hook.selectedDate, hook.hoveredDate);

  // カーソルが動いたときだけ、そのセルへフォーカスを移す（初回マウントでは動かさない）
  const prevCursorRef = useRef(state.cursor);
  useEffect(() => {
    const prev = prevCursorRef.current;
    prevCursorRef.current = state.cursor;
    if (prev === state.cursor) return;
    const btn = rootRef.current?.querySelector<HTMLButtonElement>(
      '[data-cursor="true"]',
    );
    btn?.focus();
  }, [state.cursor]);

  const handleKeyDown = useCallback(
    (e: Parameters<NonNullable<CalendarProps["onKeyDown"]>>[0]) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          moveCursor("right");
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveCursor("left");
          break;
        case "ArrowDown":
          e.preventDefault();
          moveCursor("down");
          break;
        case "ArrowUp":
          e.preventDefault();
          moveCursor("up");
          break;
        case "PageUp":
          e.preventDefault();
          goPrev();
          break;
        case "PageDown":
          e.preventDefault();
          goNext();
          break;
      }
    },
    [moveCursor, goPrev, goNext],
  );

  return (
    <Calendar
      ref={rootRef}
      year={state.year}
      month={state.month}
      locale={state.options.locale}
      weekStart={state.options.weekStart}
      highlight={state.options.highlight}
      range={state.options.range}
      today={state.options.today}
      theme={theme}
      colorScheme={colorScheme}
      size={size}
      style={style}
      interactive
      renderCell={renderCell}
      selectedDate={hook.selectedDate}
      cursorDate={hook.cursorDate}
      hoveredDate={hook.hoveredDate}
      rangePreview={rangePreview}
      onDateClick={handleDateClick}
      onDateHover={handleDateHover}
      onDateLeave={handleDateLeave}
      onKeyDown={handleKeyDown}
    />
  );
}
