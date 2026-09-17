// ─── セルサイズ ───────────────────────────────────────────

/** 組み込みサイズ名 */
export type CalendarSizeName = "sm" | "md" | "lg";

/** カスタムセルサイズ。数値は px、文字列は CSS 長さのまま渡す */
export interface CalendarCustomSize {
  width?: number | string;
  height?: number | string;
}

/** セルサイズ指定 */
export type CalendarSize = CalendarSizeName | CalendarCustomSize;

/** CSS カスタムプロパティ（--cal-*）の値マップ */
export type CssVarMap = Record<string, string>;

/** 組み込みサイズ名のみ真を返す（未知の文字列はカスタムサイズとして扱わない） */
export function isSizeName(size: CalendarSize): size is CalendarSizeName {
  return typeof size === "string" && ["sm", "md", "lg"].includes(size);
}

function toCssLength(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

/** セルサイズを CSS 変数スタイル（--cal-cell-w / --cal-cell-h）へ変換する */
export function buildSizeStyle(size: CalendarSize): CssVarMap {
  if (isSizeName(size)) return {};
  const style: Record<string, string> = {};
  if (size.width !== undefined) style["--cal-cell-w"] = toCssLength(size.width);
  if (size.height !== undefined)
    style["--cal-cell-h"] = toCssLength(size.height);
  return style;
}
