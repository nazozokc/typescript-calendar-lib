import { describe, expect, test } from "vitest";
import { formatCellLabel } from "./label.ts";

describe("formatCellLabel", () => {
  test("英語は「Month day, year」形式", () => {
    expect(formatCellLabel("en", 2026, 9, 15)).toBe("September 15, 2026");
  });

  test("日本語は「9月 15, 2026」形式", () => {
    expect(formatCellLabel("ja", 2026, 9, 15)).toBe("9月 15, 2026");
  });

  test("1桁の日付はゼロ埋めしない", () => {
    expect(formatCellLabel("en", 2026, 9, 5)).toBe("September 5, 2026");
  });
});
