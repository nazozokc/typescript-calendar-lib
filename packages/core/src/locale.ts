import type { Locale, WeekStart } from "./types.ts";
import { assertValidMonth, assertValidWeekStart } from "./validation.ts";

export interface LocaleData {
  months: readonly string[];
  weekdays: readonly string[];
  weekdaysShort: readonly string[];
  weekdaysMonday: readonly string[];
  weekdaysMondayShort: readonly string[];
}

/** 月曜始まりの配列は日曜始まりの配列を前ローテーションして生成する */
function makeLocale(
  months: readonly string[],
  weekdays: readonly string[],
  weekdaysShort: readonly string[] = weekdays,
): LocaleData {
  const rotate = (arr: readonly string[]) => [...arr.slice(1), arr[0]!];
  return {
    months,
    weekdays,
    weekdaysShort,
    weekdaysMonday: rotate(weekdays),
    weekdaysMondayShort: rotate(weekdaysShort),
  };
}

export const LOCALES: Record<Locale, LocaleData> = {
  en: makeLocale(
    [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  ),
  ja: makeLocale(
    [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ],
    ["日", "月", "火", "水", "木", "金", "土"],
  ),
  es: makeLocale(
    [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ],
    ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
    ["do", "lu", "ma", "mi", "ju", "vi", "sá"],
  ),
  de: makeLocale(
    [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ],
    ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  ),
  fr: makeLocale(
    [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ],
    ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
    ["di", "lu", "ma", "me", "je", "ve", "sa"],
  ),
  ko: makeLocale(
    [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ],
    ["일", "월", "화", "수", "목", "금", "토"],
  ),
  zh: makeLocale(
    [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ],
    ["日", "一", "二", "三", "四", "五", "六"],
  ),
};

/** ロケールデータを取得する（未知のロケールは RangeError） */
export function getLocaleData(locale: Locale): LocaleData {
  const data = LOCALES[locale];
  if (data === undefined) {
    throw new RangeError(`Invalid locale: "${locale}"`);
  }
  return data;
}

export function getWeekdayHeaders(
  locale: Locale,
  weekStart: WeekStart,
): readonly string[] {
  assertValidWeekStart(weekStart);
  const data = getLocaleData(locale);
  return weekStart === "monday" ? data.weekdaysMonday : data.weekdays;
}

export function getMonthName(locale: Locale, month: number): string {
  assertValidMonth(month);
  const data = getLocaleData(locale);
  return data.months[month - 1]!;
}
