import { describe, expect, test } from "vitest";
import { getMonthName, getWeekdayHeaders, LOCALES } from "./locale.ts";

describe("LOCALES", () => {
  test("全ロケールが12ヶ月分の月名を持つ", () => {
    for (const locale of Object.keys(LOCALES) as (keyof typeof LOCALES)[]) {
      expect(LOCALES[locale].months).toHaveLength(12);
    }
  });

  test("全ロケールが7曜日のヘッダを持つ", () => {
    for (const locale of Object.keys(LOCALES) as (keyof typeof LOCALES)[]) {
      expect(LOCALES[locale].months).toHaveLength(12);
      expect(LOCALES[locale].monthsShort).toHaveLength(12);
      expect(LOCALES[locale].weekdays).toHaveLength(7);
      expect(LOCALES[locale].weekdaysShort).toHaveLength(7);
      expect(LOCALES[locale].weekdaysLong).toHaveLength(7);
      expect(LOCALES[locale].weekdaysMonday).toHaveLength(7);
      expect(LOCALES[locale].weekdaysMondayShort).toHaveLength(7);
    }
  });

  test("日本語以外のロケールが存在する", () => {
    expect(Object.keys(LOCALES)).toEqual(
      expect.arrayContaining(["en", "ja", "es", "de", "fr", "ko", "zh"]),
    );
  });
});

describe("getWeekdayHeaders", () => {
  test("英語・日曜始まりはSunから", () => {
    expect(getWeekdayHeaders("en", "sunday")).toEqual([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
  });

  test("英語・月曜始まりはMonから", () => {
    expect(getWeekdayHeaders("en", "monday")).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
  });

  test("日本語・日曜始まりは日から", () => {
    expect(getWeekdayHeaders("ja", "sunday")).toEqual([
      "日",
      "月",
      "火",
      "水",
      "木",
      "金",
      "土",
    ]);
  });

  test("日本語・月曜始まりは月から", () => {
    expect(getWeekdayHeaders("ja", "monday")).toEqual([
      "月",
      "火",
      "水",
      "木",
      "金",
      "土",
      "日",
    ]);
  });

  test("スペイン語・日曜始まり", () => {
    expect(getWeekdayHeaders("es", "sunday")).toEqual([
      "dom",
      "lun",
      "mar",
      "mié",
      "jue",
      "vie",
      "sáb",
    ]);
  });

  test("ドイツ語・月曜始まり", () => {
    expect(getWeekdayHeaders("de", "monday")).toEqual([
      "Mo",
      "Di",
      "Mi",
      "Do",
      "Fr",
      "Sa",
      "So",
    ]);
  });

  test("フランス語・日曜始まり", () => {
    expect(getWeekdayHeaders("fr", "sunday")).toEqual([
      "dim.",
      "lun.",
      "mar.",
      "mer.",
      "jeu.",
      "ven.",
      "sam.",
    ]);
  });

  test("韓国語・月曜始まり", () => {
    expect(getWeekdayHeaders("ko", "monday")).toEqual([
      "월",
      "화",
      "수",
      "목",
      "금",
      "토",
      "일",
    ]);
  });

  test("中国語・月曜始まり", () => {
    expect(getWeekdayHeaders("zh", "monday")).toEqual([
      "一",
      "二",
      "三",
      "四",
      "五",
      "六",
      "日",
    ]);
  });
});

describe("getMonthName", () => {
  test("英語の月名", () => {
    expect(getMonthName("en", 1)).toBe("January");
    expect(getMonthName("en", 9)).toBe("September");
    expect(getMonthName("en", 12)).toBe("December");
  });

  test("日本語の月名", () => {
    expect(getMonthName("ja", 1)).toBe("1月");
    expect(getMonthName("ja", 12)).toBe("12月");
  });

  test("スペイン語の月名", () => {
    expect(getMonthName("es", 1)).toBe("enero");
    expect(getMonthName("es", 9)).toBe("septiembre");
    expect(getMonthName("es", 12)).toBe("diciembre");
  });

  test("ドイツ語の月名", () => {
    expect(getMonthName("de", 1)).toBe("Januar");
    expect(getMonthName("de", 3)).toBe("März");
    expect(getMonthName("de", 12)).toBe("Dezember");
  });

  test("フランス語の月名", () => {
    expect(getMonthName("fr", 1)).toBe("janvier");
    expect(getMonthName("fr", 8)).toBe("août");
  });

  test("韓国語の月名", () => {
    expect(getMonthName("ko", 1)).toBe("1월");
    expect(getMonthName("ko", 12)).toBe("12월");
  });

  test("中国語の月名", () => {
    expect(getMonthName("zh", 1)).toBe("一月");
    expect(getMonthName("zh", 12)).toBe("十二月");
  });
});

describe("getMonthName の入力検証", () => {
  test.each([0, 13, -1, NaN, 2.5])("month %s は RangeError", (month) => {
    expect(() => getMonthName("en", month)).toThrow(RangeError);
  });

  test("未知のロケールは RangeError", () => {
    // @ts-expect-error 未対応ロケール
    expect(() => getMonthName("xx", 9)).toThrow(RangeError);
  });
});

describe("getWeekdayHeaders の入力検証", () => {
  test("未知のロケールは RangeError", () => {
    // @ts-expect-error 未対応ロケール
    expect(() => getWeekdayHeaders("xx", "sunday")).toThrow(RangeError);
  });

  test("不正な weekStart は RangeError", () => {
    // @ts-expect-error 未対応 weekStart
    expect(() => getWeekdayHeaders("en", "tuesday")).toThrow(RangeError);
  });
});
