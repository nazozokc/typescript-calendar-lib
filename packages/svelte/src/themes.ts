// ─── テーマ ───────────────────────────────────────────────

/** 組み込みテーマ名。カスタムテーマは SvelteTheme オブジェクトを直接渡せる */
export type ThemeName = "default" | "modern" | "minimal" | "rounded" | "retro";

/** Svelte の見た目定義。テーマは主に CSS クラスで切り替える */
export interface SvelteTheme {
  /** root 要素に追加するクラス */
  className: string;
}

export const THEMES: Record<ThemeName, SvelteTheme> = {
  default: { className: "calendar-theme-default" },
  modern: { className: "calendar-theme-modern" },
  minimal: { className: "calendar-theme-minimal" },
  rounded: { className: "calendar-theme-rounded" },
  retro: { className: "calendar-theme-retro" },
};

export function resolveTheme(theme?: ThemeName | SvelteTheme): SvelteTheme {
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
export type SvelteColorScheme = Record<`--cal-${string}`, string>;

/** 各カラースキームで定義する CSS 変数（SCHEME_VALUES の並び順の定義) */
const SCHEME_KEYS = [
  "--cal-bg",
  "--cal-fg",
  "--cal-accent",
  "--cal-weekend-fg",
  "--cal-border",
  "--cal-header-bg",
  "--cal-highlight-bg",
  "--cal-highlight-fg",
  "--cal-range-bg",
  "--cal-today-bg",
  "--cal-today-fg",
  "--cal-selected-bg",
  "--cal-selected-fg",
] as const;

/** カラースキームごとの値を SCHEME_KEYS の並びで定義する */
const SCHEME_VALUES: Record<ColorSchemeName, readonly string[]> = {
  default: [
    "#ffffff",
    "#1e293b",
    "#dc2626",
    "#94a3b8",
    "#e2e8f0",
    "#f8fafc",
    "#dc2626",
    "#ffffff",
    "#fef3c7",
    "#fff7ed",
    "#c2410c",
    "#dc2626",
    "#ffffff",
  ],
  ocean: [
    "#f0f9ff",
    "#0f172a",
    "#0e7490",
    "#7dd3fc",
    "#bae6fd",
    "#e0f2fe",
    "#0e7490",
    "#ffffff",
    "#dff3fe",
    "#cffafe",
    "#155e75",
    "#0e7490",
    "#ffffff",
  ],
  forest: [
    "#f0fdf4",
    "#052e16",
    "#15803d",
    "#86efac",
    "#bbf7d0",
    "#dcfce7",
    "#15803d",
    "#ffffff",
    "#dcfce7",
    "#f0fdf4",
    "#166534",
    "#15803d",
    "#ffffff",
  ],
  sunset: [
    "#fffaf5",
    "#431407",
    "#ea580c",
    "#fdba74",
    "#fed7aa",
    "#ffedd5",
    "#ea580c",
    "#ffffff",
    "#ffedd5",
    "#fff7ed",
    "#9a3412",
    "#ea580c",
    "#ffffff",
  ],
  mono: [
    "#ffffff",
    "#111827",
    "#374151",
    "#d1d5db",
    "#e5e7eb",
    "#f3f4f6",
    "#111827",
    "#ffffff",
    "#f3f4f6",
    "#e5e7eb",
    "#111827",
    "#111827",
    "#ffffff",
  ],
  midnight: [
    "#0f172a",
    "#e2e8f0",
    "#38bdf8",
    "#475569",
    "#1e293b",
    "#1e293b",
    "#38bdf8",
    "#0f172a",
    "#0c4a6e",
    "#0c4a6e",
    "#7dd3fc",
    "#38bdf8",
    "#0f172a",
  ],
  blossom: [
    "#fffaff",
    "#500724",
    "#db2777",
    "#f9a8d4",
    "#fbcfe8",
    "#fdf2f8",
    "#db2777",
    "#ffffff",
    "#fce7f3",
    "#fdf2f8",
    "#be185d",
    "#db2777",
    "#ffffff",
  ],
};

export const COLOR_SCHEMES: Record<ColorSchemeName, SvelteColorScheme> =
  Object.fromEntries(
    Object.entries(SCHEME_VALUES).map(([name, values]) => [
      name,
      Object.fromEntries(SCHEME_KEYS.map((key, i) => [key, values[i]!])),
    ]),
  ) as Record<ColorSchemeName, SvelteColorScheme>;

export function resolveColorScheme(
  scheme?: ColorSchemeName | SvelteColorScheme,
): SvelteColorScheme {
  if (scheme === undefined) return COLOR_SCHEMES.default;
  if (typeof scheme === "string") {
    return COLOR_SCHEMES[scheme] ?? COLOR_SCHEMES.default;
  }
  return scheme;
}
