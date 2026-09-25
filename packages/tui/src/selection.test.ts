import { describe, expect, test } from "vitest";
import { navigateMonth } from "./navigation.ts";
import {
  clearSelection,
  getSelectedDate,
  getSelectedRange,
  selectDate,
  selectDateAt,
  selectRange,
} from "./selection.ts";
import { createCalendarState } from "./state.ts";
import { sameStateOptions } from "./state-options.ts";

const TODAY = new Date(2026, 8, 15); // 2026-09-15

function rangeState() {
  return createCalendarState({
    today: TODAY,
    initialCursor: null,
    selectionMode: "range",
  });
}

describe("range 選択モード", () => {
  test("1回目の選択はアンカーになる（範囲は未確定）", () => {
    const state = rangeState();
    const picked = selectDateAt(state, new Date(2026, 8, 10));
    expect(getSelectedDate(picked)).toEqual(new Date(2026, 8, 10));
    expect(getSelectedRange(picked)).toBeNull();
  });

  test("2回目の選択でアンカーとの間が確定範囲になる", () => {
    const state = rangeState();
    const anchor = selectDateAt(state, new Date(2026, 8, 10));
    const picked = selectDateAt(anchor, new Date(2026, 8, 15));
    expect(getSelectedRange(picked)).toEqual({
      from: new Date(2026, 8, 10),
      to: new Date(2026, 8, 15),
    });
    expect(getSelectedDate(picked)).toEqual(new Date(2026, 8, 15));
  });

  test("逆順に選択しても from <= to に整列される", () => {
    const state = rangeState();
    const anchor = selectDateAt(state, new Date(2026, 8, 15));
    const picked = selectDateAt(anchor, new Date(2026, 8, 10));
    expect(getSelectedRange(picked)).toEqual({
      from: new Date(2026, 8, 10),
      to: new Date(2026, 8, 15),
    });
  });

  test("同日を2回選ぶと1日の範囲になる", () => {
    const state = rangeState();
    const anchor = selectDateAt(state, new Date(2026, 8, 10));
    const picked = selectDateAt(anchor, new Date(2026, 8, 10));
    expect(getSelectedRange(picked)).toEqual({
      from: new Date(2026, 8, 10),
      to: new Date(2026, 8, 10),
    });
  });

  test("確定後の3回目の選択で新たなアンカーにリセットされる", () => {
    const state = rangeState();
    const a = selectDateAt(state, new Date(2026, 8, 10));
    const b = selectDateAt(a, new Date(2026, 8, 15));
    const c = selectDateAt(b, new Date(2026, 8, 20));
    expect(getSelectedDate(c)).toEqual(new Date(2026, 8, 20));
    expect(getSelectedRange(c)).toBeNull();
  });

  test("カーソル位置の selectDate でも同じ交互動作になる", () => {
    const state = rangeState();
    const withCursor = { ...state, cursor: { row: 1, col: 2 } }; // 2026-09-08
    const a = selectDate(withCursor);
    const b = selectDate(a); // カーソルは同じセルのまま
    expect(getSelectedRange(b)).toEqual({
      from: new Date(2026, 8, 8),
      to: new Date(2026, 8, 8),
    });
  });

  test("disabled セルは選択できない", () => {
    const state = createCalendarState({
      today: TODAY,
      selectionMode: "range",
      isDateDisabled: (date) => date.getDate() === 10,
    });
    const picked = selectDateAt(state, new Date(2026, 8, 10));
    expect(picked.selectedDate).toBeNull();
    expect(picked.selectedRange).toBeNull();
  });

  test("確定範囲は月移動後も保持される", () => {
    const state = rangeState();
    const a = selectDateAt(state, new Date(2026, 8, 10));
    const b = selectDateAt(a, new Date(2026, 8, 15));
    const next = navigateMonth(b, "next");
    expect(getSelectedRange(next)).toEqual({
      from: new Date(2026, 8, 10),
      to: new Date(2026, 8, 15),
    });
  });

  test("clearSelection はアンカーと範囲の両方をクリアする", () => {
    const state = rangeState();
    const a = selectDateAt(state, new Date(2026, 8, 10));
    const b = selectDateAt(a, new Date(2026, 8, 15));
    const cleared = clearSelection(b);
    expect(getSelectedDate(cleared)).toBeNull();
    expect(getSelectedRange(cleared)).toBeNull();
  });

  test("selectRange は直接範囲を設定する（順序を問わない）", () => {
    const state = rangeState();
    const picked = selectRange(
      state,
      new Date(2026, 8, 20),
      new Date(2026, 8, 10),
    );
    expect(getSelectedRange(picked)).toEqual({
      from: new Date(2026, 8, 10),
      to: new Date(2026, 8, 20),
    });
    expect(getSelectedDate(picked)).toEqual(new Date(2026, 8, 20));
  });
});

describe("single 選択モード（後方互換）", () => {
  test("選択すると selectedDate のみが更新され selectedRange は null", () => {
    const state = createCalendarState({ today: TODAY, initialCursor: null });
    const picked = selectDateAt(state, new Date(2026, 8, 10));
    expect(getSelectedDate(picked)).toEqual(new Date(2026, 8, 10));
    expect(getSelectedRange(picked)).toBeNull();
  });

  test("selectRange を呼ぶと選択範囲も保持される", () => {
    const state = createCalendarState({ today: TODAY, initialCursor: null });
    const picked = selectRange(
      state,
      new Date(2026, 8, 10),
      new Date(2026, 8, 15),
    );
    expect(getSelectedRange(picked)).not.toBeNull();
  });
});

describe("selectionMode と options 比較", () => {
  test("selectionMode が異なれば sameStateOptions は false", () => {
    expect(
      sameStateOptions({ selectionMode: "single" }, { selectionMode: "range" }),
    ).toBe(false);
    expect(
      sameStateOptions({ selectionMode: "range" }, { selectionMode: "range" }),
    ).toBe(true);
    expect(sameStateOptions({}, {})).toBe(true);
  });
});
