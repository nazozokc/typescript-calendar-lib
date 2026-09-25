import { describe, expect, test } from "vitest";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  clampDate,
  diffInCalendarDays,
  diffInCalendarMonths,
  diffInCalendarYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  formatDate,
  getDayOfYear,
  getISOWeek,
  getWeekOfYear,
  isAfter,
  isBefore,
  isSameMonth,
  isSameYear,
  isWeekend,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "./date-math.ts";

describe("addDays", () => {
  test("日数を加算する（月末をまたぐ）", () => {
    expect(addDays(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 1));
  });

  test("負数で減算する（月初をまたぐ）", () => {
    expect(addDays(new Date(2026, 2, 1), -1)).toEqual(new Date(2026, 1, 28));
  });

  test("時刻は保持される", () => {
    const result = addDays(new Date(2026, 8, 25, 15, 30), 1);
    expect(result.getHours()).toBe(15);
    expect(result.getMinutes()).toBe(30);
  });

  test("入力は変更されない", () => {
    const date = new Date(2026, 8, 25);
    addDays(date, 5);
    expect(date).toEqual(new Date(2026, 8, 25));
  });

  test("加算量が非整数なら RangeError", () => {
    expect(() => addDays(new Date(2026, 8, 25), 1.5)).toThrow(RangeError);
  });
});

describe("addWeeks", () => {
  test("週数を加算する", () => {
    expect(addWeeks(new Date(2026, 8, 25), 1)).toEqual(new Date(2026, 9, 2));
    expect(addWeeks(new Date(2026, 8, 25), -2)).toEqual(new Date(2026, 8, 11));
  });
});

describe("addMonths", () => {
  test("月末クランプ: 1月31日 + 1ヶ月 = 2月28日（平年）", () => {
    expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
  });

  test("月末クランプ: 1月31日 + 1ヶ月 = 2月29日（うるう年）", () => {
    expect(addMonths(new Date(2024, 0, 31), 1)).toEqual(new Date(2024, 1, 29));
  });

  test("最末日でなければクランプしない: 1月30日 + 1ヶ月 = 2月28日", () => {
    expect(addMonths(new Date(2026, 0, 30), 1)).toEqual(new Date(2026, 1, 28));
  });

  test("年をまたぐ", () => {
    expect(addMonths(new Date(2026, 11, 15), 1)).toEqual(new Date(2027, 0, 15));
  });

  test("2ヶ月加算でクランプ結果が正しくロールする: 1月31日 + 2ヶ月 = 3月31日", () => {
    expect(addMonths(new Date(2026, 0, 31), 2)).toEqual(new Date(2026, 2, 31));
  });

  test("負数で減算する", () => {
    expect(addMonths(new Date(2026, 2, 15), -1)).toEqual(new Date(2026, 1, 15));
  });

  test("時刻は保持される", () => {
    const result = addMonths(new Date(2026, 0, 15, 9, 5), 1);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(5);
  });
});

describe("addYears", () => {
  test("年を加算する", () => {
    expect(addYears(new Date(2026, 8, 25), 1)).toEqual(new Date(2027, 8, 25));
  });

  test("うるう日は2月28日に丸められる", () => {
    expect(addYears(new Date(2024, 1, 29), 1)).toEqual(new Date(2025, 1, 28));
  });

  test("4年後はうるう日が復活する", () => {
    expect(addYears(new Date(2024, 1, 29), 4)).toEqual(new Date(2028, 1, 29));
  });

  test("負数で減算する", () => {
    expect(addYears(new Date(2026, 8, 25), -1)).toEqual(new Date(2025, 8, 25));
  });
});

describe("startOfDay / endOfDay", () => {
  test("startOfDay は 00:00:00.000", () => {
    expect(startOfDay(new Date(2026, 8, 25, 15, 30, 45, 123))).toEqual(
      new Date(2026, 8, 25, 0, 0, 0, 0),
    );
  });

  test("endOfDay は 23:59:59.999", () => {
    expect(endOfDay(new Date(2026, 8, 25, 0, 0))).toEqual(
      new Date(2026, 8, 25, 23, 59, 59, 999),
    );
  });
});

