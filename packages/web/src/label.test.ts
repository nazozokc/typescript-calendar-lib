import { describe, expect, test } from "vitest";
import { formatCellLabel, UI_STRINGS, uiString } from "./label.ts";

describe("formatCellLabel", () => {
  test("英語はロケールに自然な長形式", () => {
    expect(formatCellLabel("en", 2026, 9, 15)).toBe("September 15, 2026");
  });

  test("日本語は年/月/日の順になる", () => {
    expect(formatCellLabel("ja", 2026, 9, 15)).toBe("2026年9月15日");
  });

  test("1桁の日付はゼロ埋めしない", () => {
    expect(formatCellLabel("en", 2026, 9, 5)).toBe("September 5, 2026");
  });

  test("全ロケールで Intl に委譲している", () => {
    for (const locale of ["en", "ja", "es", "de", "fr", "ko", "zh"] as const) {
      // どれか一つのロケールでも年落入れ要是れば壊れている
      expect(formatCellLabel(locale, 2026, 9, 15)).toContain("2026");
    }
  });

  test("英語以外は旧実装の英語語順にならない", () => {
    // 旧実装は全ロケールに `${monthName} ${day}, ${year}` を適用していた
    const handRolled = /^[A-Za-z0-9]+\s15,\s2026$/;
    for (const locale of ["es", "de", "fr"] as const) {
      expect(formatCellLabel(locale, 2026, 9, 15)).not.toMatch(handRolled);
    }
    // 日本語は「9月 15, 2026」ではなく年を先頭に置く
    expect(formatCellLabel("ja", 2026, 9, 15)).not.toBe("9月 15, 2026");
  });

  test("ロケールごとに表記が異なる（ja と zh だけが自然な重複）", () => {
    const labels = (["en", "ja", "es", "de", "fr", "ko", "zh"] as const).map(
      (l) => formatCellLabel(l, 2026, 9, 15),
    );
    // ja と zh は ICU 上で同形（"2026年9月15日"）になるため 7 種類にはならない
    expect(new Set(labels).size).toBe(6);
  });

  test("同じ入力なら常に同じ出力（キャッシュが壊れていない）", () => {
    const first = formatCellLabel("ja", 2026, 9, 15);
    const second = formatCellLabel("ja", 2026, 9, 15);
    expect(second).toBe(first);
  });
});

describe("uiString", () => {
  test("全キーに全ロケールの文字列がある", () => {
    const locales = ["en", "ja", "es", "de", "fr", "ko", "zh"] as const;
    for (const key of Object.keys(UI_STRINGS) as Array<
      keyof typeof UI_STRINGS
    >) {
      for (const locale of locales) {
        const value = uiString(key, locale);
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  test("各キーの7ロケール文字列はすべて異なる", () => {
    const locales = ["en", "ja", "es", "de", "fr", "ko", "zh"] as const;
    for (const key of Object.keys(UI_STRINGS) as Array<
      keyof typeof UI_STRINGS
    >) {
      const values = locales.map((l) => uiString(key, l));
      expect(new Set(values).size).toBe(locales.length);
    }
  });

  test("英語は weekNumber が Week number", () => {
    expect(uiString("weekNumber", "en")).toBe("Week number");
  });

  test("日本語は weekNumber が 週番号", () => {
    expect(uiString("weekNumber", "ja")).toBe("週番号");
  });
});
