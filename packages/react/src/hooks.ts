import type {
  CalendarState,
  CalendarStateOptions,
  Direction,
  MonthDirection,
} from "@typescript-calendar-lib/tui";
import {
  clearSelection,
  createCalendarState,
  getCursorDate,
  getSelectedDate,
  goToDate,
  goToMonth,
  goToToday,
  moveCursor,
  navigateMonth,
  navigateYear,
  sameStateOptions,
  selectDate,
  updateStateOptions,
} from "@typescript-calendar-lib/tui";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCalendarStateOptions
  extends Pick<
    CalendarStateOptions,
    "locale" | "weekStart" | "today" | "highlight" | "range"
  > {
  initialYear?: number;
  initialMonth?: number;
  /** 表示中の年月が変わったときに呼ばれる */
  onMonthChange?: (year: number, month: number) => void;
}

export interface UseCalendarStateReturn {
  /** 現在のカレンダー状態 */
  state: CalendarState;
  /** カーソルを指定方向に移動 (wrap around) */
  moveCursor: (direction: Direction) => void;
  /** 前月/翌月へ移動 */
  goNext: () => void;
  goPrev: () => void;
  /** 前年/翌年へ移動 */
  navigateYear: (direction: MonthDirection) => void;
  /** 指定した年月へジャンプ */
  goToMonth: (year: number, month: number) => void;
  /** 指定した日付の月へジャンプし、カーソルをその日付に置く */
  goToDate: (date: Date) => void;
  /** 今日の月へジャンプ */
  goToday: () => void;
  /** カーソル位置の日付を選択 */
  selectDate: () => void;
  /** 選択を解除 */
  clearSelection: () => void;
  /** カーソル位置の日付（null の場合あり） */
  cursorDate: Date | null;
  /** 選択済み日付（null の場合あり） */
  selectedDate: Date | null;
}

/**
 * tui の不変状態マシンを包む React hook。
 * カレンダーのインタラクティブ操作をシンプルに利用できる。
 *
 * `options` の値（locale / weekStart / today / highlight / range /
 * initialYear / initialMonth）が変わると、カーソル・選択を保ったまま
 * 状態が再構築される。比較は値（Date は getTime）で行うため、インラインで
 * オプションを渡しても値が同じなら再構築されない。
 *
 * `today` を省略した場合、最初に解決された値が状態に固定され、以降も
 * 引き継がれる（毎レンダリング `new Date()` を渡さなくてよい）。
 */
export function useCalendarState(
  options: UseCalendarStateOptions = {},
): UseCalendarStateReturn {
  const [state, setState] = useState<CalendarState>(() =>
    createCalendarState({
      initialYear: options.initialYear,
      initialMonth: options.initialMonth,
      today: options.today,
      locale: options.locale,
      weekStart: options.weekStart,
      highlight: options.highlight,
      range: options.range,
    }),
  );

  // options の「値の変化」を検知して状態を再構築する。
  // 初回は prevOptions が同一なので何もしない。値が同じままの再レンダリング
  // でも何もしないため、インラインリテラルを毎回渡しても無限ループしない。
  const prevOptions = useRef(options);
  useEffect(() => {
    if (sameStateOptions(prevOptions.current, options)) return;
    const previous = prevOptions.current;
    prevOptions.current = options;
    setState((current) => updateStateOptions(current, options, previous));
  }, [options]);

  // onMonthChange: ref 経由で安定参照
  const onMonthChangeRef = useRef(options.onMonthChange);
  onMonthChangeRef.current = options.onMonthChange;

  const prevMonthRef = useRef({ year: state.year, month: state.month });
  useEffect(() => {
    const prev = prevMonthRef.current;
    if (prev.year !== state.year || prev.month !== state.month) {
      prevMonthRef.current = { year: state.year, month: state.month };
      onMonthChangeRef.current?.(state.year, state.month);
    }
  }, [state.year, state.month]);

  return {
    state,
    moveCursor: useCallback(
      (direction: Direction) => setState((prev) => moveCursor(prev, direction)),
      [],
    ),
    goNext: useCallback(
      () => setState((prev) => navigateMonth(prev, "next")),
      [],
    ),
    goPrev: useCallback(
      () => setState((prev) => navigateMonth(prev, "prev")),
      [],
    ),
    navigateYear: useCallback(
      (direction: MonthDirection) =>
        setState((prev) => navigateYear(prev, direction)),
      [],
    ),
    goToMonth: useCallback(
      (year: number, month: number) =>
        setState((prev) => goToMonth(prev, year, month)),
      [],
    ),
    goToDate: useCallback(
      (date: Date) => setState((prev) => goToDate(prev, date)),
      [],
    ),
    goToday: useCallback(() => setState((prev) => goToToday(prev)), []),
    selectDate: useCallback(() => setState((prev) => selectDate(prev)), []),
    clearSelection: useCallback(
      () => setState((prev) => clearSelection(prev)),
      [],
    ),
    cursorDate: getCursorDate(state),
    selectedDate: getSelectedDate(state),
  };
}

export type { Direction, MonthDirection };
