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
  /** キーボード操作の説明（table の aria-describedby から参照する） */
  keyboardHint: {
    en: "Use arrow keys to move, Enter or Space to select, Page Up or Down to change month, Escape to clear.",
    ja: "矢印キーで移動、Enter または Space で選択、Page Up / Down で月移動、Escape で解除。",
    es: "Usa las flechas para moverte, Intro o Espacio para seleccionar, Re Pág o Av Pág para cambiar de mes y Escape para borrar.",
    de: "Mit den Pfeiltasten navigieren, mit Eingabe oder Leertaste auswählen, mit Bild Auf oder Bild Ab den Monat wechseln und mit Escape löschen.",
    fr: "Utilisez les flèches pour vous déplacer, Entrée ou Espace pour sélectionner, Page précédente ou suivante pour changer de mois et Échap pour effacer.",
    ko: "화살표 키로 이동하고 Enter 또는 Space로 선택하며 Page Up / Down으로 월을 바꾸고 Escape로 해제합니다.",
    zh: "使用方向键移动，Enter 或空格选择，Page Up / Down 切换月份，Escape 清除。",
  },
  /** 前月ボタンの aria-label */
  previousMonth: {
    en: "Previous month",
    ja: "前の月",
    es: "Mes anterior",
    de: "Vorheriger Monat",
    fr: "Mois précédent",
    ko: "이전 달",
    zh: "上个月",
  },
  /** 翌月ボタンの aria-label */
  nextMonth: {
    en: "Next month",
    ja: "次の月",
    es: "Mes siguiente",
    de: "Nächster Monat",
    fr: "Mois suivant",
    ko: "다음 달",
    zh: "下个月",
  },
  /** 今日へ移動するボタンの aria-label */
  goToToday: {
    en: "Go to today",
    ja: "今日へ移動",
    es: "Ir a hoy",
    de: "Zu heute",
    fr: "Aller à aujourd'hui",
    ko: "오늘로 이동",
    zh: "跳到今天",
  },
  /** 月選択の aria-label */
  month: {
    en: "Month",
    ja: "月",
    es: "Mes",
    de: "Monat",
    fr: "Mois",
    ko: "월",
    zh: "月份",
  },
  /** 年選択の aria-label */
  year: {
    en: "Year",
    ja: "年",
    es: "Año",
    de: "Jahr",
    fr: "Année",
    ko: "년",
    zh: "年份",
  },
} as const satisfies Record<string, Record<Locale, string>>;

/** ロケールに対応する UI 文字列を参照する */
export function uiString(key: keyof typeof UI_STRINGS, locale: Locale): string {
  return UI_STRINGS[key][locale];
}
