import { describe, expect, test } from "vitest";
import {
  buildMonthGrid,
  daysInMonth,
  firstDayOfMonth,
  getCalendarCellState,
  getMonthRange,
  isDateInRange,
  isLeapYear,
  isSameDay,
  lastDayOfMonth,
  sortRange,
} from "./utils.ts";

describe("firstDayOfMonth", () => {
  test("1月の月初", () => {
    expect(firstDayOfMonth(2026, 1)).toEqual(new Date(2026, 0, 1));
  });

  test("12月の月初", () => {
    expect(firstDayOfMonth(2026, 12)).toEqual(new Date(2026, 11, 1));
  });
});

describe("lastDayOfMonth", () => {
  test("30日で終わる月（4月は30日）", () => {
    expect(lastDayOfMonth(2026, 4)).toEqual(new Date(2026, 3, 30));
  });

  test("31日で終わる月", () => {
    expect(lastDayOfMonth(2026, 1)).toEqual(new Date(2026, 0, 31));
  });

  test("通常年の2月は28日", () => {
    expect(lastDayOfMonth(2026, 2)).toEqual(new Date(2026, 1, 28));
  });

  test("うるう年の2月は29日", () => {
    expect(lastDayOfMonth(2024, 2)).toEqual(new Date(2024, 1, 29));
  });
});

describe("buildMonthGrid", () => {
  test("gridは常に6行×7列", () => {
    const grid = buildMonthGrid(2026, 9, "sunday");
    expect(grid).toHaveLength(6);
    for (const row of grid) {
      expect(row).toHaveLength(7);
    }
  });

  test("9月2026（日曜始まり）は1日が火曜から開始", () => {
    const grid = buildMonthGrid(2026, 9, "sunday");
    expect(grid[0]).toEqual([null, null, 1, 2, 3, 4, 5]);
  });

  test("9月2026（月曜始まり）は1日が月曜から開始", () => {
    const grid = buildMonthGrid(2026, 9, "monday");
    expect(grid[0]).toEqual([null, 1, 2, 3, 4, 5, 6]);
  });

  test("日付の日数が月末を超えない", () => {
    const grid = buildMonthGrid(2026, 2, "sunday");
    const flat = grid.flat().filter((d) => d !== null);
    expect(Math.max(...(flat as number[]))).toBe(28);
    expect(flat).toHaveLength(28);
  });
});

describe("isDateInRange", () => {
  const range = { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) };

  test("範囲なしなら常にfalse", () => {
    expect(isDateInRange(new Date(2026, 8, 1))).toBe(false);
  });

  test("範囲内の日付はtrue", () => {
    expect(isDateInRange(new Date(2026, 8, 10), range)).toBe(true);
  });

  test("開始日は境界として含む", () => {
    expect(isDateInRange(new Date(2026, 8, 1), range)).toBe(true);
  });

  test("終了日は境界として含む", () => {
    expect(isDateInRange(new Date(2026, 8, 15), range)).toBe(true);
  });

  test("範囲外の前日はfalse", () => {
    expect(isDateInRange(new Date(2026, 7, 31), range)).toBe(false);
  });

  test("範囲外の翌日はfalse", () => {
    expect(isDateInRange(new Date(2026, 8, 16), range)).toBe(false);
  });
});

describe("isSameDay", () => {
  test("同じ日付はtrue", () => {
    expect(
      isSameDay(new Date(2026, 8, 8, 3, 30), new Date(2026, 8, 8, 20, 0)),
    ).toBe(true);
  });

  test("異なる日はfalse", () => {
    expect(isSameDay(new Date(2026, 8, 8), new Date(2026, 8, 9))).toBe(false);
  });

  test("同じ日だが異なる月はfalse", () => {
    expect(isSameDay(new Date(2026, 8, 8), new Date(2026, 7, 8))).toBe(false);
  });
});

