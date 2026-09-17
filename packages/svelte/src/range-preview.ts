// ─── 範囲プレビュー ───────────────────────────────────────
// 実装は core の sortRange（2日付のソート済み範囲構築）に集約済み。
// ここでは互換 API 名（buildRangePreview）として再エクスポートする。

export { sortRange as buildRangePreview } from "@typescript-calendar-lib/core";
