<script lang="ts">
  import type { CalendarCellState, CalendarOptions } from "@typescript-calendar-lib/core";
  import {
    addDays,
    buildMonthGrid,
    createDate,
    getCalendarCellState,
    getISOWeek,
    getMonthName,
    getWeekOfYear,
    getWeekdayHeaders,
    isSameDay,
  } from "@typescript-calendar-lib/core";
  import { formatCellLabel } from "@typescript-calendar-lib/web";
  import { getCellClasses } from "./cell-classes.js";
  import type { CalendarSize } from "./size.js";
  import { buildSizeStyle, isSizeName } from "./size.js";
  import type { CSSProperties } from "./style.js";
  import { styleObjectToString } from "./style.js";
  import type {
    ColorSchemeName,
    SvelteColorScheme,
    SvelteTheme,
    ThemeName,
  } from "./themes.js";
  import { resolveColorScheme, resolveTheme } from "./themes.js";

  interface CalendarProps {
    year: number;
    month: number;
    locale?: CalendarOptions["locale"];
    holidayLocale?: CalendarOptions["holidayLocale"];
    weekStart?: CalendarOptions["weekStart"];
    highlight?: Date;
    /** 範囲強調 */
    range?: { from: Date; to: Date };
    /** 範囲プレビュー（ホバー等の候補範囲）。is-in-range-preview クラスで視覚化される */
    rangePreview?: { from: Date; to: Date };
    /** 今日の基準日。カラースキームの today 着色に使用 */
    today?: Date;
    /** 選択済み日付。該当セルに is-selected クラスが付き、interactive 時は button に aria-pressed が付く */
    selected?: Date | null;
    /** カーソル位置の日付。該当セルに is-cursor クラスが付く */
    cursorDate?: Date | null;
    /** ホバー中の日付。該当セルに is-hovered クラスが付く */
    hoveredDate?: Date | null;
    /** 見た目テーマ。既定は "default" */
    theme?: ThemeName | SvelteTheme;
    /** カラースキーム。既定は "default" */
    colorScheme?: ColorSchemeName | SvelteColorScheme;
    /** セルサイズ。既定は "md"。{ width, height } で自由に指定できる */
    size?: CalendarSize;
    /** 狭い画面（スマホ等）でセルサイズと余白を自動調整する。既定は false（無効） */
    responsive?: boolean;
    /** 行の先頭に週番号を表示する。既定は false（非表示） */
    showWeekNumbers?: boolean;
    /** root 要素に追加するスタイル。CSS変数（--cal-*）で自由に上書きできる */
    style?: CSSProperties;

    // ── インタラクション ──

    /** インタラクティブモードを有効にする。セルクリック・ホバー・キーボード選択が可能になる */
    interactive?: boolean;
    /** セルクリック時のコールバック。第2引数に該当日のデータ（cellData の戻り値）が渡る */
    onDateClick?: (date: Date, data?: unknown) => void;
    /** セルホバー時のコールバック */
    onDateHover?: (date: Date) => void;
    /** カレンダーからマウスが離れたときのコールバック */
    onDateLeave?: () => void;
    /** キーボード操作。root 要素で発火（矢印キー等を InteractiveCalendar が処理する） */
    onkeydown?: (event: KeyboardEvent) => void;

    // ── セル状態 ──

    /** セル内容のカスタムレンダリング。interactive 時は button の子として描画される。第4引数に該当日のデータが渡る */
    renderCell?: (
      day: number,
      date: Date,
      state: CalendarCellState,
      data?: unknown,
    ) => string;
    /** 各セルに付与するユーザー定義データを解決する関数。実セルのみに呼ばれる */
    cellData?: (date: Date) => unknown;
    /** 選択不可日付の判定。true を返した日付は is-disabled クラスになり、インタラクティブ時は選択・ホバーできなくなる */
    isDateDisabled?: (date: Date) => boolean;
  }

  let {
    year,
    month,
    locale = "en",
    holidayLocale,
    weekStart = "sunday",
    highlight,
    range,
    rangePreview,
    today,
    selected,
    cursorDate,
    hoveredDate,
    theme = "default",
    colorScheme = "default",
    size = "md",
    responsive = false,
    showWeekNumbers = false,
    style,
    interactive = false,
    onDateClick,
    onDateHover,
    onDateLeave,
    onkeydown,
    renderCell,
    cellData,
    isDateDisabled,
  }: CalendarProps = $props();

  const cellDate = (day: number): Date => createDate(year, month - 1, day);
  const cellState = (day: number): CalendarCellState =>
    getCalendarCellState(cellDate(day), { today, holidayLocale, highlight, range, isDateDisabled });
  const cellClass = (day: number): string | undefined =>
    getCellClasses(cellDate(day), {
      today,
      holidayLocale,
      highlight,
      range,
      rangePreview,
      selected,
      cursorDate,
      hoveredDate,
      isDateDisabled,
    }) || undefined;
  const isDisabledDay = (day: number): boolean => cellState(day).isDisabled;
  const isSelectedDay = (day: number): boolean =>
    selected != null && isSameDay(cellDate(day), selected);
  const isTodayDay = (day: number): boolean =>
    today != null && isSameDay(cellDate(day), today);
  const isCursorDay = (day: number): boolean =>
    cursorDate != null && isSameDay(cellDate(day), cursorDate);
  const weekOf = (row: (number | null)[]): number | null => {
    const firstIdx = row.findIndex((d) => d !== null);
    if (firstIdx === -1) return null;
    const firstDate = createDate(year, month - 1, row[firstIdx]!);
    const weekStartDate = addDays(firstDate, -firstIdx);
    return weekStart === "monday"
      ? getISOWeek(weekStartDate)
      : getWeekOfYear(weekStartDate);
  };
  const handleCellClick = (day: number) => {
    if (interactive && onDateClick) {
      const date = cellDate(day);
      onDateClick(date, cellData?.(date));
    }
  };
  const handleCellHover = (day: number) => {
    if (interactive && onDateHover) onDateHover(cellDate(day));
  };
  const handleMouseLeave = () => {
    if (interactive && onDateLeave) onDateLeave();
  };

  // style 属性は文字列のみ受け付けるためオブジェクトを直列化する（--cal-* 変数含む）
  const rootStyle = $derived(
    styleObjectToString({
      ...resolveColorScheme(colorScheme),
      ...buildSizeStyle(size),
      ...style,
    }),
  );