describe("startOfWeek / endOfWeek", () => {
  test("2026-09-25（金）の日曜始まり週は 9/20（日）", () => {
    expect(startOfWeek(new Date(2026, 8, 25))).toEqual(new Date(2026, 8, 20));
  });

  test("2026-09-25（金）の月曜始まり週は 9/21（月）", () => {
    expect(startOfWeek(new Date(2026, 8, 25), "monday")).toEqual(
      new Date(2026, 8, 21),
    );
  });

  test("日曜日は週の開始そのもの", () => {
    expect(startOfWeek(new Date(2026, 8, 20))).toEqual(new Date(2026, 8, 20));
  });

  test("endOfWeek は週末日 23:59:59.999（日曜始まり）", () => {
    expect(endOfWeek(new Date(2026, 8, 25))).toEqual(
      new Date(2026, 8, 26, 23, 59, 59, 999),
    );
  });

  test("endOfWeek は週末日 23:59:59.999（月曜始まり）", () => {
    expect(endOfWeek(new Date(2026, 8, 25), "monday")).toEqual(
      new Date(2026, 8, 27, 23, 59, 59, 999),
    );
  });

  test("無効な weekStart は RangeError", () => {
    // @ts-expect-error 型エラーを実行時に確認する
    expect(() => startOfWeek(new Date(2026, 8, 25), "tuesday")).toThrow(
      RangeError,
    );
  });
});

describe("startOfMonth / endOfMonth", () => {
  test("startOfMonth は月初", () => {
    expect(startOfMonth(new Date(2026, 8, 25))).toEqual(new Date(2026, 8, 1));
  });

  test("endOfMonth は月末 23:59:59.999", () => {
    expect(endOfMonth(new Date(2026, 8, 25))).toEqual(
      new Date(2026, 8, 30, 23, 59, 59, 999),
    );
  });

  test("うるう年の2月は 2/29 23:59:59.999", () => {
    expect(endOfMonth(new Date(2024, 1, 10))).toEqual(
      new Date(2024, 1, 29, 23, 59, 59, 999),
    );
  });
});

describe("startOfYear / endOfYear", () => {
  test("startOfYear は1月1日", () => {
    expect(startOfYear(new Date(2026, 8, 25))).toEqual(new Date(2026, 0, 1));
  });

  test("endOfYear は12月31日 23:59:59.999", () => {
    expect(endOfYear(new Date(2026, 8, 25))).toEqual(
      new Date(2026, 11, 31, 23, 59, 59, 999),
    );
  });
});

describe("diffInCalendarDays", () => {
  test("同じ月内の差", () => {
    expect(
      diffInCalendarDays(new Date(2026, 8, 1), new Date(2026, 8, 30)),
    ).toBe(29);
  });

  test("逆順はマイナス", () => {
    expect(
      diffInCalendarDays(new Date(2026, 8, 30), new Date(2026, 8, 1)),
    ).toBe(-29);
  });

  test("年をまたぐ", () => {
    expect(
      diffInCalendarDays(new Date(2026, 11, 31), new Date(2027, 0, 1)),
    ).toBe(1);
  });

  test("時刻は無視される", () => {
    expect(
      diffInCalendarDays(
        new Date(2026, 8, 1, 23, 59),
        new Date(2026, 8, 2, 0, 1),
      ),
    ).toBe(1);
  });

  test("同日は0", () => {
    expect(
      diffInCalendarDays(new Date(2026, 8, 25, 9), new Date(2026, 8, 25, 18)),
    ).toBe(0);
  });
});

