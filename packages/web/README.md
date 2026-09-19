# @typescript-calendar-lib/web

Shared presentation data for web calendar components: CSS-based themes, color schemes (CSS custom properties), cell sizes, and accessible cell labels. Used by the `react` and `svelte` packages.

> **Tip:** You normally don't need `web` directly — the `react` and `svelte` packages re-export what you need. Reach for `web` when building your own web component on top of the shared styles.

## Installation

```sh
pnpm add @typescript-calendar-lib/web
# or
npm install @typescript-calendar-lib/web
# or
bun add @typescript-calendar-lib/web
```

## Themes

Themes are applied as a CSS class on the calendar root element.

### `ThemeName`

```ts
type ThemeName = "default" | "modern" | "minimal" | "rounded" | "retro";
```

- `"default"` → `calendar-theme-default`
- `"modern"` → `calendar-theme-modern`
- `"minimal"` → `calendar-theme-minimal`
- `"rounded"` → `calendar-theme-rounded`
- `"retro"` → `calendar-theme-retro`

### `WebTheme`

```ts
interface WebTheme {
  className: string;
}
```

Pass a custom theme as an object:

```ts
const myTheme: WebTheme = { className: "my-calendar" };
```

### `THEMES` / `resolveTheme(theme?)`

Predefined theme map and resolver (defaults to `"default"`).

## Color Schemes

Color schemes are maps of `--cal-*` CSS custom properties applied to the root element.

### `ColorSchemeName`

```ts
type ColorSchemeName =
  | "default" | "ocean" | "forest" | "sunset"
  | "mono" | "midnight" | "blossom";
```

### `WebColorScheme`

```ts
type WebColorScheme = Record<`--cal-${string}`, string>;
```

Available variables:

| Variable | Purpose |
| :--- | :--- |
| `--cal-bg` | Background |
| `--cal-fg` | Foreground |
| `--cal-accent` | Accent (highlight) |
| `--cal-weekend-fg` | Weekend foreground |
| `--cal-border` | Borders |
| `--cal-header-bg` | Header background |
| `--cal-highlight-bg` | Highlight background |
| `--cal-highlight-fg` | Highlight foreground |
| `--cal-range-bg` | Range background |
| `--cal-range-preview-bg` | Range preview background (falls back to `--cal-range-bg`) |
| `--cal-today-bg` | Today background |
| `--cal-today-fg` | Today foreground |
| `--cal-selected-bg` | Selected background |
| `--cal-selected-fg` | Selected foreground |
| `--cal-disabled-fg` | Disabled date foreground |

Pass a custom scheme directly:

```ts
const myScheme: WebColorScheme = {
  "--cal-bg": "#ffffff",
  "--cal-fg": "#1e293b",
  "--cal-accent": "#6366f1",
  // ...all keys required
};
```

### `COLOR_SCHEMES` / `resolveColorScheme(scheme?)`

Predefined schemes and resolver (defaults to `"default"`).

## Cell Sizing

### `CalendarSize`

```ts
type CalendarSizeName = "sm" | "md" | "lg";
type CalendarCustomSize = {
  width?: number | string;
  height?: number | string;
};
type CalendarSize = CalendarSizeName | CalendarCustomSize;
```

### `buildSizeStyle(size): CssVarMap`

Converts a size into `--cal-cell-w` / `--cal-cell-h` CSS custom properties. Numbers become pixels, strings pass through as CSS lengths. Named sizes return `{}` (their dimensions live in the stylesheet):

```ts
buildSizeStyle({ width: 48, height: 40 });
// { "--cal-cell-w": "48px", "--cal-cell-h": "40px" }
buildSizeStyle("md"); // {}
```

### `isSizeName(size): boolean`

Type guard — `true` for known names (`"sm" | "md" | "lg"`), `false` otherwise.

## Cell Labels

### `formatCellLabel(locale, year, month, day): string`

Builds an accessible label for a day cell (e.g. `aria-label`):

```ts
formatCellLabel("en", 2026, 9, 15); // "September 15, 2026"
formatCellLabel("ja", 2026, 9, 15); // "9月 15, 2026"
```

## Stylesheet

The shared stylesheet must be imported once in your application. The `react` / `svelte` packages bundle a copy with their own `calendar.css` export:

```ts
import "@typescript-calendar-lib/web/calendar.css";
```

### Responsive media queries

When the calendar root also carries a `calendar-responsive` class, the stylesheet applies two media-query steps that shrink cell sizes, fonts, and padding so the 7-column grid fits phone screens: below `480px` the cells drop to `sm`-scale and the grid fills the viewport width, and below `360px` they shrink one step further. The `react` / `svelte` `Calendar` components expose this as an opt-in `responsive` prop (off by default).

## Exports

```ts
// Types
import type {
  CalendarCustomSize,
  CalendarSize,
  CalendarSizeName,
  ColorSchemeName,
  CssVarMap,
  ThemeName,
  WebColorScheme,
  WebTheme,
} from "@typescript-calendar-lib/web";

// Values
import {
  buildSizeStyle,
  COLOR_SCHEMES,
  formatCellLabel,
  isSizeName,
  resolveColorScheme,
  resolveTheme,
  THEMES,
} from "@typescript-calendar-lib/web";
```

## License

MIT