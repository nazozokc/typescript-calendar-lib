import { getLocaleData, getMonthName } from "./locale.ts";
import type { Locale, WeekStart } from "./types.ts";
import {
  assertValidDate,
  assertValidWeekStart,
  createDate,
} from "./validation.ts";

// ─── 日付演算 ─────────────────────────────────────────────

/** 加算量が整数であることを検証する */
function assertAmount(amount: number): void {
  if (!Number.isInteger(amount)) {
    throw new RangeError(`Invalid amount: ${amount} (expected an integer)`);
  }
}

/**
 * 日付に日数を加算する（負数で減算）。時刻は保持される。
 * `setDate` ベースの暦日加算のため DST 遷移でも 1 日ずれない。
 * 入力 Date は変更されず、新しい Date を返す。
 */
export function addDays(date: Date, amount: number): Date {
  assertValidDate(date);
  assertAmount(amount);
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + amount);
  return result;
}

/** 日付に週数を加算する（負数で減算）。addDays(date, amount * 7) と同じ */
export function addWeeks(date: Date, amount: number): Date {
  return addDays(date, amount * 7);
}

/**
 * 日付に月数を加算する（負数で減算）。時刻は保持される。
 * 月中旬の日付は月を跨いでも同じ日付を保つ（例: 1月15日 + 1ヶ月 = 2月15日）。
 * 移動先の月に存在しない日付は月末に丸められる
 * （例: 1月31日 + 1ヶ月 = 2月28日/29日、1月30日 + 1ヶ月 = 2月28日/29日）。
 */
export function addMonths(date: Date, amount: number): Date {
  assertValidDate(date);
  assertAmount(amount);
  const result = startOfDay(date);
  const targetDay = date.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + amount);
  const lastDay = daysInMonthOf(result);
  result.setDate(Math.min(targetDay, lastDay));
  // 時刻を復元する
  result.setHours(
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
  return result;
}

/** 日付に年数を加算する（負数で減算）。うるう日の 2月29日は 2月28日に丸められる */
export function addYears(date: Date, amount: number): Date {
  return addMonths(date, amount * 12);
}