describe("diffInCalendarMonths / diffInCalendarYears", () => {
  test("月の差", () => {
    expect(
      diffInCalendarMonths(new Date(2026, 0, 15), new Date(2026, 2, 10)),
    ).toBe(2);
  });

  test("年をまたぐ月の差", () => {
    expect(
      diffInCalendarMonths(new Date(2025, 10, 1), new Date(2026, 0, 1)),
    ).toBe(2);
  });

  test("逆順はマイナス", () => {
    expect(
      diffInCalendarMonths(new Date(2026, 2, 10), new Date(2026, 0, 15)),
    ).toBe(-2);
  });

  test("年の差", () => {
    expect(
      diffInCalendarYears(new Date(2020, 5, 1), new Date(2026, 5, 1)),
    ).toBe(6);
  });

  test("年の差はマイナスもありうる", () => {
    expect(
      diffInCalendarYears(new Date(2026, 5, 1), new Date(2020, 5, 1)),
    ).toBe(-6);
  });
});

describe("isBefore / isAfter", () => {
  test("isBefore", () => {
    expect(isBefore(new Date(2026, 8, 1), new Date(2026, 8, 2))).toBe(true);
    expect(isBefore(new Date(2026, 8, 2), new Date(2026, 8, 1))).toBe(false);
    expect(isBefore(new Date(2026, 8, 1), new Date(2026, 8, 1))).toBe(false);
  });

  test("isAfter", () => {
    expect(isAfter(new Date(2026, 8, 2), new Date(2026, 8, 1))).toBe(true);
    expect(isAfter(new Date(2026, 8, 1), new Date(2026, 8, 2))).toBe(false);
    expect(isAfter(new Date(2026, 8, 1), new Date(2026, 8, 1))).toBe(false);
  });
});

describe("isSameMonth / isSameYear", () => {
  test("isSameMonth", () => {
    expect(isSameMonth(new Date(2026, 8, 1), new Date(2026, 8, 30))).toBe(true);
    expect(isSameMonth(new Date(2026, 8, 30), new Date(2026, 9, 1))).toBe(
      false,
    );
    expect(isSameMonth(new Date(2026, 8, 1), new Date(2027, 8, 1))).toBe(false);
  });

  test("isSameYear", () => {
    expect(isSameYear(new Date(2026, 0, 1), new Date(2026, 11, 31))).toBe(true);
    expect(isSameYear(new Date(2026, 0, 1), new Date(2027, 0, 1))).toBe(false);
  });
});

describe("isWeekend", () => {
  test("2026-09-20（日）は週末", () => {
    expect(isWeekend(new Date(2026, 8, 20))).toBe(true);
  });

  test("2026-09-26（土）は週末", () => {
    expect(isWeekend(new Date(2026, 8, 26))).toBe(true);
  });

  test("2026-09-25（金）は週末でない", () => {
    expect(isWeekend(new Date(2026, 8, 25))).toBe(false);
  });
});

describe("getISOWeek", () => {
  test("2026-01-01（木）は第1週", () => {
    expect(getISOWeek(new Date(2026, 0, 1))).toBe(1);
  });

  test("2025-01-01（水）は第1週", () => {
    expect(getISOWeek(new Date(2025, 0, 1))).toBe(1);
  });

  test("2024-12-30（月）は 2025年の第1週（月曜始まり）", () => {
    expect(getISOWeek(new Date(2024, 11, 30))).toBe(1);
  });

  test("2021-01-01（金）は前年の第53週", () => {
    expect(getISOWeek(new Date(2021, 0, 1))).toBe(53);
  });

  test("2026-09-25（金）の週番号", () => {
    // 2026-09-21 が月曜。1月1日(木)からの週数で第39週
    expect(getISOWeek(new Date(2026, 8, 25))).toBe(39);
  });

  test("2026-12-31（木）は第53週", () => {
    expect(getISOWeek(new Date(2026, 11, 31))).toBe(53);
  });
});

