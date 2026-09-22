import { describe, expect, test } from "vitest";
import { getCursorDate } from "./cursor.ts";
import {
  goToDate,
  goToMonth,
  goToToday,
  navigateMonth,
  navigateYear,
  shiftMonth,
} from "./navigation.ts";
import { selectDate } from "./selection.ts";
import { createCalendarState } from "./state.ts";

const TODAY = new Date(2026, 8, 15); // 2026-09-15

describe("navigateMonth", () => {
  test("翌月へ移動する", () => {
    const state = createCalendarState({ today: TODAY });
    const next = navigateMonth(state, "next");
    expect(next.year).toBe(2026);
    expect(next.month).toBe(10);
    expect(next.monthData.title).toBe("October 2026");
  });

  test("前月へ移動する", () => {
    const state = createCalendarState({ today: TODAY });
    const prev = navigateMonth(state, "prev");
    expect(prev.year).toBe(2026);
    expect(prev.month).toBe(8);
    expect(prev.monthData.title).toBe("August 2026");
  });

  test("年末を跨ぐと年が進む", () => {
    const state = createCalendarState({ today: new Date(2026, 11, 15) });
    const next = navigateMonth(state, "next");
    expect(next.year).toBe(2027);
    expect(next.month).toBe(1);
  });

  test("年始を跨ぐと年が戻る", () => {
    const state = createCalendarState({ today: new Date(2026, 0, 15) });
    const prev = navigateMonth(state, "prev");
    expect(prev.year).toBe(2025);
    expect(prev.month).toBe(12);
  });

  test("移動後もロケールと選択状態が保持される", () => {
    const state = createCalendarState({ today: TODAY, locale: "ja" });
    const selected = selectDate(state);
    const next = navigateMonth(selected, "next");
    expect(next.monthData.title).toBe("10月 2026");
    expect(next.selectedDate).toEqual(TODAY);
  });

  test("移動後もカーソルは新月の範囲にクランプされる", () => {
    // 2026-03 は5行 → 2026-02 は4行。5行目のカーソルが月移動で4行にクランプされる
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2026,
      initialMonth: 3,
      initialCursor: { row: 4, col: 6 },
    });
    const prev = navigateMonth(state, "prev");
    expect(prev.monthData.title).toBe("February 2026");
    expect(prev.cursor).toEqual({ row: 3, col: 6 });
  });

  test("月初の1日から翌月へ移動してもカーソルが空欄に落ちない", () => {
    // 2026-09-01 は火曜（row0 col2）→ 2026-10 の row0 col2 は空欄（10/1 は木曜 col4）
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 0, col: 2 }, // 9月1日
    });
    const next = navigateMonth(state, "next");
    expect(next.cursor).not.toBeNull();
    expect(getCursorDate(next)).toEqual(new Date(2026, 9, 1));
    expect(next.cursor).toEqual({ row: 0, col: 4 });
  });

  test("新月の同じ位置が disabled なら有効セルへスナップされる", () => {
    // カーソルは 9/15（row2 col2）。10/13（row2 col2 相当）が disabled なら 10/12 へ
    const state = createCalendarState({
      today: TODAY,
      isDateDisabled: (d: Date) => d.getDate() === 13,
    });
    const next = navigateMonth(state, "next");
    expect(next.cursor).not.toBeNull();
    expect(getCursorDate(next)).toEqual(new Date(2026, 9, 12));
  });

  test("カーソル未設定（カーソル null）のまま移動してもカーソルは null のまま", () => {
    // 全セル disabled だと初期カーソルは置かれない（null のまま）
    const state = createCalendarState({
      today: TODAY,
      isDateDisabled: () => true,
    });
    expect(state.cursor).toBeNull();
    const next = navigateMonth(state, "next");
    expect(next.cursor).toBeNull();
  });

  test("サポート範囲の最小では前月へ移動しない (year 1, month 1)", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 1,
      initialMonth: 1,
    });
    const prev = navigateMonth(state, "prev");
    expect(prev.year).toBe(1);
    expect(prev.month).toBe(1);
    expect(prev.monthData.title).toBe("January 1");
  });

  test("サポート範囲の最大では翌月へ移動しない (year 9999, month 12)", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 9999,
      initialMonth: 12,
    });
    const next = navigateMonth(state, "next");
    expect(next.year).toBe(9999);
    expect(next.month).toBe(12);
    expect(next.monthData.title).toBe("December 9999");
  });
});

describe("navigateYear", () => {
  test("翌年へ移動する", () => {
    const state = createCalendarState({ today: TODAY });
    const next = navigateYear(state, "next");
    expect(next.year).toBe(2027);
    expect(next.month).toBe(9);
  });

  test("前年へ移動する", () => {
    const state = createCalendarState({ today: TODAY });
    const prev = navigateYear(state, "prev");
    expect(prev.year).toBe(2025);
    expect(prev.month).toBe(9);
  });

  test("サポート範囲の端では移動しない", () => {
    const min = createCalendarState({
      today: TODAY,
      initialYear: 1,
      initialMonth: 1,
    });
    expect(navigateYear(min, "prev")).toBe(min);

    const max = createCalendarState({
      today: TODAY,
      initialYear: 9999,
      initialMonth: 12,
    });
    expect(navigateYear(max, "next")).toBe(max);
  });
});

