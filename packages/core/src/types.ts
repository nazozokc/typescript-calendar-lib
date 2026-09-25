export type Locale = "en" | "ja" | "es" | "de" | "fr" | "ko" | "zh";
export type WeekStart = "sunday" | "monday";
export type HighlightStyle = "bracket" | "reverse";

interface BaseCalendarOptions {
  locale?: Locale;
  /** 祝日判定に使うロケール。省略時は "ja"（日本の祝日） */
  holidayLocale?: Locale;
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
