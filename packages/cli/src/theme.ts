// ─── テーマ ───────────────────────────────────────────────
// 文字ベースのテーマ（ThemeName / FrameChars / Theme / THEMES / resolveTheme）は
// tui の headless 定義をそのまま使用する（cli は唯一の消費者であり、複製しない）。

export type { FrameChars, ThemeName } from "@typescript-calendar-lib/tui";

import type { Theme } from "@typescript-calendar-lib/tui";

/** 文字ベースの見た目定義。tui の Theme と同一 */
export type CliTheme = Theme;

export { resolveTheme, THEMES } from "@typescript-calendar-lib/tui";

// ─── カラースキーム ───────────────────────────────────────

/** 組み込みカラースキーム名。カスタムは CliPalette を直接渡せる */
export type ColorSchemeName =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "mono";

/**
 * ANSIカラーパレット。
 * 各フィールドは前景色（またはハイライト時の背景）のANSIコード。
 * undefined はその要素を着色しない。
 */
export interface CliPalette {
  title?: number;
  weekday?: number;
  day?: number;
  weekend?: number;
  holiday?: number;
  today?: number;
  /** highlightStyle: "reverse" のときに使うコード（default は 7 = 反転） */
  highlight?: number;
  range?: number;
  frame?: number;
  dim?: number;
}

export const COLOR_SCHEMES: Record<ColorSchemeName, CliPalette> = {
  /** 従来どおり。着色は range(黄) と highlight(反転) のみ */
  default: {
    range: 33,
    holiday: 31,
    highlight: 7,
  },
  ocean: {
    title: 36,
    weekday: 36,
    day: 37,
    weekend: 34,
    holiday: 31,
    today: 36,
    highlight: 7,
    range: 34,
    frame: 36,
    dim: 90,
  },
  forest: {
    title: 32,
    weekday: 32,
    day: 37,
    weekend: 90,
    holiday: 31,
    today: 32,
    highlight: 7,
    range: 32,
    frame: 32,
    dim: 90,
  },
  sunset: {
    title: 35,
    weekday: 35,
    day: 37,
    weekend: 33,
    holiday: 31,
    today: 35,
    highlight: 7,
    range: 35,
    frame: 35,
    dim: 90,
  },
  mono: {
    title: 37,
    weekday: 37,
    day: 37,
    weekend: 90,
    holiday: 31,
    today: 37,
    highlight: 7,
    range: 90,
    frame: 90,
    dim: 90,
  },
};

export function resolveColorScheme(
  scheme?: ColorSchemeName | CliPalette,
): CliPalette {
  return typeof scheme === "string"
    ? (COLOR_SCHEMES[scheme] ?? COLOR_SCHEMES.default)
    : (scheme ?? COLOR_SCHEMES.default);
}
