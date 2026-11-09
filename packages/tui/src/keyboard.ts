import type { Direction, MonthDirection } from "./types.ts";

// ─── キーボード入力 ───────────────────────────────────────

/**
 * キーボード操作のアクション。
 * - カーソル移動（矢印キー）
 * - 月移動（PageUp/PageDown）
 * - 年移動（Ctrl/Shift + PageUp/PageDown）
 * - 月の先頭/末尾へ（Home/End）
 * - 選択解除（Escape）
 */
export type CalendarKeyAction =
  | Direction
  | MonthDirection
  | "prevYear"
  | "nextYear"
  | "firstDay"
  | "lastDay"
  | "clear";

/** キーイベントの修飾キー。年移動の判定に使う */
export interface KeyModifiers {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

const KEY_ACTIONS: Record<string, CalendarKeyAction> = {
  ArrowRight: "right",
  ArrowLeft: "left",
  ArrowDown: "down",
  ArrowUp: "up",
  PageUp: "prev",
  PageDown: "next",
  Home: "firstDay",
  End: "lastDay",
  Escape: "clear",
};

/**
 * キーボードイベントの key からカレンダー操作を返す。該当なしは undefined。
 *
 * 修飾キー（Ctrl/Meta/Alt/Shift）付きの PageUp/PageDown は年移動になる。
 * 修飾キーを渡さない場合は従来どおり月移動のみを返す（後方互換）。
 */
export function keyToAction(
  key: string,
  modifiers: KeyModifiers = {},
): CalendarKeyAction | undefined {
  const withModifier =
    modifiers.ctrlKey === true ||
    modifiers.metaKey === true ||
    modifiers.altKey === true ||
    modifiers.shiftKey === true;
  if (withModifier) {
    if (key === "PageUp") return "prevYear";
    if (key === "PageDown") return "nextYear";
  }
  return KEY_ACTIONS[key];
}