</script>

<div
  class="calendar {resolveTheme(theme).className}{isSizeName(size) ? ` calendar-size-${size}` : ""}{interactive ? " calendar-interactive" : ""}{responsive ? " calendar-responsive" : ""}"
  style={rootStyle}
  role={interactive ? "group" : undefined}
  onmouseleave={interactive ? handleMouseLeave : undefined}
  onkeydown={onkeydown}
>
  <div class="calendar-header">
    <h2>{getMonthName(locale, month)} {year}</h2>
  </div>
  <table aria-label={`${getMonthName(locale, month)} ${year}`}>
    <thead>
      <tr>
        {#if showWeekNumbers}
          <th class="calendar-week" scope="col" aria-label="Week number"></th>
        {/if}
        {#each getWeekdayHeaders(locale, weekStart) as day (day)}
          <th scope="col">{day}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each buildMonthGrid(year, month, weekStart) as row, i (i)}
        {#if !row.every((d) => d === null)}
          <tr>
            {#if showWeekNumbers}
              <th class="calendar-week" scope="row">{weekOf(row)}</th>
            {/if}
            {#each row as day, j (j)}
              {#if day === null}
                <td></td>
              {:else}
                <td
                  class={cellClass(day)}
                  aria-current={isTodayDay(day) ? "date" : undefined}
                  aria-disabled={isDisabledDay(day) || undefined}
                >
                  {#if interactive}
                    <button
                      type="button"
                      class="calendar-day-btn"
                      onclick={isDisabledDay(day) ? undefined : () => handleCellClick(day)}
                      onmouseenter={isDisabledDay(day) ? undefined : () => handleCellHover(day)}
                      tabindex={isCursorDay(day) ? 0 : -1}
                      data-cursor={isCursorDay(day) ? "true" : undefined}
                      aria-label={formatCellLabel(locale, year, month, day)}
                      aria-pressed={isSelectedDay(day)}
                      disabled={isDisabledDay(day)}
                    >
                      {#if renderCell}
                        {renderCell(day, cellDate(day), cellState(day), cellData?.(cellDate(day)))}
                      {:else}
                        {day}
                      {/if}
                    </button>
                  {:else if renderCell}
                    {renderCell(day, cellDate(day), cellState(day), cellData?.(cellDate(day)))}
                  {:else}
                    {day}
                  {/if}
                </td>
              {/if}
            {/each}
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</div>