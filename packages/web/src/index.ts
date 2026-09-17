// 共有スタイル（react / svelte の両パッケージが dist へ同梱する）
import "./calendar.css";

export { formatCellLabel } from "./label.ts";
export type {
  CalendarCustomSize,
  CalendarSize,
  CalendarSizeName,
  CssVarMap,
} from "./size.ts";
export { buildSizeStyle, isSizeName } from "./size.ts";
export type {
  ColorSchemeName,
  ThemeName,
  WebColorScheme,
  WebTheme,
} from "./themes.ts";
export {
  COLOR_SCHEMES,
  resolveColorScheme,
  resolveTheme,
  THEMES,
} from "./themes.ts";
