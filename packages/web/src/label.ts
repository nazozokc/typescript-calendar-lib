// ─── スクリーンリーダー向けのラベル ──────────────────────────

import { createDate, type Locale } from "@typescript-calendar-lib/core";

/** Intl が 지원하는ロケールタグ（core の Locale → BCP 47） */
const INTL_LOCALES: Record<Locale, string> = {
  en: "en-US",
  ja: "ja-JP",
  es: "es-ES",
  de: "de-DE",
  fr: "fr-FR",
  ko: "ko-KR",
  zh: "zh-CN",
};

const dateTimeFormatters = new Map<Locale, Intl.DateTimeFormat>();

function formatterFor(locale: Locale): Intl.DateTimeFormat {
  const cached = dateTimeFormatters.get(locale);
  if (cached) return cached;
  // ics/environment によって ICU データが欠けていても、throw してカレンダー全体を
  // 壊さないようフォールバックする。
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
      dateStyle: "long",
    });
  } catch {
    formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });
  }
  dateTimeFormatters.set(locale, formatter);
  return formatter;
}

/**
 * セルの `aria-label` を組み立てる（例: "September 15, 2026" / "2026年9月15日"）。
 *
 * `Intl.DateTimeFormat` に委譲するため、ロケールごとの日付表記規約（日本語の
 * `年/月/日`、 Stem が前置されるフランス語など）に従う。手書きの連結は
 * ロケール間で語順の誤りが起きるため使わない。
 */
export function formatCellLabel(
  locale: Locale,
  year: number,
  month: number,
  day: number,
): string {
  return formatterFor(locale).format(createDate(year, month - 1, day));
}

/** UI 部品のスクリーンリーダー向け名称 */
export const UI_STRINGS = {
  /** 週番号列のヘッダ */
  weekNumber: {
    en: "Week number",
    ja: "週番号",
    es: "Número de semana",
    de: "Kalenderwoche",
    fr: "Numéro de semaine",
    ko: "주 번호",
    zh: "周数",
  },
  /** 選択中の範囲をスクリーンリーダーに伝える接頭辞 */
  selectedRange: {
    en: "Selected",
    ja: "選択中",
    es: "Seleccionado",
    de: "Ausgewählt",
    fr: "Sélectionné",
    ko: "선택됨",
    zh: "已选择",
  },
  /** 今日のマスを表す語 */
  today: {
    en: "today",
    ja: "今日",
    es: "hoy",
    de: "heute",
    fr: "aujourd'hui",
    ko: "오늘",
    zh: "今天",
  },
  /** 休日のマスを表す語 */
  holiday: {
    en: "holiday",
    ja: "祝日",
    es: "festivo",
    de: "Feiertag",
    fr: "jour férié",
    ko: "공휴일",
    zh: "假日",
  },
} as const satisfies Record<string, Record<Locale, string>>;

/** ロケールに対応する UI 文字列を参照する */
export function uiString(key: keyof typeof UI_STRINGS, locale: Locale): string {
  return UI_STRINGS[key][locale];
}
