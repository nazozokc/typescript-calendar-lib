import { describe, expect, test } from "vitest";
import { getSwipeDirection } from "./swipe.ts";

describe("getSwipeDirection", () => {
  test("左スワイプは翌月", () => {
    expect(getSwipeDirection({ x: 200, y: 100 }, { x: 100, y: 100 })).toBe(
      "next",
    );
  });

  test("右スワイプは前月", () => {
    expect(getSwipeDirection({ x: 100, y: 100 }, { x: 200, y: 100 })).toBe(
      "prev",
    );
  });

  test("閾値未満の移動は無視する", () => {
    expect(
      getSwipeDirection({ x: 100, y: 100 }, { x: 140, y: 100 }),
    ).toBeNull();
  });

  test("縦移動が支配的な場合はスクロールとして無視する", () => {
    expect(
      getSwipeDirection({ x: 100, y: 100 }, { x: 160, y: 200 }),
    ).toBeNull();
  });

  test("閾値を明示して上書きできる", () => {
    expect(getSwipeDirection({ x: 100, y: 100 }, { x: 140, y: 100 }, 30)).toBe(
      "prev",
    );
  });
});
