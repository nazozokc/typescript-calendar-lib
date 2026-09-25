/* @vitest-environment node */
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { Calendar, InteractiveCalendar } from "./index.tsx";

const TODAY = new Date(2026, 8, 15);

describe("server rendering", () => {
  test("Calendar renders without browser globals", () => {
    expect(globalThis.window).toBeUndefined();

    const html = renderToString(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        today: TODAY,
        showWeekNumbers: true,
      }),
    );

    expect(html).toContain('aria-label="September 2026"');
    expect(html).toContain('scope="col"');
    expect(html).toContain('scope="row"');
    expect(html).toContain('aria-current="date"');
  });

  test("InteractiveCalendar renders without browser globals", () => {
    expect(globalThis.window).toBeUndefined();

    const html = renderToString(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
      }),
    );

    expect(html).toContain('aria-label="September 15, 2026"');
    expect(html).toContain('aria-pressed="false"');
  });
});
