import { describe, expect, test } from "vitest";
import { createCalendarState } from "./state.ts";
import { sameStateOptions, updateStateOptions } from "./state-options.ts";

const TODAY = new Date(2026, 8, 15); // 2026-09-15

describe("sameStateOptions", () => {
  test("同じ値のオプションは true", () => {
    const a = { initialYear: 2026, initialMonth: 9, locale: "en" as const };
    expect(sameStateOptions(a, { ...a })).toBe(true);
  });

  test("異なる initialYear は false", () => {
    expect(sameStateOptions({ initialYear: 2026 }, { initialYear: 2027 })).toBe(
      false,
    );
  });

  test("異なる initialMonth は false", () => {
    expect(sameStateOptions({ initialMonth: 9 }, { initialMonth: 10 })).toBe(
      false,
    );
  });

  test("異なる locale は false", () => {
    expect(sameStateOptions({ locale: "en" }, { locale: "ja" })).toBe(false);
  });

  test("異なる weekStart は false", () => {
    expect(
      sameStateOptions({ weekStart: "sunday" }, { weekStart: "monday" }),
    ).toBe(false);
  });

  test("同名の Date は参照が異なっても true（値比較）", () => {
    const t1 = new Date(2026, 8, 15);
    const t2 = new Date(2026, 8, 15);
    expect(t1).not.toBe(t2);
    expect(sameStateOptions({ today: t1 }, { today: t2 })).toBe(true);
  });

  test("異なる日付の today は false", () => {
    expect(
      sameStateOptions(
        { today: new Date(2026, 8, 15) },
        { today: new Date(2026, 8, 16) },
      ),
    ).toBe(false);
  });

  test("today の有無は false", () => {
    expect(sameStateOptions({ today: new Date(2026, 8, 15) }, {})).toBe(false);
  });

  test("highlight の値が変わると false", () => {
    expect(
      sameStateOptions(
        { highlight: new Date(2026, 8, 10) },
        { highlight: new Date(2026, 8, 11) },
      ),
    ).toBe(false);
  });

  test("range.from だけ変わっても false", () => {
    expect(
      sameStateOptions(
        { range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) } },
        { range: { from: new Date(2026, 8, 2), to: new Date(2026, 8, 15) } },
      ),
    ).toBe(false);
  });

  test("range.to だけ変わっても false", () => {
    expect(
      sameStateOptions(
        { range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) } },
        { range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 16) } },
      ),
    ).toBe(false);
  });

  test("range の有無は false", () => {
    expect(
      sameStateOptions(
        { range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) } },
        {},
      ),
    ).toBe(false);
  });

  test("異なる isDateDisabled は false（参照比較）", () => {
    const f1 = (d: Date) => d.getDate() === 1;
    const f2 = (d: Date) => d.getDate() === 2;
    expect(
      sameStateOptions({ isDateDisabled: f1 }, { isDateDisabled: f1 }),
    ).toBe(true);
    expect(
      sameStateOptions({ isDateDisabled: f1 }, { isDateDisabled: f2 }),
    ).toBe(false);
    expect(sameStateOptions({ isDateDisabled: f1 }, {})).toBe(false);
  });

  test("両方 undefined のオプションは true", () => {
    expect(sameStateOptions({}, {})).toBe(true);
  });
});

