# Theming & Styling

The web packages (`react`, `svelte`) share one presentation layer from `web`:
the same theme names, color schemes, sizes, CSS variables, and cell classes. The
CLI uses its own text themes and ANSI palettes.

## Themes

A theme controls structure and spacing (the CSS class applied to the root).
Pass a built-in name or your own class name.

```tsx
<Calendar year={2026} month={9} theme="modern" />;
```

```svelte
<Calendar year={2026} month={9} theme="modern" />
```

| Theme       | Root class               | Look                        |
| :---------- | :----------------------- | :-------------------------- |
| `"default"` | `calendar-theme-default` | Neutral, compact            |
| `"modern"`  | `calendar-theme-modern`  | Rounded, softer surfaces    |
| `"minimal"` | `calendar-theme-minimal` | Few borders, quieter chrome |
| `"rounded"` | `calendar-theme-rounded` | Pronounced corner rounding  |
| `"retro"`   | `calendar-theme-retro`   | High-contrast, square edges |

Custom theme:

```tsx
<Calendar year={2026} month={9} theme={{ className: "my-calendar" }} />;
```

The CLI accepts `"default"` and `"modern"` plus a custom `CliTheme` object; see
the [CLI reference](/packages/cli#themes).

## Color schemes

Color schemes set `--cal-*` CSS custom properties on the calendar root.

```tsx
<Calendar year={2026} month={9} colorScheme="ocean" />;
```

```svelte
<Calendar year={2026} month={9} colorScheme="ocean" />
```

Available names: `default`, `ocean`, `forest`, `sunset`, `mono`, `midnight`,
`blossom`.

| Variable                 | Purpose                                                   |
| :----------------------- | :-------------------------------------------------------- |
| `--cal-bg`               | Background                                                |
| `--cal-fg`               | Foreground                                                |
| `--cal-accent`           | Accent (highlight)                                        |
| `--cal-weekend-fg`       | Weekend foreground                                        |
| `--cal-holiday-fg`       | Holiday foreground                                        |
| `--cal-border`           | Borders                                                   |
| `--cal-header-bg`        | Header background                                         |
| `--cal-highlight-bg`     | Highlight background                                      |
| `--cal-highlight-fg`     | Highlight foreground                                      |
| `--cal-range-bg`         | Range background                                          |
| `--cal-range-preview-bg` | Range preview background (falls back to `--cal-range-bg`) |
| `--cal-today-bg`         | Today background                                          |
| `--cal-today-fg`         | Today foreground                                          |
| `--cal-selected-bg`      | Selected cell background (interactive mode)               |
| `--cal-selected-fg`      | Selected cell foreground (interactive mode)               |
| `--cal-disabled-fg`      | Disabled cell foreground                                  |

`calendar.css` also reads `--cal-hover-bg` for the interactive hover state
(falling back to `--cal-range-bg`). It is CSS-only, so set it with `style` or
your own stylesheet.

## Override colors

### With the `style` prop

```tsx
<Calendar
  year={2026}
  month={9}
  style={
    {
      "--cal-accent": "#8b5cf6",
      "--cal-range-bg": "#ede9fe",
    } as React.CSSProperties
  }
/>;
```

```svelte
<Calendar
  year={2026}
  month={9}
  style={{ "--cal-accent": "#8b5cf6", "--cal-range-bg": "#ede9fe" }}
/>
```

### With a custom scheme object

A custom scheme is a full `--cal-*` map. Keep every key so colors stay defined
in every state:

```tsx
import type { ReactColorScheme } from "@typescript-calendar-lib/react";

const brand: ReactColorScheme = {
  "--cal-bg": "#ffffff",
  "--cal-fg": "#1e293b",
  "--cal-accent": "#6366f1",
  "--cal-weekend-fg": "#64748b",
  "--cal-holiday-fg": "#dc2626",
  "--cal-border": "#e2e8f0",
  "--cal-header-bg": "#f8fafc",
  "--cal-highlight-bg": "#eef2ff",
  "--cal-highlight-fg": "#3730a3",
  "--cal-range-bg": "#e0e7ff",
  "--cal-range-preview-bg": "#eef2ff",
  "--cal-today-bg": "#f1f5f9",
  "--cal-today-fg": "#0f172a",
  "--cal-selected-bg": "#6366f1",
  "--cal-selected-fg": "#ffffff",
  "--cal-disabled-fg": "#cbd5e1",
};

<Calendar year={2026} month={9} colorScheme={brand} />;
```

Svelte uses `SvelteColorScheme` with the same keys.

### With your own CSS

Give the root a class through `theme`, then style semantic cell classes:

```css
.my-calendar {
  --cal-bg: #fff;
  --cal-accent: #4f46e5;
  border-radius: 1rem;
}

.my-calendar .is-weekend {
  color: #64748b;
}

.my-calendar .is-today {
  font-weight: 700;
}

.my-calendar .is-in-range {
  background: #eef2ff;
}
```

```tsx
<Calendar year={2026} month={9} theme={{ className: "my-calendar" }} />;
```

## Cell classes

Each day cell gets semantic classes you can target from CSS:

| Class                    | When                                                          |
| :----------------------- | :------------------------------------------------------------ |
| `is-weekend`             | Saturday or Sunday                                            |
| `is-holiday`             | Holiday per `holidayLocale` (default `"ja"`)                  |
| `is-today`               | Matches `today`                                               |
| `is-highlight`           | Matches `highlight`                                           |
| `is-in-range`            | Inside `range`                                                |
| `is-range-start`         | First day of `range` (also set with `is-range-end` for 1 day) |
| `is-range-end`           | Last day of `range`                                           |
| `is-in-range-preview`    | Inside `rangePreview`                                         |
| `is-range-preview-start` | First day of `rangePreview`                                   |
| `is-range-preview-end`   | Last day of `rangePreview`                                    |
| `is-hovered`             | Matches `hoveredDate` (interactive mode)                      |
| `is-selected`            | Matches `selected` / `selectedDate`                           |
| `is-cursor`              | Matches `cursorDate`                                          |
| `is-disabled`            | Date returned `true` from `isDateDisabled` (interactive mode) |
| `is-blank`               | Padding cell outside the month                                |

The `web` package exports helpers (`getCellClasses`, `getCellStateClasses`,
`getSelectionCellClasses`, `joinCellClassLists`) if you build your own renderer.

## Sizing

Preset sizes: `"sm"`, `"md"`, `"lg"`.

```tsx
<Calendar year={2026} month={9} size="lg" />;
```

Custom sizes set `--cal-cell-w` / `--cal-cell-h`; numbers become pixels and
strings pass through as CSS lengths:

```tsx
<Calendar year={2026} month={9} size={{ width: 48, height: 40 }} />;
```

| Size   | Cell dimensions        |
| :----- | :--------------------- |
| `"sm"` | `1.75rem` × `1.5rem`   |
| `"md"` | `2.25rem` × `2rem`     |
| `"lg"` | `3.125rem` × `2.75rem` |

## Responsive

The grid is seven fixed columns, so narrow screens can overflow. Pass
`responsive` to shrink cells, fonts, and padding below `480px` (and again below
`360px`). It is off by default.

```tsx
<Calendar year={2026} month={9} responsive />;
```

```svelte
<Calendar year={2026} month={9} responsive />
```

Both `Calendar` and `InteractiveCalendar` accept the prop. The root gets a
`calendar-responsive` class, so you can also add it yourself or tune the
breakpoints in CSS.

## CLI colors

The CLI is plain text by default. Enable ANSI colors explicitly (or let a TTY
detect them):

```ts
calendar({
  year: 2026,
  month: 9,
  theme: "modern",
  colorScheme: "ocean",
  color: true,
});
```

```sh
typescript-calendar-lib 2026 9 --theme modern --color-scheme ocean --color
```

`--no-color`, `NO_COLOR`, and `FORCE_COLOR` are respected; explicit flags win.
When stdout is not a TTY, colors are disabled automatically, so redirecting to a
file stays clean.

## Next steps

- [web package reference](/packages/web) — theme and scheme exports
- [React reference](/packages/react#themes) — component props and CSS variables
- [Svelte reference](/packages/svelte#themes) — Svelte-specific types
- [Accessibility](/guide/accessibility) — contrast and reduced-motion behavior
