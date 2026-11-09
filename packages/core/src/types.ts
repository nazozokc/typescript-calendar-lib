export type Locale = "en" | "ja" | "es" | "de" | "fr" | "ko" | "zh";

/**
 * 祝日判定に使うロケール（国）。現在は 7 ロケールすべてに規則があるが、
 * 移動祝日（イースター系など）は未対応で固定日祝日のみを返す。
 */
export type HolidayLocale = Locale;
export type WeekStart = "sunday" | "monday";
export type HighlightStyle = "bracket" | "reverse";

interface BaseCalendarOptions {
  locale?: Locale;
  /** 祝日判定に使うロケール。省略時は "ja"（日本の祝日） */
  holidayLocale?: HolidayLocale;
  weekStart?: WeekStart;
  highlight?: Date;
  highlightStyle?: HighlightStyle;
  range?: { from: Date; to: Date };
  color?: boolean;
}

export interface CalendarOptions extends BaseCalendarOptions {
  year: number;
  month: number;
}

export interface CalendarYearOptions extends BaseCalendarOptions {
  year: number;
}

export interface CalendarRangeOptions extends BaseCalendarOptions {
  from: Date;
  to: Date;
}

export interface RenderMonthOptions extends BaseCalendarOptions {}