describe("updateStateOptions", () => {
  test("表示月を維持しつつハイライトを変更できる", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2026,
      initialMonth: 9,
    });
    const next = updateStateOptions(
      state,
      { highlight: new Date(2026, 8, 20) },
      {},
    );
    expect(next.year).toBe(2026);
    expect(next.month).toBe(9);
    expect(next.monthData.title).toBe("September 2026");
    const highlighted = next.monthData.cells
      .flat()
      .filter((c) => c.isHighlight);
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]!.day).toBe(20);
  });

  test("initialYear/initialMonth が変わった時だけ年月が切り替わる", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2026,
      initialMonth: 9,
    });
    // previous と同じ initialYear → 年月は変わらない
    const unchanged = updateStateOptions(
      state,
      { initialYear: 2026, initialMonth: 9, highlight: new Date(2026, 8, 1) },
      { initialYear: 2026, initialMonth: 9 },
    );
    expect(unchanged.year).toBe(2026);
    expect(unchanged.month).toBe(9);

    // initialYear が変わった → 年月が切り替わる
    const changed = updateStateOptions(
      state,
      { initialYear: 2027, initialMonth: 9 },
      { initialYear: 2026, initialMonth: 9 },
    );
    expect(changed.year).toBe(2027);
    expect(changed.month).toBe(9);
    expect(changed.monthData.title).toBe("September 2027");
  });

  test("today を省略すると状態の today を引き継ぐ", () => {
    const state = createCalendarState({ today: TODAY });
    const next = updateStateOptions(state, { locale: "ja" }, {});
    expect(next.options.today).toEqual(TODAY);
    expect(next.monthData.title).toBe("9月 2026");
  });

  test("locale の変更が反映される", () => {
    const state = createCalendarState({ today: TODAY, locale: "en" });
    const next = updateStateOptions(state, { locale: "ja" }, { locale: "en" });
    expect(next.options.locale).toBe("ja");
    expect(next.monthData.title).toBe("9月 2026");
  });

  test("weekStart の変更が反映される", () => {
    const state = createCalendarState({ today: TODAY, weekStart: "sunday" });
    const next = updateStateOptions(
      state,
      { weekStart: "monday" },
      { weekStart: "sunday" },
    );
    expect(next.options.weekStart).toBe("monday");
    expect(next.monthData.weekdays[0]).toBe("Mon");
  });

  test("カーソル位置が維持される", () => {
    const state = createCalendarState({
      today: TODAY,
      initialCursor: { row: 2, col: 3 },
    });
    const next = updateStateOptions(
      state,
      { highlight: new Date(2026, 8, 20) },
      {},
    );
    expect(next.cursor).toEqual({ row: 2, col: 3 });
  });

  test("選択状態が維持される", () => {
    const state = createCalendarState({ today: TODAY });
    const selected = { ...state, selectedDate: TODAY };
    const next = updateStateOptions(
      selected,
      { highlight: new Date(2026, 8, 20) },
      {},
    );
    expect(next.selectedDate).toEqual(TODAY);
  });

  test("range の変更が月データに反映される", () => {
    const state = createCalendarState({ today: TODAY });
    const next = updateStateOptions(
      state,
      { range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 10) } },
      {},
    );
    const inRange = next.monthData.cells.flat().filter((c) => c.isInRange);
    expect(inRange).toHaveLength(10);
  });

  test("highlight の削除（undefined）が反映される", () => {
    const state = createCalendarState({
      today: TODAY,
      highlight: new Date(2026, 8, 20),
    });
    const next = updateStateOptions(
      state,
      { highlight: undefined },
      { highlight: new Date(2026, 8, 20) },
    );
    expect(next.monthData.cells.flat().some((c) => c.isHighlight)).toBe(false);
  });

  test("cursor は新月の範囲にクランプされる", () => {
    const state = createCalendarState({
      today: TODAY,
      initialYear: 2026,
      initialMonth: 3, // 5 rows
      initialCursor: { row: 4, col: 6 },
    });
    const next = updateStateOptions(
      state,
      { initialYear: 2026, initialMonth: 2 }, // 4 rows
      { initialYear: 2026, initialMonth: 3 },
    );
    expect(next.cursor).toEqual({ row: 3, col: 6 });
  });

  test("isDateDisabled の変更が月データに反映される", () => {
    const state = createCalendarState({ today: TODAY });
    const disable15 = (d: Date) => d.getDate() === 15;
    const next = updateStateOptions(state, { isDateDisabled: disable15 }, {});
    expect(next.options.isDateDisabled).toBe(disable15);
    const disabled = next.monthData.cells.flat().filter((c) => c.isDisabled);
    expect(disabled).toHaveLength(1);
    expect(disabled[0]!.day).toBe(15);
  });

  test("isDateDisabled の解除（undefined）が反映される", () => {
    const disable15 = (d: Date) => d.getDate() === 15;
    const state = createCalendarState({
      today: TODAY,
      isDateDisabled: disable15,
    });
    // next に undefined を渡すと解除される（highlight/range と同じ props 駆動）
    const next = updateStateOptions(
      state,
      { isDateDisabled: undefined },
      { isDateDisabled: disable15 },
    );
    expect(next.options.isDateDisabled).toBeUndefined();
    expect(next.monthData.cells.flat().some((c) => c.isDisabled)).toBe(false);
  });

  test("Invalid Date の today は RangeError", () => {
    const state = createCalendarState({ today: TODAY });
    expect(() =>
      updateStateOptions(state, { today: new Date("invalid") }, {}),
    ).toThrow(RangeError);
  });

  test("不正な range（from > to）は RangeError", () => {
    const state = createCalendarState({ today: TODAY });
    expect(() =>
      updateStateOptions(
        state,
        {
          range: {
            from: new Date(2026, 8, 15),
            to: new Date(2026, 8, 1),
          },
        },
        {},
      ),
    ).toThrow(RangeError);
  });
});
