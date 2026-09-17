import { describe, expect, test } from "vitest";
import {
  buildMonthData,
  clampCursor,
  clearSelection,
  createCalendarState,
  findDateCell,
  findFirstDayCell,
  findTodayCell,
  getCursorDate,
  getSelectedDate,
  goToDate,
  goToMonth,
  goToToday,
  keyToAction,
  moveCursor,
  navigateMonth,
  navigateYear,
  selectDate,
  selectDateAt,
  setCursorToDate,
} from "./index.ts";

const TODAY = new Date(2026, 8, 15); // 2026-09-15

describe("public exports", () => {
  test("search helpers がエクスポートされている", () => {
    const data = buildMonthData(2026, 9, { today: TODAY });
    expect(typeof findTodayCell).toBe("function");
    expect(typeof findDateCell).toBe("function");
    expect(typeof findFirstDayCell).toBe("function");
    expect(typeof clampCursor).toBe("function");

    expect(findTodayCell(data)).toEqual({ row: 2, col: 2 });
    expect(findFirstDayCell(data)).toEqual({ row: 0, col: 2 });
    expect(findDateCell(data, TODAY)).toEqual({ row: 2, col: 2 });
    expect(clampCursor({ row: 9, col: 9 }, data)).toEqual({ row: 4, col: 6 });
  });

  test("状態管理 API がエクスポートされている", () => {
    createCalendarState({ today: TODAY });
    expect(typeof createCalendarState).toBe("function");
    expect(typeof moveCursor).toBe("function");
    expect(typeof selectDate).toBe("function");
    expect(typeof selectDateAt).toBe("function");
    expect(typeof clearSelection).toBe("function");
    expect(typeof getCursorDate).toBe("function");
    expect(typeof getSelectedDate).toBe("function");
    expect(typeof setCursorToDate).toBe("function");
  });

  test("ナビゲーション API がエクスポートされている", () => {
    createCalendarState({ today: TODAY });
    expect(typeof navigateMonth).toBe("function");
    expect(typeof navigateYear).toBe("function");
    expect(typeof goToMonth).toBe("function");
    expect(typeof goToDate).toBe("function");
    expect(typeof goToToday).toBe("function");
    expect(typeof buildMonthData).toBe("function");
  });

  test("キーボードマッピングがエクスポートされている", () => {
    expect(keyToAction("ArrowRight")).toBe("right");
    expect(keyToAction("ArrowLeft")).toBe("left");
    expect(keyToAction("ArrowDown")).toBe("down");
    expect(keyToAction("ArrowUp")).toBe("up");
    expect(keyToAction("PageUp")).toBe("prev");
    expect(keyToAction("PageDown")).toBe("next");
    expect(keyToAction("Enter")).toBeUndefined();
    expect(keyToAction("a")).toBeUndefined();
  });
});
