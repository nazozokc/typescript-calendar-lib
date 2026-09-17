import { createDate } from "@typescript-calendar-lib/core";
import { describe, expect, test, vi } from "vitest";
import { buildMonthData } from "./month-data.ts";
import { navigateMonth } from "./navigation.ts";
import { getDateData } from "./search.ts";
import { createCalendarState } from "./state.ts";
import { sameStateOptions } from "./state-options.ts";

const TODAY = new Date(2026, 8, 8); // 2026-09-08

describe("buildMonthData cellData", () => {
  test("実セルに data が付与される", () => {
    const data = buildMonthData(2026, 9, {
      today: TODAY,
      cellData: (date) => (date.getDate() === 15 ? "meeting" : undefined),
    });
    const cell15 = data.cells.flat().find((c) => c.day === 15)!;
    expect(cell15.data).toBe("meeting");
    const cell14 = data.cells.flat().find((c) => c.day === 14)!;
    expect(cell14.data).toBeUndefined();
  });

  test("null セルには cellData が呼ばれず data も付かない", () => {
    const fn = vi.fn();
    const data = buildMonthData(2026, 9, { today: TODAY, cellData: fn });
    const realCells = data.cells.flat().filter((c) => c.day !== null);
    const nullCells = data.cells.flat().filter((c) => c.day === null);
    expect(nullCells.length).toBeGreaterThan(0);
    for (const cell of nullCells) {
      expect(cell.data).toBeUndefined();
    }
    // 実セル数だけ呼ばれる（null セルには呼ばれない）
    expect(fn).toHaveBeenCalledTimes(realCells.length);
  });

  test("cellData 未指定時は全セルの data が undefined", () => {
    const data = buildMonthData(2026, 9, { today: TODAY });
    for (const cell of data.cells.flat()) {
      expect(cell.data).toBeUndefined();
    }
  });

  test("ジェネリクス型でデータの型を指定できる", () => {
    const data = buildMonthData<{ title: string }>(2026, 9, {
      cellData: (date) => ({ title: `day ${date.getDate()}` }),
    });
    const first = data.cells.flat().find((c) => c.day !== null)!;
    expect(first.data).toEqual({ title: "day 1" });
  });

  test("createDate と同値の日付に対して解決される", () => {
    const fn = vi.fn((date: Date) => date.getDate());
    buildMonthData(2026, 9, { today: TODAY, cellData: fn });
    expect(fn).toHaveBeenCalledWith(createDate(2026, 8, 1));
    expect(fn).toHaveBeenCalledWith(createDate(2026, 8, 30));
  });
});

describe("createCalendarState cellData", () => {
  test("state の月データに cellData の結果が含まれる", () => {
    const state = createCalendarState<string>({
      today: TODAY,
      initialYear: 2026,
      initialMonth: 9,
      cellData: (date) => (date.getDate() === 3 ? "holiday" : undefined),
    });
    const cell = state.monthData.cells.flat().find((c) => c.day === 3)!;
    expect(cell.data).toBe("holiday");
  });
});

describe("getDateData", () => {
  test("当月の日付のデータを返す", () => {
    const state = createCalendarState<{ title: string }>({
      today: TODAY,
      initialYear: 2026,
      initialMonth: 9,
      cellData: (date) =>
        date.getDate() === 15 ? { title: "meeting" } : undefined,
    });
    expect(getDateData(state, new Date(2026, 8, 15))).toEqual({
      title: "meeting",
    });
  });

  test("データ未設定の日付は undefined", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2026,
      initialMonth: 9,
      cellData: (date) => (date.getDate() === 15 ? "x" : undefined),
    });
    expect(getDateData(state, new Date(2026, 8, 14))).toBeUndefined();
  });

  test("当月に無い日付は undefined", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2026,
      initialMonth: 9,
    });
    expect(getDateData(state, new Date(2026, 10, 5))).toBeUndefined();
  });

  test("月移動後は新しい月のデータを返し、前月の日付には undefined を返す", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2026,
      initialMonth: 9,
      cellData: (date) => (date.getDate() === 1 ? "first" : undefined),
    });
    const next = navigateMonth(state, "next");
    expect(getDateData(next, new Date(2026, 9, 1))).toBe("first");
    expect(getDateData(next, new Date(2026, 8, 1))).toBeUndefined();
  });
});

describe("sameStateOptions cellData", () => {
  test("同一参照なら同じオプション、別参照なら異なる", () => {
    const f = (date: Date) => date.getDate();
    expect(sameStateOptions({ cellData: f }, { cellData: f })).toBe(true);
    expect(
      sameStateOptions({ cellData: f }, { cellData: (d: Date) => d.getDate() }),
    ).toBe(false);
    expect(
      sameStateOptions({ cellData: undefined }, { cellData: undefined }),
    ).toBe(true);
  });
});
