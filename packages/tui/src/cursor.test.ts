import { describe, expect, test } from "vitest";
import {
  clampCursor,
  getCursorDate,
  moveCursor,
  setCursorToDate,
  snapCursor,
} from "./cursor.ts";
import { buildMonthData } from "./month-data.ts";
import {
  clearSelection,
  getSelectedDate,
  selectDate,
  selectDateAt,
} from "./selection.ts";
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

  test("disabled の日付へはカーソルを移動できない", () => {
    const state = createCalendarState({
      today: TODAY,
      isDateDisabled: (d) => d.getDate() === 20,
    });
    const moved = setCursorToDate(state, new Date(2026, 8, 20));
    expect(moved).toEqual(state);
  });
});

describe("selectDate / selectDateAt の disabled ブロック", () => {
  const disabled15 = (d: Date) => d.getDate() === 15;

  test("disabled セル上では選択されない（selectDate）", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 2, col: 2 }, // 15(火)
      isDateDisabled: disabled15,
    });
    const selected = selectDate(state);
    expect(selected.selectedDate).toBeNull();
  });

  test("disabled セル上では選択されない（selectDateAt）", () => {
    const state = createCalendarState({
      today: TODAY,
      isDateDisabled: disabled15,
    });
    const selected = selectDateAt(state, new Date(2026, 8, 15));
    expect(selected).toEqual(state);
  });

  test("有効セルは従来どおり選択できる", () => {
    const state = createCalendarState({
      today: TODAY,
      isDateDisabled: disabled15,
    });
    const selected = selectDateAt(state, new Date(2026, 8, 16));
    expect(selected.selectedDate).toEqual(new Date(2026, 8, 16));
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

describe("snapCursor", () => {
  // 2026-09: 1日は火曜（row0 col2）。row0 の col0〜1 は空欄
  const data = buildMonthData(2026, 9);

  test("空欄セルから最も近い有効セルへスナップする", () => {
    expect(snapCursor({ row: 0, col: 0 }, data)).toEqual({ row: 0, col: 2 });
  });

  test("有効セルに対してはその位置を返す", () => {
    expect(snapCursor({ row: 2, col: 2 }, data)).toEqual({ row: 2, col: 2 });
  });

  test("範囲外の位置でも最も近い有効セルを返す", () => {
    const pos = snapCursor({ row: 99, col: 99 }, data);
    expect(pos).not.toBeNull();
    const cell = data.cells[pos!.row]![pos!.col]!;
    expect(cell.day).not.toBeNull();
    expect(cell.isDisabled).toBe(false);
  });

  test("選択不可セルはスキップされる", () => {
    const data2 = buildMonthData(2026, 9, {
      isDateDisabled: (d: Date) => d.getDate() === 1,
    });
    // row0 col2（9/1）は disabled → 隣の 9/2（row0 col3）へ
    expect(snapCursor({ row: 0, col: 2 }, data2)).toEqual({ row: 0, col: 3 });
  });

  test("有効セルが無ければ null を返す", () => {
    const allDisabled = buildMonthData(2026, 9, {
      isDateDisabled: () => true,
    });
    expect(snapCursor({ row: 0, col: 0 }, allDisabled)).toBeNull();
  });

  test("セルのないグリッドでは null を返す", () => {
    const emptyGrid = { ...data, cells: [], visibleRows: 0 };
    expect(snapCursor({ row: 0, col: 0 }, emptyGrid)).toBeNull();
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

describe("moveCursor の disabled スキップ", () => {
  // 2026-09-15 は火曜（row 2, col 2）
  const disableDay = (day: number) => (d: Date) => d.getDate() === day;

  test("右方向: disabled セルを飛ばして次の有効セルへ移動する", () => {
    // カーソルを 15(火) に置き、15 と 16(水) を disabled にすると、右 → 17(木) へ
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 2, col: 2 }, // 15(火)
      isDateDisabled: (d) => d.getDate() === 15 || d.getDate() === 16,
    });
    const moved = moveCursor(state, "right");
    expect(getCursorDate(moved)).toEqual(new Date(2026, 8, 17));
  });

  test("左方向: disabled セルを飛ばして次の有効セルへ移動する", () => {
    // カーソルを 15(火) に置き、15 と 14(月) を disabled にすると、左 → 13(日) へ
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 2, col: 2 }, // 15(火)
      isDateDisabled: (d) => d.getDate() === 15 || d.getDate() === 14,
    });
    const moved = moveCursor(state, "left");
    expect(getCursorDate(moved)).toEqual(new Date(2026, 8, 13));
  });

  test("上方向: disabled セルを飛ばす", () => {
    // 15(火, row2) の上の 8(火, row1) を disabled にすると、上 → 1(火, row0) へ
    const state = createCalendarState({
      today: TODAY,
      isDateDisabled: (d) => d.getDate() === 8,
    });
    const moved = moveCursor(state, "up");
    expect(getCursorDate(moved)).toEqual(new Date(2026, 8, 1));
  });

  test("下方向: disabled セルを飛ばす", () => {
    // 15(火, row2) の下の 22(火, row3) を disabled にすると、下 → 29(火, row4) へ
    const state = createCalendarState({
      today: TODAY,
      isDateDisabled: (d) => d.getDate() === 22,
    });
    const moved = moveCursor(state, "down");
    expect(getCursorDate(moved)).toEqual(new Date(2026, 8, 29));
  });

  test("全セルが disabled なら状態を変えず返す", () => {
    const state = createCalendarState({
      today: TODAY,
      isDateDisabled: () => true,
    });
    // 初期カーソルは置かれない（findTodayCell/findFirstDayCell が空を返す）
    const moved = moveCursor(state, "right");
    expect(moved).toEqual(state);
  });

  test("カーソルが disabled セル上にある場合でも次の有効セルへ移動できる", () => {
    // 初期カーソルを 15 に置いた後、isDateDisabled が変わることを想定
    // 15 を含む行で 16 を disabled にして、カーソルを 15 に置く
    const base = createCalendarState({
      today: TODAY,
      initialCursor: { row: 2, col: 2 }, // 15(火)
    });
    // 16 が disabled になるように monthData を再構築
    const data = buildMonthData(base.year, base.month, {
      ...base.options,
      isDateDisabled: disableDay(16),
    });
    const moved = moveCursor({ ...base, monthData: data }, "right");
    // 15 は有効なので 16(disabled) をスキップして 17 へ
    expect(getCursorDate(moved)).toEqual(new Date(2026, 8, 17));
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
