<script lang="ts">
  import type { CalendarCellState, CalendarOptions } from "@typescript-calendar-lib/core";
  import {
    buildMonthGrid,
    createDate,
    getCalendarCellState,
    getMonthName,
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
    weekStart?: CalendarOptions["weekStart"];
    highlight?: Date;
    /** 範囲強調 */
    range?: { from: Date; to: Date };
    /** 範囲プレビュー（ホバー等の候補範囲）。is-in-range-preview クラスで視覚化される */
    rangePreview?: { from: Date; to: Date };
    /** 今日の基準日。カラースキームの today 着色に使用 */
    today?: Date;
    /** 選択済み日付。該当セルに is-selected クラスと aria-selected が付く */
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
  }

  let {
    year,
    month,
    locale = "en",
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
    style,
    interactive = false,
    onDateClick,
    onDateHover,
    onDateLeave,
    onkeydown,
    renderCell,
    cellData,
  }: CalendarProps = $props();

  const cellDate = (day: number): Date => createDate(year, month - 1, day);
  const cellState = (day: number): CalendarCellState =>
    getCalendarCellState(cellDate(day), { today, highlight, range });
  const cellClass = (day: number): string | undefined =>
    getCellClasses(cellDate(day), {
      today,
      highlight,
      range,
      rangePreview,
      selected,
      cursorDate,
      hoveredDate,
    }) || undefined;
  const isSelectedDay = (day: number): boolean =>
    selected != null && isSameDay(cellDate(day), selected);
  const isTodayDay = (day: number): boolean =>
    today != null && isSameDay(cellDate(day), today);
  const isCursorDay = (day: number): boolean =>
    cursorDate != null && isSameDay(cellDate(day), cursorDate);
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
  class="calendar {resolveTheme(theme).className}{isSizeName(size) ? ` calendar-size-${size}` : ""}{interactive ? " calendar-interactive" : ""}"
  style={rootStyle}
  role={interactive ? "group" : undefined}
  onmouseleave={interactive ? handleMouseLeave : undefined}
  onkeydown={onkeydown}
>
  <div class="calendar-header">
    <h2>{getMonthName(locale, month)} {year}</h2>
  </div>
  <table>
    <thead>
      <tr>
        {#each getWeekdayHeaders(locale, weekStart) as day (day)}
          <th>{day}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each buildMonthGrid(year, month, weekStart) as row, i (i)}
        {#if !row.every((d) => d === null)}
          <tr>
            {#each row as day, j (j)}
              {#if day === null}
                <td></td>
              {:else}
                <td class={cellClass(day)}>
                  {#if interactive}
                    <button
                      type="button"
                      class="calendar-day-btn"
                      onclick={() => handleCellClick(day)}
                      onmouseenter={() => handleCellHover(day)}
                      tabindex={isCursorDay(day) ? 0 : -1}
                      data-cursor={isCursorDay(day) ? "true" : undefined}
                      aria-label={formatCellLabel(locale, year, month, day)}
                      aria-pressed={isSelectedDay(day) || undefined}
                      aria-current={isTodayDay(day) ? "date" : undefined}
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