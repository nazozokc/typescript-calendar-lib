<script lang="ts">
  import type { CalendarCellState, CalendarOptions } from "@typescript-calendar-lib/core";
  import {
    buildMonthGrid,
    createDate,
    getCalendarCellState,
    getISOWeek,
    getMonthName,
    getWeekOfYear,
    getWeekdayHeaders,
    getYearMonth,
    isSameDay,
  } from "@typescript-calendar-lib/core";
  import {
    formatCellLabel,
    getBlankClasses,
    getCellStateClasses,
    getFocusDate,
    getSelectionCellClasses,
    joinCellClassLists,
    uiString,
  } from "@typescript-calendar-lib/web";
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
  import type { Snippet } from "svelte";
  import {
    mergeColorScheme,
    resolveAutoColorScheme,
    resolveTheme,
  } from "./themes.js";

  interface CalendarProps {
    /**
     * 表示する年月を `Date` で指定する。`year` / `month` の代わりに使える
     * （両方を併用した場合は `date` を優先する）。
     */
    date?: Date;
    /** 表示する年。`date` 省略時は `month` と併せて必須 */
    year?: number;
    /** 表示する月 (1–12)。`date` 省略時は `year` と併せて必須 */
    month?: number;
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
    /** 選択済み日付。該当セルに is-selected クラスが付く */
    selected?: Date | null;
    /** React と同じ名前で選択日を渡せるエイリアス。指定時は selected より優先される */
    selectedDate?: Date | null;
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
    /** root 要素に追加するクラス。レイアウトや追加スタイルのフックに使う */
    class?: string;
    /** root 要素に追加するスタイル。CSS変数（--cal-*）で自由に上書きできる */
    style?: CSSProperties;
    /** 見出しの左側に置く操作要素（前月ボタンや月・年選択など） */
    headerStart?: Snippet;
    /** 見出しの右側に置く操作要素（翌月ボタンや Today など） */
    headerEnd?: Snippet;

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
  /** スワイプ判定用のポインタイベント */
  onpointerdown?: (event: PointerEvent) => void;
  /** スワイプ判定用のポインタイベント */
  onpointerup?: (event: PointerEvent) => void;
  /** スワイプの中止 */
  onpointercancel?: () => void;

    // ── セル状態 ──

    /**
     * セル内容のカスタムレンダリング。interactive 時は button の子として描画される。
     * Snippet（markup）または文字列のどちらでも受け付ける。第4引数に該当日のデータが渡る。
     */
    renderCell?: (
      day: number,
      date: Date,
      state: CalendarCellState,
      data?: unknown,
    ) => string | Snippet;
    /** 各セルに付与するユーザー定義データを解決する関数。実セルのみに呼ばれる */
    cellData?: (date: Date) => unknown;
    /** 選択不可日付の判定。true を返した日付は is-disabled クラスになり、インタラクティブ時は選択・ホバーできなくなる */
    isDateDisabled?: (date: Date) => boolean;
  }

  let {
    date: dateProp,
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
    selectedDate,
    cursorDate,
    hoveredDate,
    theme = "default",
    colorScheme = "default",
    size = "md",
    responsive = false,
    showWeekNumbers = false,
    class: className,
    style,
    headerStart,
    headerEnd,
    interactive = false,
    onDateClick,
    onDateHover,
    onDateLeave,
    onkeydown,
    onpointerdown,
    onpointerup,
    onpointercancel,
    renderCell,
    cellData,
    isDateDisabled,
  }: CalendarProps = $props();

  // date が指定されればそれを優先し、なければ year/month を使う。
  // どちらも揃っていない場合は、黙って現在月を出さずに即座に失敗させる。
  const yearMonth = $derived.by(() => {
    if (dateProp !== undefined) return getYearMonth(dateProp);
    if (year !== undefined && month !== undefined) return { year, month };
    throw new TypeError(
      "Calendar requires either `date` or both `year` and `month`.",
    );
  });

  // interactive 時のみ APG の grid セマンティクスを付与する。静的表示では
  // ネイティブの table/cell セマンティクスをそのまま使う。
  const gridCellRole = $derived(interactive ? "gridcell" : undefined);
  // h2 に一意な id を振り、table は aria-labelledby で参照する。
  // $props.id() を使うのは同じ月のカレンダーが複数同時に置かれた場合に
  // id が衝突し aria-labelledby が別のカレンダーを見指すため。
  const headingId = $props.id();
  // $props.id() は 1 インスタンス 1 回しか呼べないため、一意な id から派生させる
  const hintId = `${headingId}-hint`;
  // cursorDate が無い / 月外 / 選択不可でも 1 つだけ Tab で到達できるようにする
  const focusDate = $derived(
    getFocusDate({
      year: yearMonth.year,
      month: yearMonth.month,
      cursorDate,
      today,
      isDateDisabled,
    }),
  );

  // React と名前を揃えたい consumer 向けのエイリアス。selected より優先する。
  const effectiveSelected = $derived(
    selectedDate !== undefined ? selectedDate : selected,
  );

  // "auto" は OS の prefers-color-scheme に追従する。SSR では light 相当。
  let prefersDark = $state(false);
  $effect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => (prefersDark = query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  });
  const effectiveColorScheme = $derived(
    resolveAutoColorScheme(colorScheme, prefersDark),
  );

  const cellDate = (day: number): Date =>
    createDate(yearMonth.year, yearMonth.month - 1, day);

  /**
   * 1セルぶんの表示データ（Date・状態・クラス・aria 用の状態）を1回の計算でまとめる。
   * テンプレートはこの結果だけを参照するので、セルあたりの状態計算は1回になる。
   */
  interface DayCell {
    date: Date;
    state: CalendarCellState;
    className: string | undefined;
    isSelected: boolean;
    isCursor: boolean;
    isDisabled: boolean;
  }

  const dayCell = (day: number): DayCell => {
    const date = cellDate(day);
    const state = getCalendarCellState(date, {
      today,
      holidayLocale,
      highlight,
      range,
      isDateDisabled,
    });
    const className =
      joinCellClassLists(
        getCellStateClasses(state),
        getSelectionCellClasses(date, {
          range,
          rangePreview,
          hoveredDate,
          selected: effectiveSelected,
          cursorDate: focusDate,
        }),
      ) || undefined;
    return {
      date,
      state,
      className,
      isSelected: effectiveSelected != null && isSameDay(date, effectiveSelected),
      isCursor: focusDate != null && isSameDay(date, focusDate),
      isDisabled: state.isDisabled,
    };
  };

  /**
   * renderCell の戻り値が Snippet なら {@render}、文字列ならテキストとして扱う。
   * Svelte 5 の Snippet は関数なので typeof で判別できる。
   */
  const isSnippet = (value: string | Snippet): value is Snippet =>
    typeof value === "function";
  const weekOf = (row: (number | null)[]): number | null => {
    const firstIdx = row.findIndex((d) => d !== null);
    if (firstIdx === -1) return null;
    const firstDate = createDate(
      yearMonth.year,
      yearMonth.month - 1,
      row[firstIdx]!,
    );
    // 行の先頭実セルを基準にする。週開始日に戻すと 1 月の先頭行が前年の
    // 最終週（53）として表示されてしまう。
    return weekStart === "monday"
      ? getISOWeek(firstDate)
      : getWeekOfYear(firstDate);
  };
  const handleCellClick = (cell: DayCell) => {
    if (interactive && onDateClick) {
      onDateClick(cell.date, cellData?.(cell.date));
    }
  };
  const handleCellHover = (cell: DayCell) => {
    if (interactive && onDateHover) onDateHover(cell.date);
  };
  const handleMouseLeave = () => {
    if (interactive && onDateLeave) onDateLeave();
  };

  // グリッド・曜日ヘッダーは月単位で不変。$derived なので年月が変わったときだけ再計算される
  const grid = $derived(
    buildMonthGrid(yearMonth.year, yearMonth.month, weekStart),
  );
  const weekdays = $derived(getWeekdayHeaders(locale, weekStart));
  // 週番号は表示時のみ計算する。グリッドと同じ月単位の依存
  const weekNumbers = $derived(showWeekNumbers ? grid.map(weekOf) : null);
  // 行ヘッダーの accessible name は行ごとに一意でなければ識別できないため
  // ラベル＋週番号を組み合わせる（aria-label が内容の数字を上書きしないように）。
  // 関数にして locale・weekNumbers を追跡する
  const weekAriaLabel = (i: number): string | undefined =>
    weekNumbers !== null
      ? `${uiString("weekNumber", locale)} ${weekNumbers[i]}`
      : undefined;

  // style 属性は文字列のみ受け付けるためオブジェクトを直列化する（--cal-* 変数含む）
  const rootStyle = $derived(
    styleObjectToString({
      ...mergeColorScheme(effectiveColorScheme),
      ...buildSizeStyle(size),
      ...style,
    }),
  );

  const rootClass = $derived(
    [
      "calendar",
      resolveTheme(theme).className,
      isSizeName(size) ? `calendar-size-${size}` : "",
      interactive ? "calendar-interactive" : "",
      responsive ? "calendar-responsive" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" "),
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- onmouseleave はホバー状態クリア用の補助イベント。root 自体は widget
     ではないため ARIA role は持たない。onkeydown はナビゲーション要素
     （select/button）のキー操作を奪わないよう table 側に付ける。 -->
<div
  class={rootClass}
  style={rootStyle}
  onmouseleave={interactive ? handleMouseLeave : undefined}
  onpointerdown={onpointerdown}
  onpointerup={onpointerup}
  onpointercancel={onpointercancel}
>
  <div class="calendar-header">
    {#if headerStart}
      <div class="calendar-nav">{@render headerStart()}</div>
    {/if}
    <!--
      見出しをそのまま live region にする。別の要素に同じ文言を複製すると
      アクセシビリティツリー上で月名が二重に存在するため。
      interactive 時は月が変わったことをここで読み上げる（APG Date Picker Dialog）。
    -->
    <h2
      id={headingId}
      aria-live={interactive ? "polite" : undefined}
      aria-atomic={interactive ? "true" : undefined}
    >
      {getMonthName(locale, yearMonth.month)} {yearMonth.year}
    </h2>
    {#if headerEnd}
      <div class="calendar-nav">{@render headerEnd()}</div>
    {/if}
    {#if interactive}
      <span id={hintId} class="calendar-sr-only">
        {uiString("keyboardHint", locale)}
      </span>
    {/if}
  </div>
  <!-- interactive 時のみ APG の grid セマンティクスを付与する。静的表示では
        ネイティブの table/cell セマンティクスをそのまま使う。 -->
  <table
    role={interactive ? "grid" : undefined}
    aria-labelledby={headingId}
    aria-describedby={interactive ? hintId : undefined}
    onkeydown={onkeydown}
  >
    <thead>
      <tr>
        {#if showWeekNumbers}
          <th class="calendar-week" scope="col" aria-label={uiString("weekNumber", locale)}></th>
        {/if}
        {#each weekdays as day (day)}
          <th scope="col">{day}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each grid as row, i (i)}
        {#if !row.every((d) => d === null)}
          <tr>
            {#if showWeekNumbers}
              <th
                class="calendar-week"
                scope="row"
                aria-label={weekAriaLabel(i)}
              >{#if weekNumbers !== null}{weekNumbers[i]}{/if}</th>
            {/if}
            {#each row as day, j (j)}
              {#if day === null}
                <td role={gridCellRole} class={getBlankClasses()}></td>
              {:else}
                {@const cell = dayCell(day)}
                <td
                  role={gridCellRole}
                  class={cell.className}
                  aria-selected={cell.isSelected || undefined}
                  aria-current={cell.state.isToday ? "date" : undefined}
                  aria-disabled={cell.isDisabled || undefined}
                >
                  {#if interactive}
                    <button
                      type="button"
                      class="calendar-day-btn"
                      onclick={cell.isDisabled ? undefined : () => handleCellClick(cell)}
                      onmouseenter={cell.isDisabled ? undefined : () => handleCellHover(cell)}
                      tabindex={cell.isCursor ? 0 : -1}
                      data-cursor={cell.isCursor ? "true" : undefined}
                      aria-label={formatCellLabel(
                        locale,
                        yearMonth.year,
                        yearMonth.month,
                        day,
                      )}
                      disabled={cell.isDisabled}
                    >
                      {#if renderCell}
                        {@const rendered = renderCell(day, cell.date, cell.state, cellData?.(cell.date))}
                        {#if isSnippet(rendered)}
                          {@render rendered()}
                        {:else}
                          {rendered}
                        {/if}
                      {:else}
                        {day}
                      {/if}
                    </button>
                  {:else if renderCell}
                    {@const rendered = renderCell(day, cell.date, cell.state, cellData?.(cell.date))}
                    {#if isSnippet(rendered)}
                      {@render rendered()}
                    {:else}
                      {rendered}
                    {/if}
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