// ─── スワイプ方向の判定 ────────────────────────────────────
// 水平方向の移動が十分大きく、縦スクロールより支配的なときだけ月移動とみなす。

export interface SwipePoint {
  x: number;
  y: number;
}

/**
 * スワイプの方向を返す。
 *
 * - 左へスワイプ → "next"（翌月）
 * - 右へスワイプ → "prev"（前月）
 * - 閾値未満、または縦移動が支配的 → null（タップ or スクロール）
 */
export function getSwipeDirection(
  start: SwipePoint,
  end: SwipePoint,
  threshold = 50,
): "prev" | "next" | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) < threshold) return null;
  if (Math.abs(dx) <= Math.abs(dy) * 1.5) return null;
  return dx < 0 ? "next" : "prev";
}
