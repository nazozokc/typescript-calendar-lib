import { describe, expect, test } from "vitest";
import type { ColorSchemeName, ThemeName } from "./themes.ts";
import {
  COLOR_SCHEMES,
  resolveColorScheme,
  resolveTheme,
  THEMES,
} from "./themes.ts";

describe("THEMES", () => {
  test("5つの組み込みテーマが定義されている", () => {
    expect(Object.keys(THEMES)).toHaveLength(5);
    expect(THEMES.default).toEqual({ className: "calendar-theme-default" });
    expect(THEMES.modern).toEqual({ className: "calendar-theme-modern" });
    expect(THEMES.minimal).toEqual({ className: "calendar-theme-minimal" });
    expect(THEMES.rounded).toEqual({ className: "calendar-theme-rounded" });
    expect(THEMES.retro).toEqual({ className: "calendar-theme-retro" });
  });
});

describe("resolveTheme", () => {
  test("未指定は default", () => {
    expect(resolveTheme()).toBe(THEMES.default);
  });

  test("名前から解決する", () => {
    expect(resolveTheme("modern")).toBe(THEMES.modern);
  });

  test("未知の名前は default にフォールバック", () => {
    expect(resolveTheme("unknown" as ThemeName)).toBe(THEMES.default);
  });

  test("カスタムテーマはそのまま返す", () => {
    const custom = { className: "my-calendar" };
    expect(resolveTheme(custom)).toBe(custom);
  });
});

describe("COLOR_SCHEMES", () => {
  test("7つの組み込みスキームが定義されている", () => {
    expect(Object.keys(COLOR_SCHEMES)).toHaveLength(7);
    expect(Object.keys(COLOR_SCHEMES)).toEqual([
      "default",
      "ocean",
      "forest",
      "sunset",
      "mono",
      "midnight",
      "blossom",
    ]);
  });

  const EXPECTED_KEYS = [
    "--cal-bg",
    "--cal-fg",
    "--cal-accent",
    "--cal-weekend-fg",
    "--cal-holiday-fg",
    "--cal-border",
    "--cal-header-bg",
    "--cal-highlight-bg",
    "--cal-highlight-fg",
    "--cal-range-bg",
    "--cal-range-preview-bg",
    "--cal-today-bg",
    "--cal-today-fg",
    "--cal-selected-bg",
    "--cal-selected-fg",
    "--cal-disabled-fg",
  ];

  test("全スキームが全てのCSS変数キーを持つ", () => {
    for (const scheme of Object.values(COLOR_SCHEMES)) {
      for (const key of EXPECTED_KEYS) {
        expect(scheme[key as `--cal-${string}`]).toBeTypeOf("string");
      }
    }
  });

  // 値の記載ミスで "undefined" のような文字列が混入しても
  // toBeTypeOf("string") では検出できないため、実際の16進色であることを検証する。
  test("全スキームの値が正しい16進色である", () => {
    for (const [name, scheme] of Object.entries(COLOR_SCHEMES)) {
      for (const key of EXPECTED_KEYS) {
        const value = scheme[key as `--cal-${string}`];
        expect(value, `${name} ${key}`).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  test("予期しないCSS変数キーを持たない", () => {
    for (const [name, scheme] of Object.entries(COLOR_SCHEMES)) {
      expect(Object.keys(scheme).sort(), name).toEqual(
        [...EXPECTED_KEYS].sort(),
      );
    }
  });

  test("--cal-disabled-fg が全スキームで定義されている", () => {
    for (const [name, scheme] of Object.entries(COLOR_SCHEMES)) {
      expect(scheme["--cal-disabled-fg"], name).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("COLOR_SCHEMES コントラスト", () => {
  /** #rrggbb を相対輝度へ変換する */
  const relativeLuminance = (hex: string): number => {
    const channels = [1, 3, 5].map((i) => {
      const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return (
      0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
    );
  };

  const contrastRatio = (a: string, b: string): number => {
    const sorted = [relativeLuminance(a), relativeLuminance(b)].sort(
      (x, y) => y - x,
    );
    return (sorted[0]! + 0.05) / (sorted[1]! + 0.05);
  };

  /**
   * テキスト色と背景色の組み合わせ。WCAG 2.1 の通常テキスト基準 4.5:1 を満たす必要がある。
   * holiday / weekend / disabled は装飾的な色味はあるが、いずれも日付という
   * 意味を持つテキストなので、同じ基準を適用する。
   */
  const TEXT_PAIRS: [fg: `--cal-${string}`, bg: `--cal-${string}`][] = [
    ["--cal-fg", "--cal-bg"],
    ["--cal-fg", "--cal-header-bg"],
    ["--cal-weekend-fg", "--cal-bg"],
    ["--cal-holiday-fg", "--cal-bg"],
    ["--cal-highlight-fg", "--cal-highlight-bg"],
    ["--cal-today-fg", "--cal-today-bg"],
    ["--cal-selected-fg", "--cal-selected-bg"],
    ["--cal-disabled-fg", "--cal-bg"],
  ];

  for (const [fg, bg] of TEXT_PAIRS) {
    test(`${fg} / ${bg} が 4.5:1 以上`, () => {
      for (const [name, scheme] of Object.entries(COLOR_SCHEMES)) {
        expect(
          contrastRatio(scheme[fg]!, scheme[bg]!),
          `${name}: ${fg}=${scheme[fg]} / ${bg}=${scheme[bg]}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  // 罫線は装飾用途のため WCAG の非テキストコントラスト 3:1 は求めず、
  // 視認できる最小限の 2:1 を目標とする。3:1 にするとグリッドが主張しすぎて
  // 日付のテキストが読みにくくなるため。
  test("--cal-border / --cal-bg が 2:1 以上", () => {
    for (const [name, scheme] of Object.entries(COLOR_SCHEMES)) {
      expect(
        contrastRatio(scheme["--cal-border"]!, scheme["--cal-bg"]!),
        `${name}: border=${scheme["--cal-border"]} / bg=${scheme["--cal-bg"]}`,
      ).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("resolveColorScheme", () => {
  test("未指定は default", () => {
    expect(resolveColorScheme()).toBe(COLOR_SCHEMES.default);
  });

  test("名前から解決する", () => {
    expect(resolveColorScheme("midnight")).toBe(COLOR_SCHEMES.midnight);
  });

  test("未知の名前は default にフォールバック", () => {
    expect(resolveColorScheme("unknown" as ColorSchemeName)).toBe(
      COLOR_SCHEMES.default,
    );
  });

  test("カスタムスキームはそのまま返す", () => {
    const custom = { "--cal-bg": "#000000" };
    expect(resolveColorScheme(custom)).toBe(custom);
  });
});
