import { describe, expect, test } from "vitest";

import { createSlugger, slugify } from "./slug.ts";

describe("slugify", () => {
  test("Unicode 対応の URL フレンドリ id を作る", () => {
    expect(slugify("  Hello, World! ")).toBe("hello-world");
    expect(slugify("日本語 見出し")).toBe("日本語-見出し");
  });
});

describe("createSlugger", () => {
  test("重複見出しには連番を付ける", () => {
    const slug = createSlugger();
    expect([slug("Foo"), slug("Foo"), slug("Foo")]).toEqual([
      "foo",
      "foo-1",
      "foo-2",
    ]);
  });

  test("生成済み id と自然な slug が衝突しても重複しない", () => {
    const slug = createSlugger();
    expect([slug("Foo"), slug("Foo"), slug("Foo-1"), slug("Foo")]).toEqual([
      "foo",
      "foo-1",
      "foo-2",
      "foo-3",
    ]);
  });
});
