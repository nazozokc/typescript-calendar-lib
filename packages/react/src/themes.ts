// ─── テーマ ───────────────────────────────────────────────
// テーマ定義・カラースキームは web パッケージに集約済み。
// React 固有の型名（ReactTheme / ReactColorScheme）だけをこの層で別名定義する。

import type { WebColorScheme, WebTheme } from "@typescript-calendar-lib/web";

export type {
  ColorSchemeName,
  ThemeName,
} from "@typescript-calendar-lib/web";
export {
  COLOR_SCHEMES,
  resolveColorScheme,
  resolveTheme,
  THEMES,
} from "@typescript-calendar-lib/web";

/** React の見た目定義（web の WebTheme と同一構造） */
export type ReactTheme = WebTheme;

/** CSS カスタムプロパティ（--cal-*）の値マップ */
export type ReactColorScheme = WebColorScheme;
