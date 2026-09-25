import { describe, expect, test } from "vitest";
import { calendar, calendarRange, calendarYear } from "./calendar.ts";

describe("calendar", () => {
  test("月タイトルを含む", () => {
    const out = calendar({ year: 2026, month: 9 });
    expect(out).toContain("September 2026");
  });

  test("日付グリッドを含む", () => {
    const out = calendar({ year: 2026, month: 9 });
    expect(out).toContain(" 1");
    expect(out).toContain("30");
  });

  test("指定月以外の日付を含まない", () => {
    const out = calendar({ year: 2026, month: 2 });
    expect(out).not.toContain("March 2026");
  });

  test("ハイライトを反映する", () => {
    const out = calendar({
      year: 2026,
      month: 9,
      highlight: new Date(2026, 8, 8),
    });
    expect(out).toContain("[8]");
  });

  test("パラメータを渡し忘れた場合でもデフォルト動作する", () => {
    const out = calendar({ year: 2026, month: 9 });
    expect(out).toContain("Sun Mon Tue Wed Thu Fri Sat");
  });
});

describe("calendarYear", () => {
  test("12ヶ月全てのタイトルを含む", () => {
    const out = calendarYear({ year: 2026 });
    for (const m of [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]) {
      expect(out).toContain(`${m} 2026`);
    }
  });

  test("4列×3行構成である", () => {
    const out = calendarYear({ year: 2026 });
    const firstLine = out.split("\n")[0]!;
    expect(firstLine).toContain("January 2026");
    expect(firstLine).toContain("February 2026");
    expect(firstLine).toContain("March 2026");
    expect(firstLine).toContain("April 2026");
  });

  test("日本語ロケールを反映する", () => {
    const out = calendarYear({ year: 2026, locale: "ja" });
    expect(out).toContain("1月 2026");
    expect(out).toContain("12月 2026");
  });
});

describe("calendarRange", () => {
  test("範囲の年月のみを含む", () => {
    const out = calendarRange({
      from: new Date(2026, 5, 1),
      to: new Date(2026, 8, 30),
    });
    expect(out).toContain("June 2026");
    expect(out).toContain("September 2026");
    expect(out).not.toContain("May 2026");
    expect(out).not.toContain("October 2026");
  });

  test("同月範囲は1ヶ月分", () => {
    const out = calendarRange({
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 30),
    });
    const count = out
      .split("\n")
      .filter((l) => l.includes("September 2026")).length;
    expect(count).toBe(1);
  });

  test("ハイライトを反映する", () => {
    const out = calendarRange({
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 30),
      highlight: new Date(2026, 8, 8),
    });
    expect(out).toContain("[8]");
  });
});

describe("showWeekNumbers", () => {
  test("月曜始まりなら ISO 週番号が行頭に表示される（2026-09）", () => {
    const out = calendar({
      year: 2026,
      month: 9,
      weekStart: "monday",
      showWeekNumbers: true,
    });
    // 2026-09 の第1週は 8/31 を含む週 → ISO 第36週
    const lines = out.split("\n");
    expect(lines[2]).toContain("36");
    // 月曜始まりの行頭は ISO 週: 9/7 週 = 第37週
    expect(lines[3]).toContain("37");
  });

  test("日曜始まりなら年始包含週の週番号が行頭に表示される（2026-09）", () => {
    const out = calendar({
      year: 2026,
      month: 9,
      weekStart: "sunday",
      showWeekNumbers: true,
    });
    // 2026-09 の第1行は 8/30 を含む週。年始(1/1)を含む週を第1週とする規則で第36週
    const lines = out.split("\n");
    expect(lines[2]).toContain("36");
    // 9/6 の週は第37週
    expect(lines[3]).toContain("37");
  });

  test("既定では週番号は表示されない", () => {
    const out = calendar({ year: 2026, month: 9, weekStart: "monday" });
    const lines = out.split("\n");
    // 週番号なしの場合は行頭の空白を取り除くと日番号（1）から始まる
    expect(lines[2]!.trimStart().startsWith("1 ")).toBe(true);
  });

  test("年末年始の月で週番号が 53 → 1 に切り替わる（2027-01 月曜始まり）", () => {
    const out = calendar({
      year: 2027,
      month: 1,
      weekStart: "monday",
      showWeekNumbers: true,
    });
    // 2027-01-01 は金曜。月曜始まりの ISO 週で 2026-12-28 の週は第53週
    const lines = out.split("\n");
    expect(lines[2]).toContain("53");
    // 2027-01-04 の週は ISO 第1週
    expect(lines[3]).toContain(" 1");
  });
});