describe("goToMonth / goToToday", () => {
  test("指定した年月へジャンプする", () => {
    const state = createCalendarState({ today: TODAY });
    const jumped = goToMonth(state, 2024, 2);
    expect(jumped.year).toBe(2024);
    expect(jumped.month).toBe(2);
    expect(jumped.monthData.title).toBe("February 2024");
  });

  test("month が範囲外でも正規化される (13 → 翌年1月)", () => {
    const state = createCalendarState({ today: TODAY });
    const jumped = goToMonth(state, 2026, 13);
    expect(jumped.year).toBe(2027);
    expect(jumped.month).toBe(1);
  });

  test("範囲外の year はクランプされ state と monthData が乖離しない", () => {
    const state = createCalendarState({ today: TODAY });
    const jumped = goToMonth(state, 10000, 1);
    expect(jumped.year).toBe(9999);
    expect(jumped.month).toBe(12);
    expect(jumped.monthData.year).toBe(9999);
    expect(jumped.monthData.month).toBe(12);

    const low = goToMonth(state, 0, 6);
    expect(low.year).toBe(1);
    expect(low.month).toBe(1);
    expect(low.monthData.year).toBe(1);
    expect(low.monthData.month).toBe(1);
  });

  test("今日の月へジャンプしカーソルを今日に置く", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2020,
      initialMonth: 1,
    });
    const now = goToToday(state);
    expect(now.year).toBe(2026);
    expect(now.month).toBe(9);
    expect(getCursorDate(now)).toEqual(TODAY);
  });

  test("指定日付の月へジャンプしカーソルをその日付に置く", () => {
    const state = createCalendarState({ today: TODAY });
    const target = new Date(2024, 1, 14);
    const jumped = goToDate(state, target);
    expect(jumped.year).toBe(2024);
    expect(jumped.month).toBe(2);
    expect(jumped.monthData.title).toBe("February 2024");
    expect(getCursorDate(jumped)).toEqual(target);
  });

  test("年跨ぎの日付にもジャンプできる", () => {
    const state = createCalendarState({ today: TODAY });
    const jumped = goToDate(state, new Date(2027, 0, 5));
    expect(jumped.year).toBe(2027);
    expect(jumped.month).toBe(1);
    expect(getCursorDate(jumped)).toEqual(new Date(2027, 0, 5));
  });

  test("ジャンプ後もロケールと選択状態が保持される", () => {
    const state = createCalendarState({ today: TODAY, locale: "ja" });
    const selected = selectDate(state);
    const jumped = goToDate(selected, new Date(2026, 8, 20));
    expect(jumped.monthData.title).toBe("9月 2026");
    expect(jumped.selectedDate).toEqual(TODAY);
  });

  test("サポート範囲外の日付はクランプされ state と monthData が乖離しない", () => {
    const state = createCalendarState({ today: TODAY });
    // year 10000 は有効な Date だが、クランプ後に表示できない日付なのでカーソルは null
    const jumped = goToDate(state, new Date(10000, 0, 1));
    expect(jumped.year).toBe(9999);
    expect(jumped.month).toBe(12);
    expect(jumped.monthData.year).toBe(9999);
    expect(jumped.monthData.month).toBe(12);
    expect(jumped.cursor).toBeNull();
  });

  test("disabled の日付への goToDate は状態を変えない", () => {
    const state = createCalendarState({
      today: TODAY,
      isDateDisabled: (d) => d.getDate() === 20,
    });
    const jumped = goToDate(state, new Date(2026, 8, 20));
    expect(jumped).toEqual(state);
  });

  test("today が disabled なら goToToday のカーソルは最初の有効セルに置かれる", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2020,
      initialMonth: 1,
      isDateDisabled: (d) => d.getDate() === 15,
    });
    const now = goToToday(state);
    expect(now.year).toBe(2026);
    expect(now.month).toBe(9);
    // 15 が disabled → 1日(火) に置かれる
    expect(getCursorDate(now)).toEqual(new Date(2026, 8, 1));
  });
});

describe("ナビゲーションの入力検証", () => {
  test("goToDate に Invalid Date を渡すと RangeError", () => {
    const state = createCalendarState({ today: TODAY });
    expect(() => goToDate(state, new Date("invalid"))).toThrow(RangeError);
  });

  test("goToMonth に NaN を渡すと RangeError", () => {
    const state = createCalendarState({ today: TODAY });
    expect(() => goToMonth(state, NaN, 5)).toThrow(RangeError);
    expect(() => goToMonth(state, 2026, NaN)).toThrow(RangeError);
  });

  test("shiftMonth に NaN を渡すと RangeError", () => {
    expect(() => shiftMonth(NaN, 5, 0)).toThrow(RangeError);
    expect(() => shiftMonth(2026, NaN, 0)).toThrow(RangeError);
    expect(() => shiftMonth(2026, 5, NaN)).toThrow(RangeError);
  });

  test("shiftMonth の delta で正規化される", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });
});

describe("navigateYear の年クランプ", () => {
  test("year 1 で prev しても year 1 に留まる", () => {
    const state = createCalendarState({ today: TODAY, initialYear: 1 });
    const prev = navigateYear(state, "prev");
    expect(prev.year).toBe(1);
    expect(prev.month).toBe(9);
    expect(prev.monthData.title).toBe("September 1");
  });

  test("year 9999 で next しても year 9999 に留まる", () => {
    const state = createCalendarState({ today: TODAY, initialYear: 9999 });
    const next = navigateYear(state, "next");
    expect(next.year).toBe(9999);
    expect(next.month).toBe(9);
    expect(next.monthData.title).toBe("September 9999");
  });

  test("通常範囲では前年/翌年へ移動する", () => {
    const state = createCalendarState({ today: TODAY });
    expect(navigateYear(state, "next").year).toBe(2027);
    expect(navigateYear(state, "prev").year).toBe(2025);
  });
});
