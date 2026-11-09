// ─── 日本以外の固定日祝日 ─────────────────────────────────
//
// 祝日を「その年の祝日一覧を返す純関数」として表す。
// 日本（ja）の規則は振替休日・国民の休日・春分/秋分を含むため holidays.ts 側に残し、
// ここでは固定日の規則だけを持つロケールを定義する。
//
// 移動祝日（イースター系・第 n 月曜など）は未対応。該当する祝日は一覧に含まれない。

import type { HolidayLocale } from "./types.ts";

/** 年の祝日一覧の1件（month は 1-12） */
export interface YearHoliday {
  month: number;
  day: number;
  name: string;
}

/** 年を引数に祝日一覧を返す規則 */
export type HolidayRule = (year: number) => YearHoliday[];

/** 固定日祝日の定義。since/until は施行年（両端を含む） */
interface FixedHoliday {
  month: number;
  day: number;
  name: string;
  since?: number;
  until?: number;
}

/** 固定日祝日の一覧から HolidayRule を作る */
export function fixedHolidayRule(
  holidays: readonly FixedHoliday[],
): HolidayRule {
  return (year) =>
    holidays
      .filter(
        (holiday) =>
          (holiday.since === undefined || year >= holiday.since) &&
          (holiday.until === undefined || year <= holiday.until),
      )
      .map(({ month, day, name }) => ({ month, day, name }));
}

/** アメリカ合衆国（連邦の固定日祝日） */
export const US_HOLIDAYS: HolidayRule = fixedHolidayRule([
  { month: 1, day: 1, name: "New Year's Day", since: 1871 },
  { month: 6, day: 19, name: "Juneteenth", since: 2021 },
  { month: 7, day: 4, name: "Independence Day", since: 1776 },
  { month: 11, day: 11, name: "Armistice Day", since: 1919, until: 1953 },
  { month: 11, day: 11, name: "Veterans Day", since: 1954 },
  { month: 12, day: 25, name: "Christmas Day", since: 1870 },
]);

/** ドイツ（全国共通の固定日祝日） */
export const DE_HOLIDAYS: HolidayRule = fixedHolidayRule([
  { month: 1, day: 1, name: "Neujahr" },
  { month: 5, day: 1, name: "Tag der Arbeit", since: 1933 },
  { month: 10, day: 3, name: "Tag der Deutschen Einheit", since: 1990 },
  { month: 12, day: 25, name: "1. Weihnachtstag" },
  { month: 12, day: 26, name: "2. Weihnachtstag" },
]);

/** フランス（全国共通の固定日祝日） */
export const FR_HOLIDAYS: HolidayRule = fixedHolidayRule([
  { month: 1, day: 1, name: "Jour de l'An" },
  { month: 5, day: 1, name: "Fête du Travail" },
  { month: 5, day: 8, name: "Victoire 1945", since: 1953 },
  { month: 7, day: 14, name: "Fête Nationale" },
  { month: 8, day: 15, name: "Assomption" },
  { month: 11, day: 1, name: "Toussaint" },
  { month: 11, day: 11, name: "Armistice 1918" },
  { month: 12, day: 25, name: "Noël" },
]);

/** スペイン（全国共通の固定日祝日） */
export const ES_HOLIDAYS: HolidayRule = fixedHolidayRule([
  { month: 1, day: 1, name: "Año Nuevo" },
  { month: 1, day: 6, name: "Epifanía del Señor" },
  { month: 5, day: 1, name: "Fiesta del Trabajo" },
  { month: 8, day: 15, name: "Asunción de la Virgen" },
  { month: 10, day: 12, name: "Fiesta Nacional de España" },
  { month: 11, day: 1, name: "Todos los Santos" },
  { month: 12, day: 6, name: "Día de la Constitución Española", since: 1978 },
  { month: 12, day: 8, name: "Inmaculada Concepción" },
  { month: 12, day: 25, name: "Natividad del Señor" },
]);

/** 韓国（固定日の法定祝日） */
export const KO_HOLIDAYS: HolidayRule = fixedHolidayRule([
  { month: 1, day: 1, name: "신정" },
  { month: 3, day: 1, name: "삼일절", since: 1949 },
  { month: 5, day: 5, name: "어린이날", since: 1975 },
  { month: 6, day: 6, name: "현충일", since: 1956 },
  { month: 8, day: 15, name: "광복절", since: 1949 },
  { month: 10, day: 3, name: "개천절", since: 1949 },
  { month: 10, day: 9, name: "한글날", since: 1949, until: 1990 },
  { month: 10, day: 9, name: "한글날", since: 2013 },
  { month: 12, day: 25, name: "기독탄신일", since: 1949 },
]);

/** 中国（法定の固定日祝日。旧暦の祝日は未対応） */
export const ZH_HOLIDAYS: HolidayRule = fixedHolidayRule([
  { month: 1, day: 1, name: "元旦", since: 1949 },
  { month: 5, day: 1, name: "劳动节", since: 1950 },
  { month: 10, day: 1, name: "国庆节", since: 1950 },
  { month: 10, day: 2, name: "国庆节", since: 1950 },
  { month: 10, day: 3, name: "国庆节", since: 1950 },
]);

/** 日本以外のロケールの固定日祝日規則 */
export const FIXED_HOLIDAY_RULES: Record<
  Exclude<HolidayLocale, "ja">,
  HolidayRule
> = {
  en: US_HOLIDAYS,
  de: DE_HOLIDAYS,
  fr: FR_HOLIDAYS,
  es: ES_HOLIDAYS,
  ko: KO_HOLIDAYS,
  zh: ZH_HOLIDAYS,
};
