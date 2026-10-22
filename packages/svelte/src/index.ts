import Calendar from "./Calendar.svelte";
import InteractiveCalendar from "./InteractiveCalendar.svelte";

export { Calendar, InteractiveCalendar };
export default Calendar;

export type {
  CellStateOptions,
  SelectionCellOptions,
} from "@typescript-calendar-lib/web";
export {
  getBlankClasses,
  getCellClasses,
  getCellStateClasses,
  getSelectionCellClasses,
  joinCellClassLists,
} from "@typescript-calendar-lib/web";
export { buildRangePreview } from "./range-preview.js";
export type {
  CalendarCustomSize,
  CalendarSize,
  CalendarSizeName,
} from "./size.js";
export { buildSizeStyle, isSizeName } from "./size.js";
export type { CSSProperties } from "./style.js";
export type {
  ColorSchemeName,
  SvelteColorScheme,
  SvelteTheme,
  ThemeName,
} from "./themes.js";
export {
  COLOR_SCHEMES,
  resolveColorScheme,
  resolveTheme,
  THEMES,
} from "./themes.js";
export type {
  UseCalendarStateOptions,
  UseCalendarStateOptionsInput,
  UseCalendarStateReturn,
} from "./useCalendarState.svelte.js";
export { useCalendarState } from "./useCalendarState.svelte.js";
