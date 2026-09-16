<script lang="ts">
  import type { CalendarOptions } from "@typescript-calendar-lib/core";
  import {
    buildMonthGrid,
    createDate,
    getMonthName,
    getWeekdayHeaders,
    isSameDay,
  } from "@typescript-calendar-lib/core";
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
    /** 今日の基準日。カラースキームの today 着色に使用 */
    today?: Date;
    /** 選択済み日付。該当セルに is-selected クラスと aria-selected が付く */
    selected?: Date | null;
    /** カーソル位置の日付。該当セルに is-cursor クラスが付く */
    cursorDate?: Date | null;
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
    /** セルクリック時のコールバック */
    onDateClick?: (date: Date) => void;
    /** セルホバー時のコールバック */
    onDateHover?: (date: Date) => void;
  }

  let {
    year,
    month,
    locale = "en",
    weekStart = "sunday",
    highlight,
    range,
    today,
    selected,
    cursorDate,
    theme = "default",
    colorScheme = "default",
    size = "md",
    style,
    interactive = false,
    onDateClick,
    onDateHover,
  }: CalendarProps = $props();

  const cellDate = (day: number): Date => createDate(year, month - 1, day);
  const cellClass = (day: number): string | undefined =>
    getCellClasses(cellDate(day), {
      today,
      highlight,
      range,
      selected,
      cursorDate,
    }) || undefined;
  const isSelectedDay = (day: number): boolean =>
    selected != null && isSameDay(cellDate(day), selected);
  const isTodayDay = (day: number): boolean =>
    today != null && isSameDay(cellDate(day), today);
  const handleCellClick = (day: number) => {
    if (interactive && onDateClick) onDateClick(cellDate(day));
  };
  const handleCellHover = (day: number) => {
    if (interactive && onDateHover) onDateHover(cellDate(day));
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
                      tabindex="0"
                      aria-label={`${getMonthName(locale, month)} ${day}, ${year}`}
                      aria-pressed={isSelectedDay(day) || undefined}
                      aria-current={isTodayDay(day) ? "date" : undefined}
                    >
                      {day}
                    </button>
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