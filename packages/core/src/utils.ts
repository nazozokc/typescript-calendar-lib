import { isHoliday } from "./holidays.ts";
import type { Locale, WeekStart } from "./types.ts";
import {
  assertValidDate,
  assertValidWeekStart,
  assertValidYear,
  assertValidYearMonth,
  createDate,
} from "./validation.ts";

export interface CalendarCellState {
  isWeekend: boolean;
  /** 祝日かどうか（holidayLocale に従って判定。指定なしは "ja"） */
  isHoliday: boolean;
  isToday: boolean;
  isHighlight: boolean;
  isInRange: boolean;
  isDisabled: boolean;
}

/** 日付範囲（from <= to） */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * 2つの日付を from <= to の順にソートした範囲を返す。
 * どちらかが null なら undefined（範囲なし）。
 */
export function sortRange(
  a: Date | null,
  b: Date | null,
): DateRange | undefined {
  if (a === null || b === null) return undefined;
  return a.getTime() <= b.getTime() ? { from: a, to: b } : { from: b, to: a };
}

/** 月初日（1日）を返す */
export function firstDayOfMonth(year: number, month: number): Date {
  assertValidYearMonth(year, month);
  return createDate(year, month - 1, 1);
}

/** 月末日を返す */
export function lastDayOfMonth(year: number, month: number): Date {
  assertValidYearMonth(year, month);
  return createDate(year, month, 0);
}

/**
 * 月の日付グリッドを生成する（6行×7列）
 * 各セルは日数（1-31）または null（空欄）
 */
export function buildMonthGrid(
  year: number,
  month: number,
  weekStart: WeekStart,
): (number | null)[][] {
  assertValidYearMonth(year, month);
  assertValidWeekStart(weekStart);

  const daysInMonth = lastDayOfMonth(year, month).getDate();
  let skip = firstDayOfMonth(year, month).getDay();
  if (weekStart === "monday") {
    skip = (skip + 6) % 7;
  }

  const grid: (number | null)[][] = [];
  let day = 1;
  for (let week = 0; week < 6; week++) {
    const row: (number | null)[] = [];
    for (let col = 0; col < 7; col++) {
      if (day > daysInMonth || (week === 0 && col < skip)) {
        row.push(null);
      } else {
        row.push(day++);
      }
    }
    grid.push(row);
  }
  return grid;
}

/** 範囲（from/to）が有効であることを検証する */
function assertValidRange(from: Date, to: Date): void {
  assertValidDate(from);
  assertValidDate(to);
  if (from.getTime() > to.getTime()) {
    throw new RangeError("Invalid range: from must not be after to");
  }
}

/** 日付が範囲内に含まれるか */
export function isDateInRange(
  date: Date,
  range?: { from: Date; to: Date },
): boolean {
  if (!range) return false;
  assertValidRange(range.from, range.to);
  assertValidDate(date);
  const time = date.getTime();
  return time >= range.from.getTime() && time <= range.to.getTime();
}

/** 日付が今日と一致するか（日付のみ比較） */
export function isSameDay(a: Date, b: Date): boolean {
  assertValidDate(a);
  assertValidDate(b);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** 日付セルの表示状態を計算する */
export function getCalendarCellState(
  date: Date,
  options: {
    today?: Date;
    highlight?: Date;
    range?: { from: Date; to: Date };
    isDateDisabled?: (date: Date) => boolean;
    /** 祝日判定に使うロケール。省略時は "ja"（isHoliday のデフォルト） */
    holidayLocale?: Locale;
  } = {},
): CalendarCellState {
  assertValidDate(date);
  return {
    isWeekend: date.getDay() === 0 || date.getDay() === 6,
    isHoliday: isHoliday(date, options.holidayLocale),
    isToday: options.today !== undefined && isSameDay(date, options.today),
    isHighlight:
      options.highlight !== undefined && isSameDay(date, options.highlight),
    isInRange:
      options.range !== undefined && isDateInRange(date, options.range),
    isDisabled: options.isDateDisabled?.(date) ?? false,
  };
}

/** 日付が範囲の開始年から終了年までの月リストを返す */
export function getMonthRange(
  from: Date,
  to: Date,
): { year: number; month: number }[] {
  assertValidRange(from, to);
  const start = from.getFullYear() * 12 + from.getMonth();
  const end = to.getFullYear() * 12 + to.getMonth();
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const n = start + i;
    return { year: Math.floor(n / 12), month: (n % 12) + 1 };
  });
}

/** グレゴリオ暦のうるう年判定（4で割れるが100では割れない、または400で割れる） */
export function isLeapYear(year: number): boolean {
  assertValidYear(year);
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** 月の日数（1-31）を返す */
export function daysInMonth(year: number, month: number): number {
  assertValidYearMonth(year, month);
  return lastDayOfMonth(year, month).getDate();
}
