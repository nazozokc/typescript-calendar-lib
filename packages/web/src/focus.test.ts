import { describe, expect, test } from "vitest";
import { getFocusDate } from "./focus.ts";

const OPTIONS = { year: 2026, month: 9 };

describe("getFocusDate", () => {
  test("表示月内の cursorDate を最優先で返す（時刻も保持）", () => {
    const cursor = new Date(2026, 8, 15, 13, 45);
    expect(getFocusDate({ ...OPTIONS, cursorDate: cursor })).toBe(cursor);
  });

  test("cursorDate が表示月外なら today を使う", () => {
    const today = new Date(2026, 8, 17);
    expect(
      getFocusDate({ ...OPTIONS, cursorDate: new Date(2026, 7, 20), today }),
    ).toBe(today);
  });

  test("cursorDate が選択不可なら today を使う", () => {
    const today = new Date(2026, 8, 17);
    expect(
      getFocusDate({
        ...OPTIONS,
        cursorDate: new Date(2026, 8, 1),
        today,
        isDateDisabled: (date) => date.getDate() === 1,
      }),
    ).toBe(today);
  });

  test("today も選択不可なら月内で最初の有効日を返す", () => {
    const result = getFocusDate({
      ...OPTIONS,
      isDateDisabled: (date) => date.getDate() <= 5,
    });
    expect(result?.getDate()).toBe(6);
  });

  test("全日が選択不可なら null を返す", () => {
    expect(getFocusDate({ ...OPTIONS, isDateDisabled: () => true })).toBeNull();
  });

  test("今日が表示月内なら cursorDate より後、先頭日より前に来る", () => {
    const today = new Date(2026, 8, 10);
    expect(getFocusDate({ ...OPTIONS, today })?.getDate()).toBe(10);
  });
});
