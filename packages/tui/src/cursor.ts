import { findDateCell, findFirstDayCell, findTodayCell } from "./search.ts";
import type { CalendarState, Direction, MonthData } from "./types.ts";

// ─── カーソル位置 ────────────────────────────────────────

/** カーソルを行数・列数の範囲にクランプする。NaN/非整数は null を返す */
export function clampCursor(
  cursor: { row: number; col: number } | null,
  monthData: MonthData,
): { row: number; col: number } | null {
  if (cursor === null) return null;
  if (!Number.isFinite(cursor.row) || !Number.isFinite(cursor.col)) return null;

  const row = Math.floor(cursor.row);
  const col = Math.floor(cursor.col);

  const rows = monthData.visibleRows;
  const cols = monthData.cells[0]?.length ?? 0;
  if (rows <= 0 || cols <= 0) return null;

  const maxRow = rows - 1;
  const maxCol = cols - 1;
  return {
    row: Math.max(0, Math.min(row, maxRow)),
    col: Math.max(0, Math.min(col, maxCol)),
  };
}

/** カーソルを移動する。カーソル未設定時は今日（なければ先頭の日付）にスナップする。
 * 選択不可セルは同じ方向にスキップされ、全セルが選択不可なら状態を変えない。 */
export function moveCursor<T>(
  state: CalendarState<T>,
  direction: Direction,
): CalendarState<T> {
  const monthData = state.monthData;
  const rows = monthData.visibleRows;
  const cols = monthData.cells[0]?.length ?? 0;

  if (rows <= 0 || cols <= 0) return state;

  let cursor = state.cursor;
  if (cursor === null) {
    cursor = findTodayCell(monthData) ?? findFirstDayCell(monthData);
    if (cursor === null) return state;
  }

  let { row, col } = cursor;

  // 選択不可セルをスキップする。最大 rows*cols 回試行し、有効セルが無ければ現状維持
  for (let i = 0; i < rows * cols; i++) {
    switch (direction) {
      case "left":
        col = (col - 1 + cols) % cols;
        break;
      case "right":
        col = (col + 1) % cols;
        break;
      case "up":
        row = (row - 1 + rows) % rows;
        break;
      case "down":
        row = (row + 1) % rows;
        break;
    }
    const cell = monthData.cells[row]?.[col];
    if (cell !== undefined && cell.day !== null && !cell.isDisabled) {
      return { ...state, cursor: { row, col } };
    }
  }

  return state;
}

// ─── 日付取得 ────────────────────────────────────────────

/** 指定日付のセルへカーソルを移動する。当月に無い・選択不可の日付なら状態を変えず返す */
export function setCursorToDate<T>(
  state: CalendarState<T>,
  date: Date,
): CalendarState<T> {
  const pos = findDateCell(state.monthData, date);
  if (pos === null) return state;
  const cell = state.monthData.cells[pos.row]![pos.col]!;
  if (cell.isDisabled) return state;
  return { ...state, cursor: pos };
}

/** カーソル位置の日付を取得する。空欄セルなら null */
export function getCursorDate<T>(state: CalendarState<T>): Date | null {
  if (state.cursor === null) return null;
  const cell = state.monthData.cells[state.cursor.row]?.[state.cursor.col];
  return cell?.date ?? null;
}
