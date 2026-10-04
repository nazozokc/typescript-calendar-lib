import { describe, expect, test } from "vitest";
import { getBlankClasses, getCellClasses } from "./cell-classes.ts";

const TODAY = new Date(2026, 8, 15); // 2026-09-15 (火)

describe("getBlankClasses", () => {
  // CSS は `td:empty` ではなくこのクラスで空白セルを判定する
  // （セル内に空白やコメントが入る状態で td:empty が効かなくなるため）
  test("空白セル用のクラスを返す", () => {
    expect(getBlankClasses()).toBe("is-blank");
  });

  test("空白セルは is-blank 以外の状態クラスを持たない", () => {
    const classes = getBlankClasses().split(/\s+/);
    expect(classes).not.toContain("is-today");
    expect(classes).not.toContain("is-selected");
    expect(classes).not.toContain("is-disabled");
    expect(classes).not.toContain("is-weekend");
  });
});

describe("getCellClasses", () => {
  test("状態が無い場合は空文字", () => {
    expect(getCellClasses(TODAY, {})).toBe("");
  });

  test("今日・選択・カーソルは独立して積み上がる（排他ではない）", () => {
    // これらは直交した状態。同じ日が「今日」かつ「選択済み」かつ「カーソル位置」で
    // あるのは普通にあり得るので、クラスも全部付く。
    const classes = getCellClasses(TODAY, {
      today: TODAY,
      selected: TODAY,
      cursorDate: TODAY,
    });
    expect(classes).toContain("is-today");
    expect(classes).toContain("is-selected");
    expect(classes).toContain("is-cursor");
  });

  test("選択不可は他の状態と併せても is-disabled が付く", () => {
    const classes = getCellClasses(TODAY, {
      today: TODAY,
      selected: TODAY,
      isDateDisabled: () => true,
    });
    expect(classes).toContain("is-disabled");
    expect(classes).toContain("is-today");
  });

  test("null の状態はクラス付けしない", () => {
    expect(getCellClasses(TODAY, { selected: null, cursorDate: null })).toBe(
      "",
    );
  });
});