describe("getCalendarCellState", () => {
  test("セルの状態をまとめて計算する", () => {
    const date = new Date(2026, 8, 6);
    expect(
      getCalendarCellState(date, {
        today: date,
        highlight: date,
        range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 10) },
      }),
    ).toEqual({
      isWeekend: true,
      isToday: true,
      isHighlight: true,
      isInRange: true,
      isDisabled: false,
      isHoliday: false,
    });
  });

  test("オプション未指定時は状態がすべてfalse", () => {
    expect(getCalendarCellState(new Date(2026, 8, 7))).toEqual({
      isWeekend: false,
      isToday: false,
      isHighlight: false,
      isInRange: false,
      isDisabled: false,
      isHoliday: false,
    });
  });

  test("土曜は週末と判定される", () => {
    const saturday = new Date(2026, 8, 12); // 2026-09-12 は土曜
    expect(saturday.getDay()).toBe(6);
    expect(getCalendarCellState(saturday).isWeekend).toBe(true);
  });

  test("平日は週末と判定されない", () => {
    const weekday = new Date(2026, 8, 9); // 2026-09-09 は水曜
    expect(weekday.getDay()).toBe(3);
    expect(getCalendarCellState(weekday).isWeekend).toBe(false);
  });

  test("Invalid Date は RangeError（オプション未指定でも検証される）", () => {
    const invalid = new Date("invalid");
    expect(() => getCalendarCellState(invalid)).toThrow(RangeError);
    expect(() =>
      getCalendarCellState(new Date(2026, 8, 7), { today: invalid }),
    ).toThrow(RangeError);
  });

  test("isDateDisabled が true を返す日付は isDisabled: true", () => {
    const date = new Date(2026, 8, 15);
    expect(
      getCalendarCellState(date, {
        isDateDisabled: (d) => d.getDate() === 15,
      }),
    ).toMatchObject({ isDisabled: true });
  });

  test("isDateDisabled が false を返す日付は isDisabled: false", () => {
    const date = new Date(2026, 8, 16);
    expect(
      getCalendarCellState(date, {
        isDateDisabled: (d) => d.getDate() === 15,
      }),
    ).toMatchObject({ isDisabled: false });
  });

  test("isDateDisabled 未指定は isDisabled: false", () => {
    expect(getCalendarCellState(new Date(2026, 8, 15))).toMatchObject({
      isDisabled: false,
    });
  });
});

describe("getMonthRange", () => {
  test("同月内は1件", () => {
    expect(getMonthRange(new Date(2026, 8, 1), new Date(2026, 8, 30))).toEqual([
      { year: 2026, month: 9 },
    ]);
  });

  test("複数月に跨る", () => {
    expect(getMonthRange(new Date(2026, 5, 1), new Date(2026, 8, 30))).toEqual([
      { year: 2026, month: 6 },
      { year: 2026, month: 7 },
      { year: 2026, month: 8 },
      { year: 2026, month: 9 },
    ]);
  });

  test("12月から翌年1月に跨る", () => {
    expect(
      getMonthRange(new Date(2025, 11, 31), new Date(2026, 0, 15)),
    ).toEqual([
      { year: 2025, month: 12 },
      { year: 2026, month: 1 },
    ]);
  });

  test("1年の範囲", () => {
    expect(
      getMonthRange(new Date(2026, 0, 1), new Date(2026, 11, 31)),
    ).toHaveLength(12);
  });
});

describe("isLeapYear", () => {
  test("4で割れる年はうるう年", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2020)).toBe(true);
  });

  test("100で割れるが400で割れない年は平年", () => {
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
  });

  test("400で割れる年はうるう年", () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1600)).toBe(true);
  });

  test("年0-99も1900解釈なしで判定できる", () => {
    expect(isLeapYear(24)).toBe(true); // 24 % 4 === 0
    expect(isLeapYear(50)).toBe(false);
  });

  test("不正な年は RangeError", () => {
    const invalidYears = [0, -1, NaN, Infinity, 10000, 2026.5];
    for (const year of invalidYears) {
      expect(() => isLeapYear(year)).toThrow(RangeError);
    }
  });
});

describe("daysInMonth", () => {
  test("31日/30日/2月の日数", () => {
    expect(daysInMonth(2026, 1)).toBe(31);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 2)).toBe(28);
  });

  test("うるう年の2月は29日", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2000, 2)).toBe(29);
  });

  test("年0-99も正しく判定できる", () => {
    expect(daysInMonth(24, 2)).toBe(29); // うるう年
    expect(daysInMonth(50, 2)).toBe(28);
  });

  test("不正な入力は RangeError", () => {
    expect(() => daysInMonth(0, 1)).toThrow(RangeError);
    expect(() => daysInMonth(2026, 13)).toThrow(RangeError);
    expect(() => daysInMonth(NaN, 1)).toThrow(RangeError);
  });
});

// ─── 入力検証 ─────────────────────────────────────────────

