# Accessibility

The React and Svelte calendars follow the WAI-ARIA Authoring Practices calendar
pattern. This page collects the behavior you get out of the box and the points
to check when you customize a calendar.

## Keyboard interaction

`InteractiveCalendar` (React and Svelte) wires keyboard handling for you. In
`interactive` mode the grid uses a roving tabindex: only the cursor cell is
tabbable, and focus follows cursor movement.

| Key                     | Action                                          |
| :---------------------- | :---------------------------------------------- |
| `Tab` / `Shift` + `Tab` | Move focus into and out of the calendar         |
| Arrow keys              | Move the cursor one cell (skips disabled dates) |
| `PageUp`                | Previous month                                  |
| `PageDown`              | Next month                                      |
| `Enter` / `Space`       | Select the focused cell (same as a click)       |

If you build a custom shell around `Calendar`, use the `useCalendarState` hook
and forward arrow keys to `moveCursor`. The hook exposes `cursorDate`, which you
pass back to `Calendar` as `cursorDate` to keep the tab stop on the right cell.

```tsx
const cal = useCalendarState({ initialYear: 2026, initialMonth: 9 });

<Calendar
  year={cal.state.year}
  month={cal.state.month}
  cursorDate={cal.cursorDate}
  interactive
  onKeyDown={(event) => {
    if (event.key === "ArrowRight") cal.moveCursor("right");
  }}
/>;
```

## Screen reader semantics

- The table is labelled by the visible month heading through `aria-labelledby`,
  so the month is announced once, not twice.
- In interactive mode the heading is the live region (`aria-live="polite"` and
  `aria-atomic="true"`); changing months is announced.
- Interactive mode exposes `role="grid"` with `role="gridcell"` cells. The
  non-interactive table keeps native table semantics.
- Today's cell gets `aria-current="date"`. The selected date gets `aria-selected`
  on the grid cell and `aria-pressed` on its button.
- Day buttons use a localized `aria-label`; weekday headers use `scope="col"`
  and week-number cells use `th[scope="row"]`.
- Padding cells carry `is-blank` instead of relying on `td:empty`, so layout
  helpers do not change the accessibility tree.

React also derives heading ids with `useId`, so several calendars of the same
month can coexist without duplicate ids.

## Disabled dates

`isDateDisabled` removes a date from interaction in every layer:

- Disabled cells are not clickable and cannot receive keyboard focus.
- Arrow-key movement skips over disabled dates.
- The cell gets `is-disabled` and `aria-disabled`, plus the `--cal-disabled-fg`
  color.

```tsx
<InteractiveCalendar
  initialYear={2026}
  initialMonth={9}
  isDateDisabled={(date) => date.getDay() === 0}
/>;
```

Make the predicate deterministic and cheap: it runs once per visible date, and
the TUI cursor logic calls it during navigation.

## Color and contrast

- The built-in color schemes keep text at 4.5:1 or better against its
  background; decorative grid borders target 2:1.
- Disabled dates are intentionally low contrast but remain distinguishable from
  selectable dates through the `aria-disabled` state, not color alone.
- Do not rely on hue alone for highlighting, ranges, or selection. Pair custom
  colors with a weight, border, or class-based indicator.
- Verify custom schemes with a contrast checker before shipping; a custom map
  replaces the tested defaults.

## Motion and forced colors

`calendar.css` honors `prefers-reduced-motion` and `forced-colors`. If you add
animations, gate them behind `prefers-reduced-motion: no-preference` and keep
focus indicators visible in forced-colors mode.

## Custom cell content

When you use `renderCell`:

- Keep the day number in the accessible name or provide equivalent context; the
  interactive button still uses the localized date label.
- Do not encode status only with color or an icon. Add text or an accessible
  label.
- Return plain text in Svelte (`renderCell` inserts it as text, which avoids
  XSS). React can return nodes, so escape or sanitize user content yourself.

## Checklist

- [ ] Keyboard: arrows, PageUp/PageDown, Enter/Space, Tab in and out.
- [ ] Focus ring is visible on the cursor cell and on custom buttons.
- [ ] Month changes are announced (keep the heading as the live region).
- [ ] Disabled dates cannot be focused, clicked, or selected.
- [ ] Selected and today states are conveyed beyond color.
- [ ] Custom color schemes pass 4.5:1 for text.
- [ ] Animations respect `prefers-reduced-motion`.
- [ ] Multiple calendars on one page have unique heading ids.

## Related

- [React accessibility notes](/packages/react#accessibility-notes)
- [Svelte accessibility notes](/packages/svelte#accessibility-notes)
- [Theming & Styling](/guide/theming)