describe("getWeekOfYear", () => {
  test("2026-01-01（木）は第1週（日曜始まり）", () => {
    expect(getWeekOfYear(new Date(2026, 0, 1))).toBe(1);
  });

  test("2026-01-03（土）は第1週（日曜始まり）", () => {
    expect(getWeekOfYear(new Date(2026, 0, 3))).toBe(1);
  });

  test("2026-01-04（日）は第2週（日曜始まり）", () => {
    expect(getWeekOfYear(new Date(2026, 0, 4))).toBe(2);
  });

  test("2026-01-04（日）は第1週（月曜始まり）", () => {
    expect(getWeekOfYear(new Date(2026, 0, 4), "monday")).toBe(1);
  });

  test("2026-01-05（月）は第2週（月曜始まり）", () => {
    expect(getWeekOfYear(new Date(2026, 0, 5), "monday")).toBe(2);
  });

  test("2026-12-31（木）は第53週（日曜始まり）", () => {
    expect(getWeekOfYear(new Date(2026, 11, 31))).toBe(53);
  });
});

describe("getDayOfYear", () => {
  test("1月1日は1", () => {
    expect(getDayOfYear(new Date(2026, 0, 1))).toBe(1);
  });

  test("平年の12月31日は365", () => {
    expect(getDayOfYear(new Date(2026, 11, 31))).toBe(365);
  });

  test("うるう年の12月31日は366", () => {
    expect(getDayOfYear(new Date(2024, 11, 31))).toBe(366);
  });

  test("2月29日は第60日（うるう年）", () => {
    expect(getDayOfYear(new Date(2024, 1, 29))).toBe(60);
  });
});

describe("clampDate", () => {
  const min = new Date(2026, 8, 1);
  const max = new Date(2026, 8, 30);

  test("範囲内なら元の Date を返す", () => {
    const date = new Date(2026, 8, 15);
    expect(clampDate(date, min, max)).toBe(date);
  });

  test("範囲より前なら min", () => {
    expect(clampDate(new Date(2026, 7, 31), min, max)).toEqual(min);
  });

  test("範囲より後なら max", () => {
    expect(clampDate(new Date(2026, 9, 1), min, max)).toEqual(max);
  });

  test("境界値はそのまま", () => {
    expect(clampDate(min, min, max)).toBe(min);
    expect(clampDate(max, min, max)).toBe(max);
  });
});

describe("formatDate", () => {
  const date = new Date(2026, 8, 25, 9, 5); // 2026-09-25（金）

  test("yyyy-MM-dd", () => {
    expect(formatDate(date, "yyyy-MM-dd")).toBe("2026-09-25");
  });

  test("MMMM d, yyyy (EEE)", () => {
    expect(formatDate(date, "MMMM d, yyyy (EEE)")).toBe(
      "September 25, 2026 (Fri)",
    );
  });

  test("日本語ロケール", () => {
    expect(formatDate(date, "yyyy年M月d日（EEE）", "ja")).toBe(
      "2026年9月25日（金）",
    );
  });

  test("yy は西暦下2桁、MM/dd は0埋め", () => {
    expect(formatDate(date, "yy/MM/dd")).toBe("26/09/25");
  });

  test("0埋めしない M / d", () => {
    expect(formatDate(new Date(2026, 0, 5), "M/d")).toBe("1/5");
  });

  test("トークン以外はそのまま", () => {
    expect(formatDate(date, "2026-09-25 だよ")).toBe("2026-09-25 だよ");
  });
});

describe("DST 安全性", () => {
  test.skipIf(process.platform === "win32")(
    "addDays / diffInCalendarDays は DST 遷移でもずれない",
    () => {
      const original = process.env.TZ;
      process.env.TZ = "America/New_York";
      try {
        // 2026-03-08 が DST 開始（23時間日）
        expect(addDays(new Date(2026, 2, 7), 1)).toEqual(new Date(2026, 2, 8));
        // 2026-11-01 が DST 終了（25時間日）
        expect(addDays(new Date(2026, 9, 31), 1)).toEqual(
          new Date(2026, 10, 1),
        );
        expect(
          diffInCalendarDays(new Date(2026, 2, 7), new Date(2026, 2, 8)),
        ).toBe(1);
        expect(
          diffInCalendarDays(new Date(2026, 9, 31), new Date(2026, 10, 1)),
        ).toBe(1);
      } finally {
        process.env.TZ = original;
      }
    },
  );
});
