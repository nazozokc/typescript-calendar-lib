/* @vitest-environment node */
import { render } from "svelte/server";
import { describe, expect, test } from "vitest";
import Calendar from "../src/Calendar.svelte";
import InteractiveCalendar from "../src/InteractiveCalendar.svelte";

const TODAY = new Date(2026, 8, 15);

describe("server rendering", () => {
  test("Calendar renders without browser globals", () => {
    expect(globalThis.window).toBeUndefined();

    const { body } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        today: TODAY,
        showWeekNumbers: true,
      },
    });

    // SSR でも h2 の id と table の aria-labelledby が対応している
    const headingId = body.match(/<h2 id="([^"]+)">/)?.[1];
    expect(headingId).toBeTruthy();
    expect(body).toContain(`aria-labelledby="${headingId}"`);
    expect(body).toContain("September 2026");
    expect(body).toContain('scope="col"');
    expect(body).toContain('scope="row"');
    expect(body).toContain('aria-current="date"');
  });

  test("InteractiveCalendar renders without browser globals", () => {
    expect(globalThis.window).toBeUndefined();

    const { body } = render(InteractiveCalendar, {
      props: {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
      },
    });

    expect(body).toContain('aria-label="September 15, 2026"');
    expect(body).toContain('aria-pressed="false"');
  });
});
