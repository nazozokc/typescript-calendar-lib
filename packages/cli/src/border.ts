import type { FrameChars } from "./theme.ts";

// ─── 枠線 ─────────────────────────────────────────────────

/** 枠内のコンテンツ幅（例: 週番号列幅2 + 7列×3幅+区切り6 = 30） */
export function innerWidth(
  cellWidth: number,
  cols: number,
  weekWidth = 0,
): number {
  const week = weekWidth > 0 ? weekWidth + 1 : 0;
  return cols * cellWidth + (cols - 1) + week;
}

/** セル幅の水平線を cols+（週番号列）個つなげた区切り線を生成する */
function divider(
  frame: FrameChars,
  cellWidth: number,
  cols: number,
  left: string,
  right: string,
  join: string,
  weekWidth = 0,
): string {
  const cellSegments = Array<string>(cols).fill(frame.h.repeat(cellWidth));
  const segments =
    weekWidth > 0 ? [frame.h.repeat(weekWidth), ...cellSegments] : cellSegments;
  return `${left}${segments.join(join)}${right}`;
}

/** 上枠: ┌────┬────...────┐ */
export function topBorder(
  frame: FrameChars,
  cellWidth: number,
  cols: number,
  weekWidth = 0,
): string {
  return `${frame.topLeft}${frame.h.repeat(innerWidth(cellWidth, cols, weekWidth))}${frame.topRight}`;
}

/** 下枠: └────┴────...────┘ */
export function bottomBorder(
  frame: FrameChars,
  cellWidth: number,
  cols: number,
  weekWidth = 0,
): string {
  return divider(
    frame,
    cellWidth,
    cols,
    frame.bottomLeft,
    frame.bottomRight,
    frame.footJ,
    weekWidth,
  );
}

/** 区切り行: ├────┬────...┬────┤ */
export function separatorRow(
  frame: FrameChars,
  cellWidth: number,
  cols: number,
  weekWidth = 0,
): string {
  return divider(frame, cellWidth, cols, "├", "┤", frame.j, weekWidth);
}
