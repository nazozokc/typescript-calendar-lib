import { describe, expect, test } from "vitest";
import { getVersion, parseArgs, parseDate, resolveColor } from "./bin.ts";

describe("parseDate", () => {
  test("有効な日付をパースする", () => {
    expect(parseDate("2026-09-08")).toEqual(new Date(2026, 8, 8));
  });

  test("月の範囲外は null", () => {
    expect(parseDate("2026-13-01")).toBeNull();
  });

  test("日の範囲外は null", () => {
    expect(parseDate("2026-09-32")).toBeNull();
  });

  test("月の長さを超える日付は null", () => {
    expect(parseDate("2026-02-30")).toBeNull();
    expect(parseDate("2026-04-31")).toBeNull();
    expect(parseDate("2025-02-29")).toBeNull(); // 平年の2月29日
  });

  test("うるう年の2月29日は有効", () => {
    expect(parseDate("2024-02-29")).toEqual(new Date(2024, 1, 29));
  });

  test("形式が不正なら null", () => {
    expect(parseDate("2026/09/08")).toBeNull();
    expect(parseDate("2026-9-8")).toBeNull();
    expect(parseDate("hello")).toBeNull();
  });

  test("year 0000 は null（1900年代にずれない）", () => {
    expect(parseDate("0000-06-15")).toBeNull();
  });

  test("year 0050 は正しくパース（1950年代にずれない）", () => {
    const date = parseDate("0050-06-15");
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(50);
  });
});

describe("parseArgs", () => {
  test("引数なしは空のオプション", () => {
    expect(parseArgs([]).args).toEqual({});
  });

  test("year / month の位置引数", () => {
    const { args } = parseArgs(["2026", "9"]);
    expect(args.year).toBe(2026);
    expect(args.month).toBe(9);
  });

  test("year のみ", () => {
    const { args } = parseArgs(["2026"]);
    expect(args.year).toBe(2026);
    expect(args.month).toBeUndefined();
  });

  test("--theme と --color-scheme", () => {
    const { args } = parseArgs([
      "--theme",
      "modern",
      "--color-scheme",
      "ocean",
    ]);
    expect(args.theme).toBe("modern");
    expect(args.colorScheme).toBe("ocean");
  });

  test("--color フラグ", () => {
    const { args } = parseArgs(["--color"]);
    expect(args.color).toBe(true);
  });

  test("--locale と --week-start", () => {
    const { args } = parseArgs(["--locale", "ja", "--week-start", "monday"]);
    expect(args.locale).toBe("ja");
    expect(args.weekStart).toBe("monday");
  });

  test("--highlight と --highlight-style", () => {
    const { args } = parseArgs([
      "--highlight",
      "2026-09-08",
      "--highlight-style",
      "reverse",
    ]);
    expect(args.highlight).toEqual(new Date(2026, 8, 8));
    expect(args.highlightStyle).toBe("reverse");
  });

  test("--help を返す", () => {
    const result = parseArgs(["--help"]);
    expect(result.help).toBe(true);
  });

  test("-h でも help", () => {
    expect(parseArgs(["-h"]).help).toBe(true);
  });

  test("不明なオプションはエラー", () => {
    const result = parseArgs(["--unknown"]);
    expect(result.error).toContain("Unknown option");
  });

  test("不正な引数はエラー", () => {
    const result = parseArgs(["abc"]);
    expect(result.error).toBeDefined();
  });

  test("負の年は Unknown option ではなく年範囲エラーになる", () => {
    const result = parseArgs(["-1"]);
    expect(result.error).toContain("Invalid year");
    expect(result.error).not.toContain("Unknown option");
  });

  test("負の月は Unknown option ではなく月範囲エラーになる", () => {
    const result = parseArgs(["2026", "-5"]);
    expect(result.error).toContain("Invalid month");
  });

  test("不正な --locale はエラー", () => {
    const result = parseArgs(["--locale", "xx"]);
    expect(result.error).toContain("Invalid locale");
  });

  test("追加ロケールを指定できる", () => {
    for (const locale of ["es", "de", "fr", "ko", "zh"] as const) {
      const { args } = parseArgs(["--locale", locale]);
      expect(args.locale).toBe(locale);
    }
  });

  test("不正な --week-start はエラー", () => {
    const result = parseArgs(["--week-start", "friday"]);
    expect(result.error).toContain("Invalid week-start");
  });

  test("不正な --theme はエラー", () => {
    const result = parseArgs(["--theme", "fancy"]);
    expect(result.error).toContain("Invalid theme");
  });

  test("不正な --highlight 日付はエラー", () => {
    const result = parseArgs(["--highlight", "2026-13-99"]);
    expect(result.error).toContain("Invalid --highlight");
  });

  test("空の --highlight はエラー", () => {
    const result = parseArgs(["--highlight", ""]);
    expect(result.error).toContain("Invalid --highlight");
  });

  test("値必須オプションが最後の引数だとエラー", () => {
    for (const opt of [
      "--theme",
      "--color-scheme",
      "--locale",
      "--week-start",
      "--highlight",
      "--highlight-style",
    ]) {
      const result = parseArgs([opt]);
      expect(result.error).toContain(`Missing value for option: ${opt}`);
    }
  });

  test("不正な --highlight-style はエラー", () => {
    const result = parseArgs(["--highlight-style", "blink"]);
    expect(result.error).toContain("Invalid highlight-style");
  });

  test("数値の範囲外はエラー (year)", () => {
    const result = parseArgs(["0"]);
    expect(result.error).toContain("Invalid year");
  });

  test("数値の範囲外はエラー (month)", () => {
    const result = parseArgs(["2026", "13"]);
    expect(result.error).toContain("Invalid month");
  });

  test("引数が多すぎる場合はエラー", () => {
    const result = parseArgs(["2026", "9", "15"]);
    expect(result.error).toContain("Too many arguments");
  });

  test("オプションと数値の混在", () => {
    const { args } = parseArgs(["2026", "--color", "9"]);
    expect(args.year).toBe(2026);
    expect(args.month).toBe(9);
    expect(args.color).toBe(true);
  });

  test("--no-color は noColor を設定する", () => {
    const { args } = parseArgs(["--no-color"]);
    expect(args.noColor).toBe(true);
  });

  test("--year は yearView を設定する", () => {
    const { args } = parseArgs(["--year"]);
    expect(args.yearView).toBe(true);
  });

  test("--year と year 位置引数", () => {
    const { args } = parseArgs(["2026", "--year"]);
    expect(args.yearView).toBe(true);
    expect(args.year).toBe(2026);
  });

  test("--year と month 位置引数はエラー", () => {
    const result = parseArgs(["2026", "9", "--year"]);
    expect(result.error).toContain("Month cannot be used with --year");
  });

  test("--range で有効な日付範囲", () => {
    const { args } = parseArgs(["--range", "2026-01-01", "2026-03-31"]);
    expect(args.range).toEqual({
      from: new Date(2026, 0, 1),
      to: new Date(2026, 2, 31),
    });
  });

  test("--range で日付逆転はエラー", () => {
    const result = parseArgs(["--range", "2026-12-31", "2026-01-01"]);
    expect(result.error).toContain("--range");
    expect(result.error).toContain("from");
  });

  test("--range で不正な日付はエラー", () => {
    const result = parseArgs(["--range", "2026-13-01", "2026-12-31"]);
    expect(result.error).toContain("Invalid --range date");
  });

  test("--range で日付1つだけならエラー", () => {
    const result = parseArgs(["--range", "2026-01-01"]);
    expect(result.error).toContain("--range requires two dates");
  });

  test("--range のみ渡すとエラー", () => {
    const result = parseArgs(["--range"]);
    expect(result.error).toContain("--range requires two dates");
  });

  test("--range と位置引数はエラー", () => {
    const result = parseArgs(["2026", "--range", "2026-01-01", "2026-03-31"]);
    expect(result.error).toContain(
      "Positional arguments cannot be used with --range",
    );
  });

  test("--year と --range は同時に使えない", () => {
    const result = parseArgs(["--year", "--range", "2026-01-01", "2026-12-31"]);
    expect(result.error).toContain("--year and --range");
  });

  test("--today で有効な日付", () => {
    const { args } = parseArgs(["--today", "2026-09-08"]);
    expect(args.today).toEqual(new Date(2026, 8, 8));
  });

  test("--today に値がない場合はエラー", () => {
    const result = parseArgs(["--today"]);
    expect(result.error).toContain("Missing value for option: --today");
  });

  test("--today に不正な日付はエラー", () => {
    const result = parseArgs(["--today", "2026-13-01"]);
    expect(result.error).toContain("Invalid --today date");
  });

  test("-v は version フラグを返す", () => {
    expect(parseArgs(["-v"]).version).toBe(true);
  });

  test("--version は version フラグを返す", () => {
    expect(parseArgs(["--version"]).version).toBe(true);
  });
});