/** 月の日数（1-31）を返す（Date 基準） */
function daysInMonthOf(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

// ─── 期間の境界 ───────────────────────────────────────────

/** その日の 00:00:00.000 を返す */
export function startOfDay(date: Date): Date {
  assertValidDate(date);
  return createDate(date.getFullYear(), date.getMonth(), date.getDate());
}

/** その日の 23:59:59.999 を返す */
export function endOfDay(date: Date): Date {
  const result = startOfDay(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/** 日付を含む週の初日（weekStart 曜日）の 00:00:00.000 を返す */
export function startOfWeek(date: Date, weekStart: WeekStart = "sunday"): Date {
  assertValidDate(date);
  assertValidWeekStart(weekStart);
  const day = startOfDay(date);
  const offset = weekStart === "sunday" ? day.getDay() : (day.getDay() + 6) % 7;
  return addDays(day, -offset);
}

/** 日付を含む週の最終日の 23:59:59.999 を返す（週末を含む範囲に便利） */
export function endOfWeek(date: Date, weekStart: WeekStart = "sunday"): Date {
  return endOfDay(addDays(startOfWeek(date, weekStart), 6));
}

/** 日付を含む月の初日の 00:00:00.000 を返す */
export function startOfMonth(date: Date): Date {
  assertValidDate(date);
  return createDate(date.getFullYear(), date.getMonth(), 1);
}

/** 日付を含む月の最終日の 23:59:59.999 を返す */
export function endOfMonth(date: Date): Date {
  return endOfDay(createDate(date.getFullYear(), date.getMonth() + 1, 0));
}

/** 日付を含む年の初日（1月1日）の 00:00:00.000 を返す */
export function startOfYear(date: Date): Date {
  assertValidDate(date);
  return createDate(date.getFullYear(), 0, 1);
}

/** 日付を含む年の最終日の 23:59:59.999 を返す */
export function endOfYear(date: Date): Date {
  return endOfDay(createDate(date.getFullYear(), 12, 0));
}

// ─── 差（暦日ベース） ─────────────────────────────────────

/** 日付の「日」部分を UTC 日数（epoch からの日数）に正規化する。DST や year 0-99 の影響を受けない */
function toUtcDays(date: Date): number {
  const utc = new Date(0);
  utc.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  return utc.getTime() / 86_400_000;
}

/**
 * 2つの日付の間の暦日数（to - from）を返す。マイナスもありうる。
 * 時刻は無視され、DST 遷移があっても 1 日単位の差は正しい。
 */
export function diffInCalendarDays(from: Date, to: Date): number {
  assertValidDate(from);
  assertValidDate(to);
  return toUtcDays(to) - toUtcDays(from);
}

/** 2つの日付の間の暦月数（to - from）を返す。マイナスもありうる */
export function diffInCalendarMonths(from: Date, to: Date): number {
  assertValidDate(from);
  assertValidDate(to);
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

/** 2つの日付の間の暦年数（to - from）を返す。マイナスもありうる */
export function diffInCalendarYears(from: Date, to: Date): number {
  assertValidDate(from);
  assertValidDate(to);
  return to.getFullYear() - from.getFullYear();
}

// ─── 比較 ─────────────────────────────────────────────────

/** date が other より前（厳密に時刻が小さい）か */
export function isBefore(date: Date, other: Date): boolean {
  assertValidDate(date);
  assertValidDate(other);
  return date.getTime() < other.getTime();
}

/** date が other より後（厳密に時刻が大きい）か */
export function isAfter(date: Date, other: Date): boolean {
  assertValidDate(date);
  assertValidDate(other);
  return date.getTime() > other.getTime();
}

/** 同じ年月か（日は無視） */
export function isSameMonth(a: Date, b: Date): boolean {
  assertValidDate(a);
  assertValidDate(b);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** 同じ年か（月・日は無視） */
export function isSameYear(a: Date, b: Date): boolean {
  assertValidDate(a);
  assertValidDate(b);
  return a.getFullYear() === b.getFullYear();
}

/** 週末（土曜 or 日曜）か */
export function isWeekend(date: Date): boolean {
  assertValidDate(date);
  const day = date.getDay();
  return day === 0 || day === 6;
}

// ─── 年・週の位置 ─────────────────────────────────────────

/** ISO 8601 の週番号（1-53）を返す。第1週は最初の木曜日を含む週 */
export function getISOWeek(date: Date): number {
  assertValidDate(date);
  const day = startOfDay(date);
  const weekday = (day.getDay() + 6) % 7; // 月=0 ... 日=6
  // 今週の木曜日（ISO 年の基準。月曜〜日曜のどれを取っても同じ週番号になる）
  const thursday = addDays(day, 3 - weekday);
  const jan1 = createDate(thursday.getFullYear(), 0, 1);
  const jan1Weekday = (jan1.getDay() + 6) % 7;
  const firstThursday = addDays(jan1, (3 - jan1Weekday + 7) % 7);
  return Math.floor(diffInCalendarDays(firstThursday, thursday) / 7) + 1;
}

/**
 * 年始（1月1日）を含む週を第1週とする週番号を返す。
 * 1月1日より前の週の末日（例: 日曜始まりの 1月1日が土曜のとき）は前年の第52週/第53週になる。
 * 北米のカレンダー（cal -w 相当）で使われる規則。
 */
export function getWeekOfYear(
  date: Date,
  weekStart: WeekStart = "sunday",
): number {
  assertValidDate(date);
  assertValidWeekStart(weekStart);
  const day = startOfDay(date);
  const jan1 = createDate(day.getFullYear(), 0, 1);
  const weekStartJan1 = startOfWeek(jan1, weekStart);
  return Math.floor(diffInCalendarDays(weekStartJan1, day) / 7) + 1;
}

/** 年の通算日（1月1日 = 1、12月31日 = 365/366）を返す */
export function getDayOfYear(date: Date): number {
  assertValidDate(date);
  return diffInCalendarDays(startOfYear(date), date) + 1;
}

// ─── その他 ───────────────────────────────────────────────

/** 日付を [min, max] の範囲内にクランプする。範囲外なら min/max を、範囲内なら元の Date を返す */
export function clampDate(date: Date, min: Date, max: Date): Date {
  assertValidDate(date);
  assertValidDate(min);
  assertValidDate(max);
  if (date.getTime() < min.getTime()) return min;
  if (date.getTime() > max.getTime()) return max;
  return date;
}

const TOKEN_RE = /yyyy|MMMM|EEE|yy|MM|dd|M|d/g;

/**
 * パターン文字列に従って日付をフォーマットする。
 *
 * 対応トークン:
 * - `yyyy` — 4桁の年（例: 2026）
 * - `yy` — 西暦下2桁（例: 26）
 * - `MMMM` — フル月名（ロケール依存。例: September / 9月）
 * - `MM` — 0埋め2桁の月（01-12）
 * - `M` — 月（1-12）
 * - `dd` — 0埋め2桁の日（01-31）
 * - `d` — 日（1-31）
 * - `EEE` — 曜日の短縮名（ロケール依存。例: Fri / 金）
 *
 * トークン以外の文字はそのまま出力される。
 *
 * ```ts
 * formatDate(date, "yyyy-MM-dd");            // "2026-09-25"
 * formatDate(date, "MMMM d, yyyy (EEE)");    // "September 25, 2026 (Fri)"
 * formatDate(date, "yyyy年M月d日", "ja");     // "2026年9月25日"
 * ```
 */
export function formatDate(
  date: Date,
  pattern: string,
  locale: Locale = "en",
): string {
  assertValidDate(date);
  const data = getLocaleData(locale);
  return pattern.replace(TOKEN_RE, (token) => {
    switch (token) {
      case "yyyy":
        return String(date.getFullYear()).padStart(4, "0");
      case "yy":
        return String(date.getFullYear() % 100).padStart(2, "0");
      case "MMMM":
        return getMonthName(locale, date.getMonth() + 1);
      case "MM":
        return String(date.getMonth() + 1).padStart(2, "0");
      case "M":
        return String(date.getMonth() + 1);
      case "dd":
        return String(date.getDate()).padStart(2, "0");
      case "d":
        return String(date.getDate());
      case "EEE":
        return data.weekdays[date.getDay()]!;
      default:
        return token;
    }
  });
}
