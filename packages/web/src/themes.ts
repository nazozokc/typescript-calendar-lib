// ─── テーマ ───────────────────────────────────────────────

/** 組み込みテーマ名。カスタムテーマは WebTheme オブジェクトを直接渡せる */
export type ThemeName = "default" | "modern" | "minimal" | "rounded" | "retro";

/** Web の見た目定義。テーマは主に CSS クラスで切り替える */
export interface WebTheme {
  /** root 要素に追加するクラス */
  className: string;
}

export const THEMES: Record<ThemeName, WebTheme> = {
  default: { className: "calendar-theme-default" },
  modern: { className: "calendar-theme-modern" },
  minimal: { className: "calendar-theme-minimal" },
  rounded: { className: "calendar-theme-rounded" },
  retro: { className: "calendar-theme-retro" },
};

export function resolveTheme(theme?: ThemeName | WebTheme): WebTheme {
  if (theme === undefined) return THEMES.default;
  if (typeof theme === "string") return THEMES[theme] ?? THEMES.default;
  return theme;
}

// ─── カラースキーム ───────────────────────────────────────

/** 組み込みカラースキーム名。カスタムは CSS 変数マップを直接渡せる */
export type ColorSchemeName =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "mono"
  | "midnight"
  | "blossom";

/** CSS カスタムプロパティ（--cal-*）の値マップ */
export type WebColorScheme = Record<`--cal-${string}`, string>;

/** 各カラースキームで定義する CSS 変数（SCHEME_VALUES の並び順の定義) */
const SCHEME_KEYS = [
  "--cal-bg",
  "--cal-fg",
  "--cal-accent",
  "--cal-weekend-fg",
  "--cal-holiday-fg",
  "--cal-border",
  "--cal-header-bg",
  "--cal-highlight-bg",
  "--cal-highlight-fg",
  "--cal-range-bg",
  "--cal-range-preview-bg",
  "--cal-today-bg",
  "--cal-today-fg",
  "--cal-selected-bg",
  "--cal-selected-fg",
  "--cal-disabled-fg",
] as const;

/** カラースキームごとの値を SCHEME_KEYS の並びで定義する */
const SCHEME_VALUES: Record<ColorSchemeName, readonly string[]> = {
  default: [
    "#ffffff",
    "#1e293b",
    "#dc2626",
    "#586a84",
    "#dc2626",
    "#a7b6d0",
    "#f8fafc",
    "#dc2626",
    "#ffffff",
    "#fef3c7",
    "#fef9c3",
    "#fff7ed",
    "#c2410c",
    "#dc2626",
    "#ffffff",
    "#5b799d",
  ],
  ocean: [
    "#f0f9ff",
    "#0f172a",
    "#0e7490",
    "#046a9b",
    "#b91c1c",
    "#a3afcd",
    "#e0f2fe",
    "#0e7490",
    "#ffffff",
    "#dff3fe",
    "#f0f9ff",
    "#cffafe",
    "#155e75",
    "#0e7490",
    "#ffffff",
    "#0479b1",
  ],
  forest: [
    "#f0fdf4",
    "#052e16",
    "#15803d",
    "#107534",
    "#b91c1c",
    "#85bd9d",
    "#dcfce7",
    "#15803d",
    "#ffffff",
    "#dcfce7",
    "#f0fdf4",
    "#f0fdf4",
    "#166534",
    "#15803d",
    "#ffffff",
    "#12853c",
  ],
  sunset: [
    "#fffaf5",
    "#431407",
    "#c94b0a",
    "#9e5202",
    "#b91c1c",
    "#ccaba1",
    "#ffedd5",
    "#c94b0a",
    "#ffffff",
    "#ffedd5",
    "#fff7ed",
    "#fff7ed",
    "#9a3412",
    "#c94b0a",
    "#ffffff",
    "#b35d03",
  ],
  mono: [
    "#ffffff",
    "#111827",
    "#374151",
    "#5f6979",
    "#b91c1c",
    "#a9b5d1",
    "#f3f4f6",
    "#111827",
    "#ffffff",
    "#f3f4f6",
    "#f9fafb",
    "#e5e7eb",
    "#111827",
    "#111827",
    "#ffffff",
    "#6c7789",
  ],
  midnight: [
    "#0f172a",
    "#e2e8f0",
    "#38bdf8",
    "#8091a9",
    "#e34949",
    "#384c68",
    "#1e293b",
    "#38bdf8",
    "#0f172a",
    "#0c4a6e",
    "#164e63",
    "#0c4a6e",
    "#7dd3fc",
    "#38bdf8",
    "#0f172a",
    "#6e829d",
  ],
  blossom: [
    "#fffaff",
    "#500724",
    "#db2475",
    "#c50e71",
    "#b91c1c",
    "#d0a7b8",
    "#fdf2f8",
    "#db2475",
    "#ffffff",
    "#fce7f3",
    "#fdf2f8",
    "#fdf2f8",
    "#be185d",
    "#db2475",
    "#ffffff",
    "#df0f80",
  ],
};

export const COLOR_SCHEMES: Record<ColorSchemeName, WebColorScheme> =
  Object.fromEntries(
    Object.entries(SCHEME_VALUES).map(([name, values]) => [
      name,
      Object.fromEntries(SCHEME_KEYS.map((key, i) => [key, values[i]!])),
    ]),
  ) as Record<ColorSchemeName, WebColorScheme>;

/** 組み込み配色に \"default\" だけを重ねたマージ済み配色（mergeColorScheme の戻り値） */
export type MergedColorScheme = Record<(typeof SCHEME_KEYS)[number], string>;

/**
 * 組み込み配色にユーザー指定のトークンを重ねる。
 *
 * `resolveColorScheme` へ渡す前に使うと、部分的な上書き（例:
 * `{ \"--cal-accent\": \"red\" }`）が未指定のトークンを既定値から継承する。
 */
export function mergeColorScheme(
  scheme?: ColorSchemeName | WebColorScheme,
): MergedColorScheme {
  const base = COLOR_SCHEMES.default;
  const overlay = resolveColorScheme(scheme);
  return Object.fromEntries(
    SCHEME_KEYS.map((key) => [key, overlay[key] ?? base[key]!]),
  ) as MergedColorScheme;
}

export function resolveColorScheme(
  scheme?: ColorSchemeName | WebColorScheme,
): WebColorScheme {
  if (scheme === undefined) return COLOR_SCHEMES.default;
  if (typeof scheme === "string") {
    return COLOR_SCHEMES[scheme] ?? COLOR_SCHEMES.default;
  }
  return scheme;
}
