import type { Locale, WeekStart } from "./types.ts";
import { assertValidMonth, assertValidWeekStart } from "./validation.ts";

export interface LocaleData {
  /** 完全な月名（例: "September", "9月"） */
  months: readonly string[];
  /** 短縮月名（例: "Sep", "9月"） */
  monthsShort: readonly string[];
  /** 短縮曜日名（例: "Sun", "日"） */
  weekdays: readonly string[];
  /** 極短曜日名（例: "Su", "日"） */
  weekdaysShort: readonly string[];
  /** 完全曜日名（例: "Sunday", "日曜日"） */
  weekdaysLong: readonly string[];
  weekdaysMonday: readonly string[];
  weekdaysMondayShort: readonly string[];
}

/** 月曜始まりの配列は日曜始まりの配列を前ローテーションして生成する */
function makeLocale(
  months: readonly string[],
  weekdays: readonly string[],
  weekdaysShort: readonly string[] = weekdays,
  monthsShort: readonly string[] = months,
  weekdaysLong: readonly string[] = weekdays,
): LocaleData {
  const rotate = (arr: readonly string[]) => [...arr.slice(1), arr[0]!];
  return {
    months,
    monthsShort,
    weekdays,
    weekdaysShort,
    weekdaysLong,
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
    [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
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
    ["日", "月", "火", "水", "木", "金", "土"],
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
    ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
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
    [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sept",
      "oct",
      "nov",
      "dic",
    ],
    ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
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
    ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    [
      "Jan.",
      "Feb.",
      "März",
      "Apr.",
      "Mai",
      "Juni",
      "Juli",
      "Aug.",
      "Sept.",
      "Okt.",
      "Nov.",
      "Dez.",
    ],
    [
      "Sonntag",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
    ],
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
    [
      "janv.",
      "févr.",
      "mars",
      "avr.",
      "mai",
      "juin",
      "juil.",
      "août",
      "sept.",
      "oct.",
      "nov.",
      "déc.",
    ],
    ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
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
    ["일", "월", "화", "수", "목", "금", "토"],
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
    ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
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
    ["日", "一", "二", "三", "四", "五", "六"],
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
    ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
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
