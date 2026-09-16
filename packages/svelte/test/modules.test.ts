import { describe, expect, test } from "vitest";
import { getCellClasses } from "../src/cell-classes.js";
import { buildRangePreview } from "../src/range-preview.js";
import { buildSizeStyle, isSizeName } from "../src/size.js";
import { styleObjectToString } from "../src/style.js";
import {
  COLOR_SCHEMES,
  resolveColorScheme,
  resolveTheme,
  THEMES,
} from "../src/themes.js";

const TODAY = new Date(2026, 8, 15); // 2026-09-15 (火)

// ─── getCellClasses ──────────────────────────────────────

describe("getCellClasses", () => {
  test("週末のセルに is-weekend が付く", () => {
    expect(getCellClasses(new Date(2026, 8, 19), {})).toContain("is-weekend"); // 土
    expect(getCellClasses(new Date(2026, 8, 20), {})).toContain("is-weekend"); // 日
  });

  test("平日のセルに is-weekend が付かない", () => {
    expect(getCellClasses(new Date(2026, 8, 17), {})).not.toContain(
      "is-weekend",
    );
  });

  test("今日のセルに is-today が付く", () => {
    expect(getCellClasses(TODAY, { today: TODAY })).toContain("is-today");
  });

  test("ハイライトのセルに is-highlight が付く", () => {
    const d = new Date(2026, 8, 10);
    expect(getCellClasses(d, { highlight: d })).toContain("is-highlight");
  });

  test("範囲内のセルに is-in-range が付く", () => {
    const d = new Date(2026, 8, 10);
    const range = { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) };
    expect(getCellClasses(d, { range })).toContain("is-in-range");
  });

  test("選択されたセルに is-selected が付く", () => {
    const d = new Date(2026, 8, 10);
    expect(getCellClasses(d, { selected: d })).toContain("is-selected");
  });

  test("カーソル位置のセルに is-cursor が付く", () => {
    const d = new Date(2026, 8, 10);
    expect(getCellClasses(d, { cursorDate: d })).toContain("is-cursor");
  });

  test("selected / cursorDate が null ならクラスが付かない", () => {
    expect(getCellClasses(TODAY, { selected: null })).not.toContain(
      "is-selected",
    );
    expect(getCellClasses(TODAY, { cursorDate: null })).not.toContain(
      "is-cursor",
    );
  });

  test("異なる日付には is-selected / is-cursor が付かない", () => {
    expect(
      getCellClasses(new Date(2026, 8, 11), { selected: TODAY }),
    ).not.toContain("is-selected");
    expect(
      getCellClasses(new Date(2026, 8, 11), { cursorDate: TODAY }),
    ).not.toContain("is-cursor");
  });

  test("selected と today が同じ日なら両方のクラスが付く", () => {
    expect(getCellClasses(TODAY, { today: TODAY, selected: TODAY })).toContain(
      "is-today",
    );
    expect(getCellClasses(TODAY, { today: TODAY, selected: TODAY })).toContain(
      "is-selected",
    );
  });

  test("逆転した range は RangeError", () => {
    expect(() =>
      getCellClasses(TODAY, {
        range: { from: new Date(2026, 8, 15), to: new Date(2026, 8, 1) },
      }),
    ).toThrow(RangeError);
  });

  test("rangePreview 内のセルに is-in-range-preview が付く", () => {
    const d = new Date(2026, 8, 10);
    const preview = { from: new Date(2026, 8, 5), to: new Date(2026, 8, 15) };
    expect(getCellClasses(d, { rangePreview: preview })).toContain(
      "is-in-range-preview",
    );
  });

  test("rangePreview 外のセルには is-in-range-preview が付かない", () => {
    const d = new Date(2026, 8, 20);
    const preview = { from: new Date(2026, 8, 5), to: new Date(2026, 8, 15) };
    expect(getCellClasses(d, { rangePreview: preview })).not.toContain(
      "is-in-range-preview",
    );
  });

  test("rangePreview 未指定なら is-in-range-preview は付かない", () => {
    expect(getCellClasses(new Date(2026, 8, 10), {})).not.toContain(
      "is-in-range-preview",
    );
  });

  test("逆転した rangePreview は RangeError", () => {
    expect(() =>
      getCellClasses(new Date(2026, 8, 10), {
        rangePreview: {
          from: new Date(2026, 8, 15),
          to: new Date(2026, 8, 5),
        },
      }),
    ).toThrow(RangeError);
  });

  test("hoveredDate のセルに is-hovered が付く", () => {
    const d = new Date(2026, 8, 10);
    expect(getCellClasses(d, { hoveredDate: d })).toContain("is-hovered");
  });

  test("hoveredDate が null なら is-hovered は付かない", () => {
    expect(
      getCellClasses(new Date(2026, 8, 10), { hoveredDate: null }),
    ).not.toContain("is-hovered");
  });
});

// ─── buildRangePreview ───────────────────────────────────

describe("buildRangePreview", () => {
  const jun1 = new Date(2026, 5, 1);
  const jun5 = new Date(2026, 5, 5);
  const jun10 = new Date(2026, 5, 10);

  test("selected < hovered → from = selected", () => {
    const result = buildRangePreview(jun1, jun10);
    expect(result).toEqual({ from: jun1, to: jun10 });
  });

  test("selected > hovered → from = hovered（逆順ホバーをソート）", () => {
    const result = buildRangePreview(jun10, jun1);
    expect(result).toEqual({ from: jun1, to: jun10 });
  });

  test("selected = hovered → from = to（1日分の範囲）", () => {
    const result = buildRangePreview(jun5, jun5);
    expect(result).toEqual({ from: jun5, to: jun5 });
  });

  test("selected が null → undefined", () => {
    expect(buildRangePreview(null, jun10)).toBeUndefined();
  });

  test("hovered が null → undefined", () => {
    expect(buildRangePreview(jun1, null)).toBeUndefined();
  });

  test("両方 null → undefined", () => {
    expect(buildRangePreview(null, null)).toBeUndefined();
  });
});

