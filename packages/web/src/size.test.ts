import { describe, expect, test } from "vitest";
import type { CalendarSize } from "./size.ts";
import { buildSizeStyle, isSizeName } from "./size.ts";

describe("isSizeName", () => {
  test("組み込みサイズ名は true", () => {
    expect(isSizeName("sm")).toBe(true);
    expect(isSizeName("md")).toBe(true);
    expect(isSizeName("lg")).toBe(true);
  });

  test("未知の文字列は false", () => {
    expect(isSizeName("xl" as CalendarSize)).toBe(false);
  });

  test("カスタムサイズオブジェクトは false", () => {
    expect(isSizeName({ width: 48 })).toBe(false);
  });
});

describe("buildSizeStyle", () => {
  test("組み込みサイズ名は空スタイル", () => {
    expect(buildSizeStyle("sm")).toEqual({});
    expect(buildSizeStyle("md")).toEqual({});
    expect(buildSizeStyle("lg")).toEqual({});
  });

  test("数値は px に変換する", () => {
    expect(buildSizeStyle({ width: 48, height: 40 })).toEqual({
      "--cal-cell-w": "48px",
      "--cal-cell-h": "40px",
    });
  });

  test("文字列は CSS 長さのまま渡す", () => {
    expect(buildSizeStyle({ width: "3rem" })).toEqual({
      "--cal-cell-w": "3rem",
    });
  });

  test("片方だけの指定もできる", () => {
    expect(buildSizeStyle({ height: 24 })).toEqual({
      "--cal-cell-h": "24px",
    });
    expect(buildSizeStyle({})).toEqual({});
  });
});
