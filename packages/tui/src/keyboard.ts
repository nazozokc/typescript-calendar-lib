import type { Direction, MonthDirection } from "./types.ts";

// ─── キーボード入力 ───────────────────────────────────────

/** キーボード操作のアクション（カーソル移動 or 月移動） */
export type CalendarKeyAction = Direction | MonthDirection;

const KEY_ACTIONS: Record<string, CalendarKeyAction> = {
  ArrowRight: "right",
  ArrowLeft: "left",
  ArrowDown: "down",
  ArrowUp: "up",
  PageUp: "prev",
  PageDown: "next",
};

/** キーボードイベントの key からカレンダー操作を返す。該当なしは undefined */
export function keyToAction(key: string): CalendarKeyAction | undefined {
  return KEY_ACTIONS[key];
}
