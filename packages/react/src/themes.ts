// ─── テーマ ───────────────────────────────────────────────
// テーマ定義・カラースキームは web パッケージに集約済み。
// React 固有の型名（ReactTheme / ReactColorScheme）だけをこの層で別名定義する。

import type { WebColorScheme, WebTheme } from "@typescript-calendar-lib/web";
import { useSyncExternalStore } from "react";

export type {
  ColorSchemeName,
  MergedColorScheme,
  ThemeName,
} from "@typescript-calendar-lib/web";
export {
  COLOR_SCHEMES,
  mergeColorScheme,
  resolveAutoColorScheme,
  resolveColorScheme,
  resolveTheme,
  THEMES,
} from "@typescript-calendar-lib/web";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeToDark(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getDarkSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(DARK_QUERY).matches;
}

/** OS がダークモードを要求しているかを購読する（SSR では false） */
export function usePrefersDark(): boolean {
  return useSyncExternalStore(subscribeToDark, getDarkSnapshot, () => false);
}

/** React の見た目定義（web の WebTheme と同一構造） */
export type ReactTheme = WebTheme;

/** CSS カスタムプロパティ（--cal-*）の値マップ */
export type ReactColorScheme = WebColorScheme;
