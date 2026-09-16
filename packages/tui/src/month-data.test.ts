import { describe, expect, test } from "vitest";
import { buildMonthData } from "./month-data.ts";

const TODAY = new Date(2026, 8, 8); // 2026-09-08

describe("buildMonthData", () => {
  test("タイトルと曜日ヘッダーを含む", () => {
    const data = buildMonthData(2026, 9);
    expect(data.title).toBe("September 2026");
    expect(data.weekdays).toEqual([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
  });

  test("日本語ロケールと月曜始まりを反映する", () => {
    const data = buildMonthData(2026, 9, { locale: "ja", weekStart: "monday" });
    expect(data.title).toBe("9月 2026");
    expect(data.weekdays).toEqual(["月", "火", "水", "木", "金", "土", "日"]);
  });

  test("グリッドは6行×7列", () => {
    const data = buildMonthData(2026, 9);
    expect(data.cells).toHaveLength(6);
    for (const row of data.cells) {
      expect(row).toHaveLength(7);
    }
  });

  test("日付セルには Date オブジェクトが入る", () => {
    const data = buildMonthData(2026, 9);
    const cell = data.cells[0]!.find((c) => c.day !== null)!;
    expect(cell.date).toEqual(new Date(2026, 8, cell.day!));
  });

  test("空欄セルは day/date が null で isCurrentMonth が false", () => {
    const data = buildMonthData(2026, 9);
    const nullCell = data.cells[0]!.find((c) => c.day === null)!;
    expect(nullCell.day).toBeNull();
    expect(nullCell.date).toBeNull();
    expect(nullCell.isCurrentMonth).toBe(false);
  });

  test("当月のセルは isCurrentMonth が true", () => {
    const data = buildMonthData(2026, 9);
    const cell = data.cells[0]!.find((c) => c.day !== null)!;
    expect(cell.isCurrentMonth).toBe(true);
  });

  test("today を指定すると isToday が立つ", () => {
    const data = buildMonthData(2026, 9, { today: TODAY });
    const todayCells = data.cells.flat().filter((c) => c.isToday);
    expect(todayCells).toHaveLength(1);
    expect(todayCells[0]!.day).toBe(8);
  });

  test("highlight を指定すると isHighlight が立つ", () => {
    const data = buildMonthData(2026, 9, {
      today: TODAY,
      highlight: new Date(2026, 8, 15),
    });
    const highlighted = data.cells.flat().filter((c) => c.isHighlight);
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]!.day).toBe(15);
  });

  test("範囲内の日付に isInRange が立つ", () => {
    const data = buildMonthData(2026, 9, {
      today: TODAY,
      range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) },
    });
    const inRange = data.cells.flat().filter((c) => c.isInRange);
    expect(inRange).toHaveLength(15);
    expect(inRange.every((c) => c.day! >= 1 && c.day! <= 15)).toBe(true);
  });

  test("月跨ぎの範囲は当月の全セルを範囲内にする", () => {
    const data = buildMonthData(2026, 9, {
      today: TODAY,
      range: { from: new Date(2026, 7, 25), to: new Date(2026, 9, 5) },
    });
    const dateCells = data.cells.flat().filter((c) => c.day !== null);
    expect(dateCells.length).toBeGreaterThan(0);
    for (const cell of dateCells) {
      expect(cell.isInRange).toBe(true);
    }
  });

  test("範囲の片側だけが前月/翌月に跨がっても正しく判定される", () => {
    // from は前月25日、to は当月15日 → 当月の 1〜15 日のみ in range
    const data = buildMonthData(2026, 9, {
      today: TODAY,
      range: { from: new Date(2026, 7, 25), to: new Date(2026, 8, 15) },
    });
    const inRangeDays = data.cells
      .flat()
      .filter((c) => c.isInRange)
      .map((c) => c.day!);
    expect(inRangeDays).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    ]);
  });

  test("今日とハイライトは両立しうる", () => {
    const data = buildMonthData(2026, 9, {
      today: TODAY,
      highlight: TODAY,
    });
    const cell = data.cells.flat().find((c) => c.day === 8)!;
    expect(cell.isToday).toBe(true);
    expect(cell.isHighlight).toBe(true);
  });

  test("土曜・日曜に isWeekend が立つ（日曜始まり）", () => {
    // 2026-09-01 is Tuesday, so week 0: null,null,1,2,3,4,5
    // Sat=5th col, Sun=6th col
    const data = buildMonthData(2026, 9, { today: TODAY });
    for (const row of data.cells) {
      for (const cell of row) {
        if (cell.day === null) continue;
        // dayOfWeek: 0=Sun, 5=Sat, 6=Sun → weekend
        const isSaturdayOrSunday = cell.dayOfWeek === 0 || cell.dayOfWeek === 6;
        expect(cell.isWeekend).toBe(isSaturdayOrSunday);
      }
    }
  });

  test("土曜・日曜に isWeekend が立つ（月曜始まり）", () => {
    // 2026-09-01 is Tuesday, weekStart monday: 0=Mon,5=Sat,6=Sun
    const data = buildMonthData(2026, 9, { weekStart: "monday", today: TODAY });
    for (const row of data.cells) {
      for (const cell of row) {
        if (cell.day === null) continue;
        const isSaturdayOrSunday = cell.dayOfWeek === 5 || cell.dayOfWeek === 6;
        expect(cell.isWeekend).toBe(isSaturdayOrSunday);
      }
    }
  });

  test("空欄セルは isWeekend が false", () => {
    const data = buildMonthData(2026, 9, { today: TODAY });
    const nullCells = data.cells.flat().filter((c) => c.day === null);
    expect(nullCells.length).toBeGreaterThan(0);
    for (const cell of nullCells) {
      expect(cell.isWeekend).toBe(false);
    }
  });

  test("visibleRows は日付を含む行数（2026-09 は5行）", () => {
    const data = buildMonthData(2026, 9, { today: TODAY });
    expect(data.visibleRows).toBe(5);
  });

  test("visibleRows は日付を含む行数（2026-02 は4行）", () => {
    const data = buildMonthData(2026, 2, { today: TODAY });
    expect(data.visibleRows).toBe(4);
  });

  test("dayOfWeek は列位置と一致する", () => {
    const data = buildMonthData(2026, 9);
    data.cells.forEach((row) => {
      row.forEach((cell, colIdx) => {
        expect(cell.dayOfWeek).toBe(colIdx);
      });
    });
  });

  test("月跨ぎ・年跨ぎの日付は含まれない", () => {
    const data = buildMonthData(2026, 2, { today: TODAY });
    const days = data.cells.flat().map((c) => c.day);
    expect(days).not.toContain(28 + 1);
  });
});