describe("resolveColor", () => {
  test("--no-color で false", () => {
    expect(resolveColor(undefined, true, {}, true)).toBe(false);
  });

  test("--color で true", () => {
    expect(resolveColor(true, undefined, {}, false)).toBe(true);
  });

  test("NO_COLOR 環境変数で false", () => {
    expect(resolveColor(undefined, undefined, { NO_COLOR: "1" }, true)).toBe(
      false,
    );
  });

  test("FORCE_COLOR 環境変数で true", () => {
    expect(
      resolveColor(undefined, undefined, { FORCE_COLOR: "1" }, false),
    ).toBe(true);
  });

  test("TTY なら true", () => {
    expect(resolveColor(undefined, undefined, {}, true)).toBe(true);
  });

  test("非 TTY なら false", () => {
    expect(resolveColor(undefined, undefined, {}, false)).toBe(false);
  });

  test("--color は NO_COLOR を上書き", () => {
    expect(resolveColor(true, undefined, { NO_COLOR: "1" }, false)).toBe(true);
  });

  test("--no-color は FORCE_COLOR を上書き", () => {
    expect(resolveColor(undefined, true, { FORCE_COLOR: "1" }, true)).toBe(
      false,
    );
  });

  test("--color は非 TTY を上書き", () => {
    expect(resolveColor(true, undefined, {}, false)).toBe(true);
  });

  test("--no-color は TTY を上書き", () => {
    expect(resolveColor(undefined, true, {}, true)).toBe(false);
  });

  test("フラグなし・環境変数なし・TTY false なら false", () => {
    expect(resolveColor(undefined, undefined, {}, false)).toBe(false);
  });

  test("NO_COLOR 空文字列は無視される", () => {
    expect(resolveColor(undefined, undefined, { NO_COLOR: "" }, true)).toBe(
      true,
    );
  });
});

describe("getVersion", () => {
  test("semver 形式の文字列を返す", () => {
    expect(getVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
