import { describe, expect, test } from "vitest";
import { buildRangePreview } from "./range-preview.ts";

describe("buildRangePreview", () => {
  const jun1 = new Date(2026, 5, 1);
  const jun5 = new Date(2026, 5, 5);
  const jun10 = new Date(2026, 5, 10);

  test("selected < hovered → from = selected", () => {
    const result = buildRangePreview(jun1, jun10);
    expect(result).toEqual({ from: jun1, to: jun10 });
  });

  test("selected > hovered → from = hovered（逆順ホバーをソート）", () => {
    const result = buildRangePreview(jun10, jun1);
    expect(result).toEqual({ from: jun1, to: jun10 });
  });

  test("selected = hovered → from = to（1日分の範囲）", () => {
    const result = buildRangePreview(jun5, jun5);
    expect(result).toEqual({ from: jun5, to: jun5 });
  });

  test("selected が null → undefined", () => {
    expect(buildRangePreview(null, jun10)).toBeUndefined();
  });

  test("hovered が null → undefined", () => {
    expect(buildRangePreview(jun1, null)).toBeUndefined();
  });

  test("両方 null → undefined", () => {
    expect(buildRangePreview(null, null)).toBeUndefined();
  });

  test("同じ日付の Date インスタンスが from/to に設定される", () => {
    const date = new Date(2026, 5, 15);
    const result = buildRangePreview(date, new Date(2026, 5, 20));
    expect(result?.from).toBe(date);
  });

  test("逆順で hovered の Date インスタンスが from になる", () => {
    const a = new Date(2026, 5, 10);
    const b = new Date(2026, 5, 3);
    const result = buildRangePreview(a, b);
    expect(result?.from).toBe(b);
    expect(result?.to).toBe(a);
  });
});