describe("buildMonthData の入力検証・正規化", () => {
  test("month 13 は翌年1月に正規化される", () => {
    const data = buildMonthData(2026, 13, { today: TODAY });
    expect(data.year).toBe(2027);
    expect(data.month).toBe(1);
    expect(data.title).toBe("January 2027");
    const days = data.cells
      .flat()
      .map((c) => c.day)
      .filter((d): d is number => d !== null);
    expect(Math.max(...days)).toBe(31);
  });

  test("month 0 は前年12月に正規化される", () => {
    const data = buildMonthData(2026, 0, { today: TODAY });
    expect(data.year).toBe(2025);
    expect(data.month).toBe(12);
    expect(data.title).toBe("December 2025");
  });

  test("不正な year は RangeError", () => {
    expect(() => buildMonthData(NaN, 9)).toThrow(RangeError);
    expect(() => buildMonthData(Infinity, 9)).toThrow(RangeError);
    expect(() => buildMonthData(2026.5, 9)).toThrow(RangeError);
  });

  test("不正な month は RangeError", () => {
    expect(() => buildMonthData(2026, NaN)).toThrow(RangeError);
    expect(() => buildMonthData(2026, Infinity)).toThrow(RangeError);
    expect(() => buildMonthData(2026, 2.5)).toThrow(RangeError);
  });

  test("未対応のロケールは RangeError", () => {
    // @ts-expect-error 未対応ロケール
    expect(() => buildMonthData(2026, 9, { locale: "xx" })).toThrow(RangeError);
  });

  test("未対応の weekStart は RangeError", () => {
    // @ts-expect-error 未対応 weekStart
    expect(() => buildMonthData(2026, 9, { weekStart: "xx" })).toThrow(
      RangeError,
    );
  });

  test("Invalid Date の today は RangeError", () => {
    expect(() =>
      buildMonthData(2026, 9, { today: new Date("invalid") }),
    ).toThrow(RangeError);
  });

  test("Invalid Date の highlight は RangeError", () => {
    expect(() =>
      buildMonthData(2026, 9, { highlight: new Date("invalid") }),
    ).toThrow(RangeError);
  });

  test("Invalid Date の range は RangeError", () => {
    expect(() =>
      buildMonthData(2026, 9, {
        range: { from: new Date("invalid"), to: new Date(2026, 8, 5) },
      }),
    ).toThrow(RangeError);
    expect(() =>
      buildMonthData(2026, 9, {
        range: { from: new Date(2026, 8, 1), to: new Date("invalid") },
      }),
    ).toThrow(RangeError);
  });

  test("from > to の range は RangeError", () => {
    expect(() =>
      buildMonthData(2026, 9, {
        today: TODAY,
        range: { from: new Date(2026, 8, 15), to: new Date(2026, 8, 1) },
      }),
    ).toThrow(RangeError);
  });

  test("year 1-99 のセル日付が正しく生成される（1900年解釈しない）", () => {
    const data = buildMonthData(50, 9);
    const cell = data.cells[0]!.find((c) => c.day !== null)!;
    expect(cell.date!.getFullYear()).toBe(50);
    expect(cell.date!.getMonth()).toBe(8);
  });
});
