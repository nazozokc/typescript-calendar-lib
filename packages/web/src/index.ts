// 共有スタイル（react / svelte の両パッケージが dist へ同梱する）
import "./calendar.css";

export type { CellStateOptions } from "./cell-classes.ts";
export { getBlankClasses, getCellClasses } from "./cell-classes.ts";
export { formatCellLabel, UI_STRINGS, uiString } from "./label.ts";
export type {
  CalendarCustomSize,
  CalendarSize,
  CalendarSizeName,
  CssVarMap,
} from "./size.ts";
export { buildSizeStyle, isSizeName } from "./size.ts";
export type {
  ColorSchemeName,
  MergedColorScheme,
  ThemeName,
  WebColorScheme,
  WebTheme,
} from "./themes.ts";
export {
  COLOR_SCHEMES,
  mergeColorScheme,
  resolveColorScheme,
  resolveTheme,
  THEMES,
} from "./themes.ts";
