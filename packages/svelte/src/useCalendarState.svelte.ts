import type { DateRange } from "@typescript-calendar-lib/core";
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
  getSelectedRange,
  goToToday,
  moveCursor,
  navigateMonth,
  sameStateOptions,
  selectDate,
  selectDateAt,
  selectRange,
  setCursorToDate,
  updateStateOptions,
} from "@typescript-calendar-lib/tui";

export interface UseCalendarStateOptions
  extends Pick<
    CalendarStateOptions,
    | "locale"
    | "holidayLocale"
    | "weekStart"
    | "today"
    | "highlight"
    | "range"
    | "isDateDisabled"
    | "selectionMode"
  > {
  initialYear?: number;
  initialMonth?: number;
}

/**
 * `useCalendarState` の first 引数。
 * - 変更しない設定: オブジェクトを直接渡す
 * - props や $state の値に追従させる: `() => ({ ... })` の getter を渡す。
 *   （$derived オブジェクトを渡しても、追跡は宣言したファイル内でのみ
 *   有効なため、別モジュールのフックには伝わらない点に注意）
 */
export type UseCalendarStateOptionsInput =
  | UseCalendarStateOptions
  | (() => UseCalendarStateOptions);

export interface UseCalendarStateReturn {
  /** 現在のカレンダー状態 */
  state: CalendarState;
  /** カーソルを指定方向に移動 (wrap around) */
  moveCursor: (direction: Direction) => void;
  /** 前月/翌月へ移動 */
  goNext: () => void;
  goPrev: () => void;
  /** 今日の月へジャンプ */
  goToday: () => void;
  /** カーソル位置の日付を選択 */
  selectDate: () => void;
  /** 指定した日付へカーソルを移動する（当月に無ければ何もしない） */
  setCursorToDate: (date: Date) => void;
  /** 指定した日付を選択し、カーソルもそこへ移動する（当月に無ければ何もしない） */
  selectDateAt: (date: Date) => void;
  /** from/to の範囲を選択範囲として直接設定する（順序は自動で整列される） */
  selectRange: (from: Date, to: Date) => void;
  /** 選択を解除 */
  clearSelection: () => void;
  /** カーソル位置の日付（null の場合あり） */
  cursorDate: Date | null;
  /** 選択済み日付（null の場合あり） */
  selectedDate: Date | null;
  /** 確定した選択範囲（未確定・single モードでは null） */
  selectedRange: DateRange | null;
  /** ホバー中の日付（null の場合あり） */
  hoveredDate: Date | null;
  /** ホバー日付を更新する */
  setHoveredDate: (date: Date | null) => void;
}

/** undefined を含む日付を値（時刻）で比較する */
/**
 * tui の不変状態機械を包む Svelte 5 (runes) のリアクティブ状態。
 * カレンダーのインタラクティブ操作をシンプルに利用できる。
 *
 * リアクティブに追従させたい設定（コンポーネントの props や $state の値）が
 * ある場合は、`options` にリテラルではなく getter 関数を渡す:
 *
 * ```svelte
 * <script>
 *   let { highlight, today } = $props();
 *   const cal = useCalendarState(() => ({
 *     initialYear: 2026,
 *     initialMonth: 9,
 *     today,
 *     highlight,
 *   }));
 * </script>
 * ```
 *
 * getter が返す値が変わると、カーソル・選択を保ったまま状態が再構築される。
 * 値が同じままの再評価では何もしない。プレーンなオブジェクトを渡した場合は
 * 初期値としてのみ使われ、以降は更新されない。
 *
 * `today` を省略した場合、最初に解決された値が状態に固定され、以降も
 * 引き継がれる（毎回 `new Date()` を渡さなくてよい）。
 *
 * マウス操作向けのヘルパーも備える:
 * - `selectDateAt(date)` — クリックした日付を選択（カーソルも移動）
 * - `setHoveredDate(date | null)` — Calendar の `is-hovered` クラスに反映されるホバー追跡
 * - `hoveredDate` + `selectDateAt` を組み合わせると、選択済み日付からホバー日付までの
 *   範囲プレビュー（`is-in-range-preview`）が表示できる
 */
export function useCalendarState(
  options: UseCalendarStateOptionsInput = {},
): UseCalendarStateReturn {
  const getter = typeof options === "function" ? options : () => options;

  let state = $state(createCalendarState(getter()));

  // ホバー中の日付はローカル reactive 状態で保持する（tui 状態には入れない）。
  let hoveredDate = $state<Date | null>(null);

  // options の「値の変化」を検知して状態を再構築する。
  // getter を effect 内で呼び出すことで、呼び出し元ファイルで追跡される
  // props / $state への読み取りが依存として登録され、値が変わると
  // この effect が再実行される。値が同じままの再評価では何もしない。
  let prev = getter();
  $effect(() => {
    const next = getter();
    if (sameStateOptions(prev, next)) return;
    const previous = prev;
    prev = next;
    state = updateStateOptions(state, next, previous);
  });

  // 表示月が変わったら、古い月を指すホバーをクリアする
  let prevMonthKey: string | null = null;
  $effect(() => {
    const key = `${state.year}-${state.month}`;
    if (prevMonthKey !== null && key !== prevMonthKey) {
      hoveredDate = null;
    }
    prevMonthKey = key;
  });

  return {
    get state() {
      return state;
    },
    get cursorDate() {
      return getCursorDate(state);
    },
    get selectedDate() {
      return getSelectedDate(state);
    },
    get selectedRange() {
      return getSelectedRange(state);
    },
    get hoveredDate() {
      return hoveredDate;
    },
    moveCursor: (direction: Direction) => {
      state = moveCursor(state, direction);
    },
    goNext: () => {
      state = navigateMonth(state, "next");
    },
    goPrev: () => {
      state = navigateMonth(state, "prev");
    },
    goToday: () => {
      state = goToToday(state);
    },
    selectDate: () => {
      state = selectDate(state);
    },
    setCursorToDate: (date: Date) => {
      state = setCursorToDate(state, date);
    },
    selectDateAt: (date: Date) => {
      state = selectDateAt(state, date);
    },
    selectRange: (from: Date, to: Date) => {
      state = selectRange(state, from, to);
    },
    clearSelection: () => {
      state = clearSelection(state);
    },
    setHoveredDate: (date: Date | null) => {
      hoveredDate = date;
    },
  };
}

export type { Direction, MonthDirection };
