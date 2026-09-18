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

  test("--cal-disabled-fg が全スキームで定義されている", () => {
    for (const [name, scheme] of Object.entries(COLOR_SCHEMES)) {
      expect(scheme["--cal-disabled-fg"], name).toBeTypeOf("string");
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
