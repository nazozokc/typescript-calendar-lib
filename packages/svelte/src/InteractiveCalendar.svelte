<script lang="ts">
  import type { CalendarCellState, CalendarOptions } from "@typescript-calendar-lib/core";
  import type { SelectionMode } from "@typescript-calendar-lib/tui";
  import { keyToAction } from "@typescript-calendar-lib/tui";
  import Calendar from "./Calendar.svelte";
  import { buildRangePreview } from "./range-preview.js";
  import type { CalendarSize } from "./size.js";
  import type { CSSProperties } from "./style.js";
  import type {
    ColorSchemeName,
    SvelteColorScheme,
    SvelteTheme,
    ThemeName,
  } from "./themes.js";
  import { useCalendarState } from "./useCalendarState.svelte.js";

  interface InteractiveCalendarProps {
    // ── useCalendarState オプション ──

    /** 表示開始年。既定は today の年 */
    initialYear?: number;
    /** 表示開始月 (1-12)。範囲外は正規化される */
    initialMonth?: number;
    locale?: CalendarOptions["locale"];
    holidayLocale?: CalendarOptions["holidayLocale"];
    weekStart?: CalendarOptions["weekStart"];
    /** ハイライト対象日 */
    highlight?: Date;
    /** 色付け範囲 */
    range?: { from: Date; to: Date };
    /** 選択方式。既定は "single"。range では 2 回のクリックで範囲が確定する */
    selectionMode?: SelectionMode;
    /** 今日の基準日。省略時は初回レンダリング時刻に解決される */
    today?: Date;
    /** 選択不可日付の判定。true を返した日付は選択・カーソル移動・ホバーの対象外になる */
    isDateDisabled?: (date: Date) => boolean;

    // ── Calendar の見た目 ──

    theme?: ThemeName | SvelteTheme;
    colorScheme?: ColorSchemeName | SvelteColorScheme;
    size?: CalendarSize;
    /** 狭い画面（スマホ等）でセルサイズと余白を自動調整する */
    responsive?: boolean;
    style?: CSSProperties;
    /** セル内容のカスタムレンダリング。第4引数に該当日のデータが渡る */
    renderCell?: (
      day: number,
      date: Date,
      state: CalendarCellState,
      data?: unknown,
    ) => string;
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

  let {
    initialYear,
    initialMonth,
    locale,
    holidayLocale,
    weekStart,
    highlight,
    range,
    selectionMode,
    today,
    isDateDisabled,
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
  }: InteractiveCalendarProps = $props();

  const cal = useCalendarState(() => ({
    initialYear,
    initialMonth,
    locale,
    holidayLocale,
    weekStart,
    today,
    highlight,
    range,
    isDateDisabled,
    selectionMode,
  }));

  // クリック（マウス・Enter/Space 共通）で日付を選択する。
  // 従来の onDateClick コールバックも引き続き発火し、第2引数に該当日のデータが渡る。
  const handleDateClick = (date: Date, data?: unknown) => {
    cal.selectDateAt(date);
    onDateClick?.(date, data);
  };

  const handleDateHover = (date: Date) => {
    cal.setHoveredDate(date);
    onDateHover?.(date);
  };

  const handleDateLeave = () => {
    cal.setHoveredDate(null);
    onDateLeave?.();
  };

  // 確定した選択範囲があればそれを、なければ選択日〜ホバー日のプレビューを表示する
  const rangePreview = $derived(
    cal.selectedRange ?? buildRangePreview(cal.selectedDate, cal.hoveredDate),
  );

  // カーソルが動いたときだけ、そのセルへフォーカスを移す（初回マウントでは動かさない）
  let root: HTMLDivElement | undefined = $state();
  let prevCursor = cal.state.cursor;
  $effect(() => {
    const next = cal.state.cursor;
    if (next === prevCursor) return;
    prevCursor = next;
    root
      ?.querySelector<HTMLButtonElement>('[data-cursor="true"]')
      ?.focus();
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    const action = keyToAction(event.key);
    if (action === undefined) return;
    event.preventDefault();
    switch (action) {
      case "prev":
        cal.goPrev();
        break;
      case "next":
        cal.goNext();
        break;
      default:
        cal.moveCursor(action);
    }
  };
</script>

<div bind:this={root} class="interactive-calendar">
  <Calendar
    year={cal.state.year}
    month={cal.state.month}
    locale={cal.state.options.locale}
    holidayLocale={cal.state.options.holidayLocale}
    weekStart={cal.state.options.weekStart}
    highlight={cal.state.options.highlight}
    range={cal.state.options.range}
    today={cal.state.options.today}
    isDateDisabled={isDateDisabled}
    theme={theme}
    colorScheme={colorScheme}
    size={size}
    responsive={responsive}
    style={style}
    interactive
    renderCell={renderCell}
    cellData={cellData}
    selected={cal.selectedDate}
    cursorDate={cal.cursorDate}
    hoveredDate={cal.hoveredDate}
    rangePreview={rangePreview}
    onDateClick={handleDateClick}
    onDateHover={handleDateHover}
    onDateLeave={handleDateLeave}
    onkeydown={handleKeyDown}
  />
</div>