describe("入力検証（不正入力は RangeError）", () => {
  const invalidYears = [0, -1, NaN, Infinity, 10000, 2026.5];
  const invalidMonths = [0, 13, -1, NaN, Infinity, 2.5];

  test.each(invalidYears)("year %s は RangeError (firstDayOfMonth)", (y) => {
    expect(() => firstDayOfMonth(y, 9)).toThrow(RangeError);
  });

  test.each(invalidMonths)("month %s は RangeError (firstDayOfMonth)", (m) => {
    expect(() => firstDayOfMonth(2026, m)).toThrow(RangeError);
  });

  test.each(invalidYears)("year %s は RangeError (lastDayOfMonth)", (y) => {
    expect(() => lastDayOfMonth(y, 9)).toThrow(RangeError);
  });

  test.each(invalidMonths)("month %s は RangeError (lastDayOfMonth)", (m) => {
    expect(() => lastDayOfMonth(2026, m)).toThrow(RangeError);
  });

  test("文字列の year は RangeError", () => {
    expect(() => firstDayOfMonth("2026" as unknown as number, 9)).toThrow(
      RangeError,
    );
  });

  test("year 0 は RangeError（0-99 の 1900 解釈を防ぐ）", () => {
    expect(() => firstDayOfMonth(0, 9)).toThrow(RangeError);
  });

  test("不正な weekStart は RangeError", () => {
    const invalid = ["tuesday", "", "Monday"] as never[];
    for (const ws of invalid) {
      expect(() => buildMonthGrid(2026, 9, ws)).toThrow(RangeError);
    }
  });

  test("isDateInRange の from > to は RangeError", () => {
    const date = new Date(2026, 8, 10);
    const reversed = { from: new Date(2026, 8, 15), to: new Date(2026, 8, 1) };
    expect(() => isDateInRange(date, reversed)).toThrow(RangeError);
  });

  test("isDateInRange の Invalid Date は RangeError", () => {
    const invalid = new Date("invalid");
    expect(() =>
      isDateInRange(invalid, { from: new Date(), to: new Date() }),
    ).toThrow(RangeError);
    expect(() =>
      isDateInRange(new Date(), { from: invalid, to: new Date() }),
    ).toThrow(RangeError);
    expect(() =>
      isDateInRange(new Date(), { from: new Date(), to: invalid }),
    ).toThrow(RangeError);
  });

  test("isSameDay の Invalid Date は RangeError", () => {
    expect(() => isSameDay(new Date("invalid"), new Date())).toThrow(
      RangeError,
    );
    expect(() => isSameDay(new Date(), new Date("invalid"))).toThrow(
      RangeError,
    );
  });

  test("getMonthRange の from > to は RangeError", () => {
    expect(() =>
      getMonthRange(new Date(2026, 8, 30), new Date(2026, 8, 1)),
    ).toThrow(RangeError);
  });

  test("getMonthRange の Invalid Date は RangeError", () => {
    expect(() => getMonthRange(new Date("invalid"), new Date())).toThrow(
      RangeError,
    );
    expect(() => getMonthRange(new Date(), new Date("invalid"))).toThrow(
      RangeError,
    );
  });
});

// ─── year 0-99 の扱い ────────────────────────────────────

describe("year 0-99（JS Date の 1900 解釈バグを回避）", () => {
  test("firstDayOfMonth(50, 9) は 50年9月1日", () => {
    const date = firstDayOfMonth(50, 9);
    expect(date.getFullYear()).toBe(50);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(1);
  });

  test("lastDayOfMonth(24, 2) は 24年2月29日（うるう年）", () => {
    const date = lastDayOfMonth(24, 2);
    expect(date.getFullYear()).toBe(24);
    expect(date.getDate()).toBe(29);
  });

  test("buildMonthGrid(50, 9) の grid が本来の曜日になる", () => {
    // 50年9月1日は木曜日（1900年9月1日は土曜日と異なる）
    const grid = buildMonthGrid(50, 9, "sunday");
    expect(grid[0]).toEqual([null, null, null, null, 1, 2, 3]);
  });
});

// ─── sortRange ────────────────────────────────────────────

describe("sortRange", () => {
  const jun1 = new Date(2026, 5, 1);
  const jun10 = new Date(2026, 5, 10);

  test("順方向（from <= to）はそのまま", () => {
    expect(sortRange(jun1, jun10)).toEqual({ from: jun1, to: jun10 });
  });

  test("逆方向は from <= to に揃える", () => {
    expect(sortRange(jun10, jun1)).toEqual({ from: jun1, to: jun10 });
  });

  test("同日は from = to", () => {
    expect(sortRange(jun10, jun10)).toEqual({ from: jun10, to: jun10 });
  });

  test("どちらかが null なら undefined", () => {
    expect(sortRange(null, jun10)).toBeUndefined();
    expect(sortRange(jun1, null)).toBeUndefined();
    expect(sortRange(null, null)).toBeUndefined();
  });
});
