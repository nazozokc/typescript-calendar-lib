// ─── テーマ ───────────────────────────────────────────────

/** 組み込みテーマ名。カスタムテーマは Theme オブジェクトを直接渡せる */
export type ThemeName = "default" | "modern";

/** 枠線の文字セット（modern テーマで使用） */
export interface FrameChars {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  /** 水平線 */
  h: string;
  /** 垂直線 */
  v: string;
  /** ヘッダー/本文の区切り行で使う交差（┬ や ┼） */
  j: string;
  /** 下端区切りで使う交差（┴） */
  footJ: string;
  /** 行区切りの左端（├）。省略時は j を使う */
  leftJ?: string;
  /** 行区切りの右端（┤）。省略時は j を使う */
  rightJ?: string;
}

/**
 * 文字ベースの見た目定義。
 * headless のためレンダリングはしない。消費側 TUI フレームワーク（Ink 等）が
 * この定義を元に自前の描画を行う。
 */
export interface Theme {
  /** セル幅（日付表記の文字幅） */
  cellWidth: number;
  /** セル間の区切り文字（default: " " / modern: "│"） */
  separator: string;
  /** 枠線文字。null なら枠なし */
  frame: FrameChars | null;
}

export const THEMES: Record<ThemeName, Theme> = {
  default: {
    cellWidth: 3,
    separator: " ",
    frame: null,
  },
  modern: {
    cellWidth: 3,
    separator: "│",
    frame: {
      topLeft: "┌",
      topRight: "┐",
      bottomLeft: "└",
      bottomRight: "┘",
      h: "─",
      v: "│",
      j: "┬",
      footJ: "┴",
      leftJ: "├",
      rightJ: "┤",
    },
  },
};

export function resolveTheme(theme?: ThemeName | Theme): Theme {
  if (theme === undefined) return THEMES.default;
  if (typeof theme === "string") {
    return Object.hasOwn(THEMES, theme) ? THEMES[theme] : THEMES.default;
  }
  return theme;
}

// ─── カラースキーム ───────────────────────────────────────

/** 組み込みカラースキーム名。カスタムは ColorScheme を直接渡せる */
export type ColorSchemeName =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "mono";

/** 1要素のスタイル（ANSIコードや装飾フラグ。undefined は既定のまま） */
export interface CellStyle {
  /** 前景色 ANSI コード（0–255） */
  fg?: number;
  /** 背景色 ANSI コード（0–255） */
  bg?: number;
  bold?: boolean;
  dim?: boolean;
  underline?: boolean;
  reverse?: boolean;
}

/** カレンダー要素ごとのスタイル定義 */
export interface ColorScheme {
  title: CellStyle;
  weekday: CellStyle;
  day: CellStyle;
  weekend: CellStyle;
  today: CellStyle;
  /** ハイライト日（reverse 装飾想定） */
  highlight: CellStyle;
  range: CellStyle;
  /** 空セルや枠線 */
  dim: CellStyle;
  frame: CellStyle;
}

/** 単色系スキーム生成（title/weekday/today/frame に主色、day は白、dim は灰色） */
const scheme = (
  color: number,
  weekend: number,
  range: number,
): ColorScheme => ({
  title: { fg: color },
  weekday: { fg: color },
  day: { fg: 37 },
  weekend: { fg: weekend },
  today: { fg: color, bold: true },
  highlight: { reverse: true },
  range: { fg: range },
  dim: { fg: 90 },
  frame: { fg: color },
});

export const COLOR_SCHEMES: Record<ColorSchemeName, ColorScheme> = {
  /** 従来どおり。着色は range(黄) と highlight(反転) のみ */
  default: {
    title: {},
    weekday: {},
    day: {},
    weekend: {},
    today: {},
    highlight: { reverse: true },
    range: { fg: 33 },
    dim: {},
    frame: {},
  },
  ocean: scheme(36, 34, 34),
  forest: scheme(32, 90, 32),
  sunset: scheme(35, 33, 35),
  mono: scheme(37, 90, 90),
};

export function resolveColorScheme(
  scheme?: ColorSchemeName | ColorScheme,
): ColorScheme {
  if (scheme === undefined) return COLOR_SCHEMES.default;
  if (typeof scheme === "string") {
    return Object.hasOwn(COLOR_SCHEMES, scheme)
      ? COLOR_SCHEMES[scheme]
      : COLOR_SCHEMES.default;
  }
  return scheme;
}
