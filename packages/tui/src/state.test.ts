import { describe, expect, test } from "vitest";
import { getCursorDate } from "./cursor.ts";
import { createCalendarState, rebuildState } from "./state.ts";

const TODAY = new Date(2026, 8, 15); // 2026-09-15

describe("createCalendarState", () => {
  test("デフォルトで today の年月を表示する", () => {
    const state = createCalendarState({ today: TODAY });
    expect(state.year).toBe(2026);
    expect(state.month).toBe(9);
  });

  test("カーソルは今日のセルに置かれる", () => {
    const state = createCalendarState({ today: TODAY });
    expect(getCursorDate(state)).toEqual(TODAY);
  });

  test("initialYear / initialMonth を指定できる", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2030,
      initialMonth: 3,
    });
    expect(state.year).toBe(2030);
    expect(state.month).toBe(3);
    expect(state.monthData.title).toBe("March 2030");
  });

  test("initialCursor を指定できる", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 2, col: 3 },
    });
    expect(state.cursor).toEqual({ row: 2, col: 3 });
  });

  test("selectedDate は初期状態で null", () => {
    const state = createCalendarState({ today: TODAY });
    expect(state.selectedDate).toBeNull();
  });

  test("ロケールを指定すると月データに反映される", () => {
    const state = createCalendarState({ today: TODAY, locale: "ja" });
    expect(state.monthData.title).toBe("9月 2026");
  });

  test("initialMonth 13 は翌年1月に正規化される", () => {
    const state = createCalendarState({ today: TODAY, initialMonth: 13 });
    expect(state.year).toBe(2027);
    expect(state.month).toBe(1);
    // 状態と月データの不整合が起きない
    expect(state.monthData.year).toBe(2027);
    expect(state.monthData.month).toBe(1);
  });

  test("initialMonth 0 は前年12月に正規化される", () => {
    const state = createCalendarState({ today: TODAY, initialMonth: 0 });
    expect(state.year).toBe(2025);
    expect(state.month).toBe(12);
  });

  test("initialYear と組み合わせても正規化される", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2024,
      initialMonth: 13,
    });
    expect(state.year).toBe(2025);
    expect(state.month).toBe(1);
  });

  test("Invalid Date の today は RangeError", () => {
    expect(() => createCalendarState({ today: new Date("invalid") })).toThrow(
      RangeError,
    );
  });

  test("NaN の initialYear / initialMonth は RangeError", () => {
    expect(() => createCalendarState({ initialYear: NaN })).toThrow(RangeError);
    expect(() => createCalendarState({ initialMonth: NaN })).toThrow(
      RangeError,
    );
  });

  test("initialYear 0 は 1 にクランプされる", () => {
    const state = createCalendarState({ today: TODAY, initialYear: 0 });
    expect(state.year).toBe(1);
    expect(state.monthData.title).toBe("January 1");
  });

  test("initialYear 10000 は 9999 にクランプされる", () => {
    const state = createCalendarState({ today: TODAY, initialYear: 10000 });
    expect(state.year).toBe(9999);
    expect(state.month).toBe(12);
    expect(state.monthData.title).toBe("December 9999");
  });

  test("今日が表示月に無ければカーソルは最初の日付セルに置かれる", () => {
    const state = createCalendarState({
      today: TODAY, // 2026-09-15
      initialYear: 2020,
      initialMonth: 1,
    });
    expect(state.year).toBe(2020);
    expect(state.month).toBe(1);
    const firstDay = state.monthData.cells.flat().find((c) => c.day !== null)!;
    // 2020-01-01 は水曜日（weekStart sunday → col 3）
    expect(state.cursor).toEqual({ row: 0, col: 3 });
    expect(getCursorDate(state)).toEqual(firstDay.date);
  });

  test("今日が表示月に無い場合の初期カーソル位置に選択日は無い", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2020,
      initialMonth: 1,
    });
    expect(state.selectedDate).toBeNull();
  });
});

describe("rebuildState", () => {
  test("範囲外の month も正規化され、state と monthData が乖離しない", () => {
    const base = createCalendarState({ today: TODAY });
    const rebuilt = rebuildState(2026, 13, base.cursor, null, base.options);
    expect(rebuilt.year).toBe(2027);
    expect(rebuilt.month).toBe(1);
    expect(rebuilt.monthData.year).toBe(2027);
    expect(rebuilt.monthData.month).toBe(1);
    expect(rebuilt.monthData.title).toBe("January 2027");
  });

  test("範囲外の year もクランプされる", () => {
    const base = createCalendarState({ today: TODAY });
    const rebuilt = rebuildState(10000, 1, base.cursor, null, base.options);
    expect(rebuilt.year).toBe(9999);
    expect(rebuilt.month).toBe(12);
    expect(rebuilt.monthData.year).toBe(9999);
    expect(rebuilt.monthData.month).toBe(12);
  });

  test("正規な年月は従来どおり再構築される", () => {
    const base = createCalendarState({ today: TODAY });
    const rebuilt = rebuildState(2026, 10, base.cursor, null, base.options);
    expect(rebuilt.year).toBe(2026);
    expect(rebuilt.month).toBe(10);
    expect(rebuilt.cursor).toEqual(base.cursor);
  });
});
