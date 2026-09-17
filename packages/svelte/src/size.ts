// ─── セルサイズ ───────────────────────────────────────────
// サイズ判定・CSS 変数変換は web パッケージに集約済み。ここでは再エクスポートのみ。

export type {
  CalendarCustomSize,
  CalendarSize,
  CalendarSizeName,
} from "@typescript-calendar-lib/web";
export { buildSizeStyle, isSizeName } from "@typescript-calendar-lib/web";
