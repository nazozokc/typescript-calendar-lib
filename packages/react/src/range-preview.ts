// ─── 範囲プレビュー ───────────────────────────────────────

/**
 * 選択済み日付とホバー日付からソート済みの範囲プレビューを組み立てる。
 * どちらかが null なら undefined（プレビューなし）。
 * 日付は常に from <= to に揃えられる（逆順ホバーも正しい範囲になる）。
 */
export function buildRangePreview(
  selected: Date | null,
  hovered: Date | null,
): { from: Date; to: Date } | undefined {
  if (selected === null || hovered === null) return undefined;
  return selected.getTime() <= hovered.getTime()
    ? { from: selected, to: hovered }
    : { from: hovered, to: selected };
}
