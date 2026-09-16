import { describe, expect, test } from "vitest";
import {
  clampCursor,
  getCursorDate,
  moveCursor,
  setCursorToDate,
} from "./cursor.ts";
import { clearSelection, getSelectedDate, selectDate } from "./selection.ts";
import { createCalendarState } from "./state.ts";

const TODAY = new Date(2026, 8, 15); // 2026-09-15

describe("moveCursor", () => {
  test("右に移動する", () => {
    const state = createCalendarState({ today: TODAY });
    const moved = moveCursor(state, "right");
    expect(moved.cursor).toEqual({
      row: state.cursor!.row,
      col: state.cursor!.col + 1,
    });
  });

  test("左端から左に移動すると右端に折り返す", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 2, col: 0 },
    });
    const moved = moveCursor(state, "left");
    expect(moved.cursor).toEqual({ row: 2, col: 6 });
  });

  test("右端から右に移動すると左端に折り返す", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 2, col: 6 },
    });
    const moved = moveCursor(state, "right");
    expect(moved.cursor).toEqual({ row: 2, col: 0 });
  });

  test("上端から上に移動すると最終行に折り返す", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 0, col: 2 },
    });
    const moved = moveCursor(state, "up");
    expect(moved.cursor).toEqual({
      row: state.monthData.visibleRows - 1,
      col: 2,
    });
  });

  test("下端から下に移動すると先頭行に折り返す", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 4, col: 2 },
    });
    const moved = moveCursor(state, "down");
    expect(moved.cursor).toEqual({ row: 0, col: 2 });
  });

  test("範囲外のカーソルをクランプする（上方）", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: -3, col: -5 },
    });
    expect(state.cursor).toEqual({ row: 0, col: 0 });
  });

  test("カーソル未設定時は今日のセルにスナップする", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: null,
    });
    const moved = moveCursor(state, "down");
    expect(moved.cursor).not.toBeNull();
  });

  test("今日が表示月に無ければ最初の日付セルにスナップする", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2020,
      initialMonth: 1,
      initialCursor: null,
    });
    // 2020-01-01 は水曜日（sunday 始まり → col 3）
    // スナップ先 {row:0, col:3} → down で {row:1, col:3}
    const moved = moveCursor(state, "down");
    expect(moved.cursor).toEqual({ row: 1, col: 3 });
  });
});

describe("selectDate / getCursorDate", () => {
  test("カーソル位置の日付を選択する", () => {
    const state = createCalendarState({ today: TODAY });
    const selected = selectDate(state);
    expect(selected.selectedDate).toEqual(TODAY);
  });

  test("選択後もカーソルは動かせる", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 2, col: 2 },
    });
    const selected = selectDate(state);
    const moved = moveCursor(selected, "right");
    expect(moved.selectedDate).toEqual(getCursorDate(selected));
    expect(moved.cursor).not.toEqual(selected.cursor);
  });

  test("空欄セル上では選択されない", () => {
    // 2026-09: 行4 col4 は空欄（月末後）
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 4, col: 4 },
    });
    const selected = selectDate(state);
    expect(selected.selectedDate).toBeNull();
  });

  test("カーソルが空欄セルなら getCursorDate は null", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 4, col: 4 },
    });
    expect(getCursorDate(state)).toBeNull();
  });
});

describe("setCursorToDate", () => {
  test("当月内の日付のセルへカーソルを移動する", () => {
    const state = createCalendarState({ today: TODAY });
    const target = new Date(2026, 8, 20);
    const moved = setCursorToDate(state, target);
    expect(getCursorDate(moved)).toEqual(target);
  });

  test("当月外の日付なら状態を変えず返す", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 2, col: 2 },
    });
    const moved = setCursorToDate(state, new Date(2026, 9, 1));
    expect(moved).toEqual(state);
  });

  test("カーソル未設定でも指定日付にセットできる", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: null,
    });
    const target = new Date(2026, 8, 1);
    const moved = setCursorToDate(state, target);
    expect(getCursorDate(moved)).toEqual(target);
  });

  test("Invalid Date を渡すと RangeError", () => {
    const state = createCalendarState({ today: TODAY });
    expect(() => setCursorToDate(state, new Date("invalid"))).toThrow(
      RangeError,
    );
  });
});

describe("clampCursor の入力防御", () => {
  test("NaN のカーソルは null を返す", () => {
    const state = createCalendarState({ today: TODAY });
    expect(clampCursor({ row: NaN, col: NaN }, state.monthData)).toBeNull();
  });

  test("Infinity のカーソルは null を返す", () => {
    const state = createCalendarState({ today: TODAY });
    expect(clampCursor({ row: Infinity, col: 0 }, state.monthData)).toBeNull();
  });

  test("小数は整数に切り捨ててクランプされる", () => {
    const state = createCalendarState({ today: TODAY });
    expect(clampCursor({ row: 1.7, col: 2.3 }, state.monthData)).toEqual({
      row: 1,
      col: 2,
    });
  });
});

describe("moveCursor の空グリッド防御", () => {
  test("セルのないグリッドでは状態を変えず返す", () => {
    const state = createCalendarState({ today: TODAY });
    const emptyGrid = { ...state.monthData, cells: [], visibleRows: 0 };
    const custom = { ...state, monthData: emptyGrid };
    expect(moveCursor(custom, "up")).toBe(custom);
  });
});

describe("getSelectedDate / clearSelection", () => {
  test("選択中の日付を返す", () => {
    const state = createCalendarState({ today: TODAY });
    const selected = selectDate(state);
    expect(getSelectedDate(selected)).toEqual(TODAY);
  });

  test("未選択なら null を返す", () => {
    const state = createCalendarState({ today: TODAY });
    expect(getSelectedDate(state)).toBeNull();
  });

  test("選択を解除すると null に戻る", () => {
    const state = createCalendarState({ today: TODAY });
    const selected = selectDate(state);
    const cleared = clearSelection(selected);
    expect(cleared.selectedDate).toBeNull();
  });

  test("未選択の状態でも選択解除は安全に呼べる", () => {
    const state = createCalendarState({ today: TODAY });
    expect(clearSelection(state).selectedDate).toBeNull();
  });
});
