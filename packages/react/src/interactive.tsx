import type { CalendarOptions } from "@typescript-calendar-lib/core";
import type { SelectionMode } from "@typescript-calendar-lib/tui";
import { keyToAction } from "@typescript-calendar-lib/tui";
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
  holidayLocale?: CalendarOptions["holidayLocale"];
  weekStart?: CalendarOptions["weekStart"];
  /** 選択方式。既定は "single"。範囲選択時はクリックのたびにアンカー→確定→リセットを交互に行う */
  selectionMode?: SelectionMode;
  /** ハイライト対象日 */
  highlight?: Date;
  /** 範囲プレビュー（ホバー等の候補範囲）。is-in-range-preview クラスで視覚化される */
  range?: { from: Date; to: Date };
  /** 今日の基準日。省略時は初回レンダリング時刻に解決される */
  today?: Date;
  /** 選択不可日付の判定。true を返した日付は選択・カーソル移動・ホバーの対象外になる */
  isDateDisabled?: (date: Date) => boolean;
  /** 表示中の年月が変わったときに呼ばれる */
  onMonthChange?: (year: number, month: number) => void;

  // ── Calendar の見た目 ──

  theme?: ThemeName | ReactTheme;
  colorScheme?: ColorSchemeName | ReactColorScheme;
  size?: CalendarSize;
  /** 狭い画面（スマホ等）でセルサイズと余白を自動調整する */
  responsive?: boolean;
  style?: CSSProperties;
  /** セル内容のカスタムレンダリング。第4引数に該当日のデータが渡る */
  renderCell?: CalendarProps["renderCell"];
  /** 各セルに付与するユーザー定義データを解決する関数。実セルのみに呼ばれる */
  cellData?: (date: Date) => unknown;

  // ── イベント ──

  /** セルクリック時（キーボードの Enter/Space 含む）。クリックした日付は自動的に選択される。第2引数に該当日のデータが渡る */
  onDateClick?: (date: Date, data?: unknown) => void;
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
    holidayLocale,
    weekStart,
    selectionMode,
    highlight,
    range,
    today,
    isDateDisabled,
    onMonthChange,
    theme,
    colorScheme,
    size,
    responsive,
    style,
    renderCell,
    cellData,
    onDateClick,
    onDateHover,
    onDateLeave,
  } = props;

  const hook = useCalendarState({
    initialYear,
    initialMonth,
    locale,
    holidayLocale,
    weekStart,
    selectionMode,
    today,
    highlight,
    range,
    isDateDisabled,
    onMonthChange,
  });

  const { state, moveCursor, goPrev, goNext, selectDateAt, setHoveredDate } =
    hook;
  const rootRef = useRef<HTMLDivElement>(null);

  // クリック（マウス・Enter/Space 共通）で日付を選択する。
  // 従来の onDateClick コールバックも引き続き発火し、第2引数に該当日のデータが渡る。
  const handleDateClick = useCallback(
    (date: Date, data?: unknown) => {
      selectDateAt(date);
      onDateClick?.(date, data);
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

  // 確定済みの選択範囲は、次のピックが始まるまでプレビューとして表示し続ける。
  // 未確定なら選択済み日付とホバー日付の間を範囲プレビューとして表示する。
  const rangePreview =
    hook.selectedRange ??
    buildRangePreview(hook.selectedDate, hook.hoveredDate);

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
      const action = keyToAction(e.key);
      if (action === undefined) return;
      e.preventDefault();
      switch (action) {
        case "prev":
          goPrev();
          break;
        case "next":
          goNext();
          break;
        default:
          moveCursor(action);
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
      holidayLocale={state.options.holidayLocale}
      weekStart={state.options.weekStart}
      highlight={state.options.highlight}
      range={state.options.range}
      today={state.options.today}
      isDateDisabled={isDateDisabled}
      theme={theme}
      colorScheme={colorScheme}
      size={size}
      responsive={responsive}
      style={style}
      interactive
      renderCell={renderCell}
      cellData={cellData}
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
