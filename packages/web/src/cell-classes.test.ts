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

  test("範囲の両端に start / end クラスが付く", () => {
    const range = {
      from: new Date(2026, 8, 10),
      to: new Date(2026, 8, 20),
    };
    const start = getCellClasses(range.from, { range });
    const middle = getCellClasses(TODAY, { range });
    const end = getCellClasses(range.to, { range });
    expect(start).toContain("is-range-start");
    expect(start).not.toContain("is-range-end");
    expect(middle).not.toContain("is-range-start");
    expect(middle).not.toContain("is-range-end");
    expect(end).toContain("is-range-end");
  });

  test("1 日だけの範囲は start と end の両方が付く", () => {
    const classes = getCellClasses(TODAY, {
      range: { from: TODAY, to: TODAY },
    });
    expect(classes).toContain("is-range-start");
    expect(classes).toContain("is-range-end");
  });

  test("範囲プレビューも両端が分かる", () => {
    const rangePreview = {
      from: new Date(2026, 8, 10),
      to: new Date(2026, 8, 20),
    };
    expect(getCellClasses(rangePreview.from, { rangePreview })).toContain(
      "is-range-preview-start",
    );
    expect(getCellClasses(rangePreview.to, { rangePreview })).toContain(
      "is-range-preview-end",
    );
    expect(getCellClasses(TODAY, { rangePreview })).not.toContain(
      "is-range-preview-start",
    );
  });
});
