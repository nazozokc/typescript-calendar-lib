// 共有スタイル（react / svelte の両パッケージが dist へ同梱する）
import "./calendar.css";

export type {
  CellStateOptions,
  SelectionCellOptions,
} from "./cell-classes.ts";
export {
  getBlankClasses,
  getCellClasses,
  getCellStateClasses,
  getSelectionCellClasses,
  joinCellClassLists,
} from "./cell-classes.ts";
export type { FocusDateOptions } from "./focus.ts";
export { getFocusDate } from "./focus.ts";
export { formatCellLabel, UI_STRINGS, uiString } from "./label.ts";
export type {
  CalendarCustomSize,
  CalendarSize,
  CalendarSizeName,
  CssVarMap,
} from "./size.ts";
export { buildSizeStyle, isSizeName } from "./size.ts";
export type { SwipePoint } from "./swipe.ts";
export { getSwipeDirection } from "./swipe.ts";
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
  resolveAutoColorScheme,
  resolveColorScheme,
  resolveTheme,
  THEMES,
} from "./themes.ts";