// ─── buildSizeStyle / isSizeName ─────────────────────────

describe("buildSizeStyle", () => {
  test("組み込みサイズ名は空スタイルを返す", () => {
    expect(buildSizeStyle("sm")).toEqual({});
    expect(buildSizeStyle("md")).toEqual({});
    expect(buildSizeStyle("lg")).toEqual({});
  });

  test("カスタムサイズは CSS 変数を返す（数値は px）", () => {
    expect(buildSizeStyle({ width: 48, height: 40 })).toEqual({
      "--cal-cell-w": "48px",
      "--cal-cell-h": "40px",
    });
  });

  test("文字列の長さはそのまま渡す", () => {
    expect(buildSizeStyle({ width: "5rem" })).toEqual({
      "--cal-cell-w": "5rem",
    });
    expect(buildSizeStyle({ height: "10%" })).toEqual({
      "--cal-cell-h": "10%",
    });
  });

  test("片方だけでも指定できる", () => {
    expect(buildSizeStyle({ width: 48 })).toEqual({ "--cal-cell-w": "48px" });
    expect(buildSizeStyle({ height: 40 })).toEqual({ "--cal-cell-h": "40px" });
  });

  test("空オブジェクトは空スタイル", () => {
    expect(buildSizeStyle({})).toEqual({});
  });
});

describe("isSizeName", () => {
  test("組み込みサイズ名のみ true", () => {
    expect(isSizeName("sm")).toBe(true);
    expect(isSizeName("md")).toBe(true);
    expect(isSizeName("lg")).toBe(true);
    expect(isSizeName("xl" as never)).toBe(false);
    expect(isSizeName({ width: 48 })).toBe(false);
  });
});

// ─── styleObjectToString ─────────────────────────────────

describe("styleObjectToString", () => {
  test("camelCase を kebab-case に変換する", () => {
    expect(styleObjectToString({ backgroundColor: "red" })).toBe(
      "background-color: red",
    );
  });

  test("CSS 変数はそのまま", () => {
    expect(styleObjectToString({ "--cal-bg": "#fff" })).toBe("--cal-bg: #fff");
  });

  test("undefined はスキップする", () => {
    expect(
      styleObjectToString({ color: "red", backgroundColor: undefined }),
    ).toBe("color: red");
  });

  test("複数プロパティはセミコロンで連結される", () => {
    expect(styleObjectToString({ color: "red", "--cal-cell-w": "48px" })).toBe(
      "color: red; --cal-cell-w: 48px",
    );
  });

  test("空オブジェクトは空文字列", () => {
    expect(styleObjectToString({})).toBe("");
  });
});

// ─── resolveTheme / resolveColorScheme ───────────────────

describe("resolveTheme", () => {
  test("未指定は default テーマ", () => {
    expect(resolveTheme()).toEqual(THEMES.default);
  });

  test("名前で解決できる", () => {
    expect(resolveTheme("modern")).toEqual(THEMES.modern);
    expect(resolveTheme("rounded")).toEqual(THEMES.rounded);
    expect(resolveTheme("retro")).toEqual(THEMES.retro);
    expect(resolveTheme("minimal")).toEqual(THEMES.minimal);
  });

  test("未知の名前は default にフォールバック", () => {
    expect(resolveTheme("unknown" as never)).toEqual(THEMES.default);
  });

  test("カスタムオブジェクトはそのまま返す", () => {
    const custom = { className: "my-cal" };
    expect(resolveTheme(custom)).toBe(custom);
  });
});

describe("resolveColorScheme", () => {
  test("未指定は default スキーム", () => {
    expect(resolveColorScheme()).toEqual(COLOR_SCHEMES.default);
  });

  test("名前で解決できる", () => {
    expect(resolveColorScheme("ocean")).toEqual(COLOR_SCHEMES.ocean);
    expect(resolveColorScheme("midnight")).toEqual(COLOR_SCHEMES.midnight);
  });

  test("未知の名前は default にフォールバック", () => {
    expect(resolveColorScheme("unknown" as never)).toEqual(
      COLOR_SCHEMES.default,
    );
  });

  test("カスタムスキームはそのまま返す", () => {
    const custom = { "--cal-bg": "#000" } as const;
    expect(resolveColorScheme(custom)).toBe(custom);
  });

  test("全スキームが同一のキーセットを持つ", () => {
    const sortedKeys = (scheme: Record<string, string>) =>
      Object.keys(scheme).sort();
    const expected = sortedKeys(COLOR_SCHEMES.default);
    for (const name of Object.keys(
      COLOR_SCHEMES,
    ) as (keyof typeof COLOR_SCHEMES)[]) {
      expect(sortedKeys(COLOR_SCHEMES[name])).toEqual(expected);
    }
  });

  test("全スキームに selected 用の変数が含まれる", () => {
    for (const scheme of Object.values(COLOR_SCHEMES)) {
      expect(scheme["--cal-selected-bg"]).toBeTruthy();
      expect(scheme["--cal-selected-fg"]).toBeTruthy();
    }
  });

  test("全スキームに range-preview 用の変数が含まれる", () => {
    for (const scheme of Object.values(COLOR_SCHEMES)) {
      expect(scheme["--cal-range-preview-bg"]).toBeTruthy();
    }
  });
});
