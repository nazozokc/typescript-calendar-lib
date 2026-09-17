import type {
  CalendarCellState,
  CalendarOptions as CoreCalendarOptions,
  CalendarRangeOptions as CoreCalendarRangeOptions,
  CalendarYearOptions as CoreCalendarYearOptions,
  RenderMonthOptions as CoreRenderMonthOptions,
} from "@typescript-calendar-lib/core";
import type {
  CliPalette,
  CliTheme,
  ColorSchemeName,
  ThemeName,
} from "./theme.ts";

/** CLI 固有のオプション（core のオプションに追加で受け付ける） */
export interface CliExtraOptions {
  /** 見た目テーマ。既定は "default" */
  theme?: ThemeName | CliTheme;
  /** カラースキーム。color: true のとき有効。既定は "default" */
  colorScheme?: ColorSchemeName | CliPalette;
  /** 今日の基準日。カラースキームの today 着色に使用 */
  today?: Date;
  /** 各セルに付与するユーザー定義データを解決する関数。実セルのみに呼ばれる */
  cellData?: (date: Date) => unknown;
  /** セル内容のカスタム描画。受け取った文字列がそのままセルに使われる（幅・ANSI は呼び出し側で調整） */
  renderCell?: (
    day: number,
    date: Date,
    state: CalendarCellState,
    data?: unknown,
  ) => string;
}

export type CalendarOptions = CoreCalendarOptions & CliExtraOptions;
export type CalendarYearOptions = CoreCalendarYearOptions & CliExtraOptions;
export type CalendarRangeOptions = CoreCalendarRangeOptions & CliExtraOptions;
export type RenderMonthOptions = CoreRenderMonthOptions & CliExtraOptions;
