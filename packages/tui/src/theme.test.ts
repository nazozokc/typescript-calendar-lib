import { describe, expect, test } from "vitest";
import {
  COLOR_SCHEMES,
  resolveColorScheme,
  resolveTheme,
  THEMES,
} from "./theme.ts";

describe("resolveTheme", () => {
  test("省略時は default", () => {
    expect(resolveTheme()).toBe(THEMES.default);
    expect(resolveTheme().frame).toBeNull();
  });

  test("名前で解決できる", () => {
    expect(resolveTheme("modern").frame?.topLeft).toBe("┌");
    expect(resolveTheme("modern").separator).toBe("│");
  });

  test("不明な名前は default にフォールバックする", () => {
    // @ts-expect-error 不明なテーマ名
    expect(resolveTheme("unknown")).toBe(THEMES.default);
    // Object.prototype 由来のキーもフォールバックする
    // @ts-expect-error 不正なテーマ名
    expect(resolveTheme("constructor")).toBe(THEMES.default);
    // @ts-expect-error 不正なテーマ名
    expect(resolveTheme("toString")).toBe(THEMES.default);
  });

  test("カスタムテーマを受け付ける", () => {
    const custom = { cellWidth: 2, separator: "|", frame: null };
    expect(resolveTheme(custom)).toBe(custom);
  });
});

describe("resolveColorScheme", () => {
  test("省略時は default", () => {
    expect(resolveColorScheme()).toBe(COLOR_SCHEMES.default);
  });

  test("default は range のみ黄色", () => {
    const s = resolveColorScheme("default");
    expect(s.range.fg).toBe(33);
    expect(s.day).toEqual({});
  });

  test("ocean は highlight が reverse", () => {
    const s = resolveColorScheme("ocean");
    expect(s.highlight.reverse).toBe(true);
    expect(s.title.fg).toBe(36);
  });

  test("Object.prototype 由来のキーは default にフォールバックする", () => {
    // @ts-expect-error 不正なスキーム名
    expect(resolveColorScheme("constructor")).toBe(COLOR_SCHEMES.default);
    // @ts-expect-error 不正なスキーム名
    expect(resolveColorScheme("toString")).toBe(COLOR_SCHEMES.default);
  });

  test("カスタムスキームを受け付ける", () => {
    const custom = {
      title: { fg: 95 },
      weekday: {},
      day: {},
      weekend: {},
      today: {},
      highlight: {},
      range: {},
      dim: {},
      frame: {},
    };
    expect(resolveColorScheme(custom)).toBe(custom);
  });
});
