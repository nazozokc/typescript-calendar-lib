// ─── セルサイズ ───────────────────────────────────────────
// サイズ判定・CSS 変数変換は web パッケージに集約済み。
// ここでは React の style 型（CSSProperties）に適合させる薄いアダプタのみ持つ。

import type { CalendarSize } from "@typescript-calendar-lib/web";
import type { CSSProperties } from "react";

export type {
  CalendarCustomSize,
  CalendarSize,
  CalendarSizeName,
} from "@typescript-calendar-lib/web";
export { isSizeName } from "@typescript-calendar-lib/web";

import { buildSizeStyle as buildSizeStyleBase } from "@typescript-calendar-lib/web";

/** セルサイズを CSS 変数スタイル（--cal-cell-w / --cal-cell-h）へ変換する */
export function buildSizeStyle(size: CalendarSize): CSSProperties {
  return buildSizeStyleBase(size) as CSSProperties;
}
