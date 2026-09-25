import { describe, expect, test } from "vitest";
import { addDays, diffInCalendarDays } from "./date-math.ts";
import { isHoliday } from "./holidays.ts";

const TIMEZONES = [
  "America/New_York",
  "Australia/Sydney",
  "Asia/Tokyo",
  "UTC",
  "Pacific/Honolulu",
] as const;

const withTimezone = <T>(timezone: string, callback: () => T): T => {
  const original = process.env.TZ;
  process.env.TZ = timezone;
  try {
    return callback();
  } finally {
    if (original === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = original;
    }
  }
};

describe("タイムゾーン別の日付演算", () => {
  for (const timezone of TIMEZONES) {
    test.skipIf(process.platform === "win32")(
      `${timezone} で日付演算が暦日ベースで正しい`,
      () => {
        withTimezone(timezone, () => {
          const before = new Date(2026, 2, 7, 23, 0);
          const start = new Date(2026, 2, 8, 23, 0);
          const after = new Date(2026, 2, 9, 23, 0);

          expect(addDays(before, 1)).toEqual(start);
          expect(addDays(start, 1)).toEqual(after);
          expect(diffInCalendarDays(before, start)).toBe(1);
          expect(diffInCalendarDays(start, after)).toBe(1);
        });
      },
    );
  }

  test.skipIf(process.platform === "win32")(
    "America/New_York の 2026-03-08 DST 開始を跨ぐ",
    () => {
      withTimezone("America/New_York", () => {
        const before = new Date(2026, 2, 7, 23, 0);
        const start = new Date(2026, 2, 8, 23, 0);
        const after = new Date(2026, 2, 9, 23, 0);

        expect(addDays(new Date(2026, 2, 7), 1)).toEqual(new Date(2026, 2, 8));
        expect(addDays(before, 1)).toEqual(start);
        expect(addDays(start, 1)).toEqual(after);
        expect(diffInCalendarDays(before, start)).toBe(1);
        expect(diffInCalendarDays(start, after)).toBe(1);
      });
    },
  );

  test.skipIf(process.platform === "win32")(
    "America/New_York の 2026-11-01 DST 終了を跨ぐ",
    () => {
      withTimezone("America/New_York", () => {
        const before = new Date(2026, 9, 31, 23, 0);
        const end = new Date(2026, 10, 1, 23, 0);
        const after = new Date(2026, 10, 2, 23, 0);

        expect(addDays(new Date(2026, 9, 31), 1)).toEqual(
          new Date(2026, 10, 1),
        );
        expect(addDays(before, 1)).toEqual(end);
        expect(addDays(end, 1)).toEqual(after);
        expect(diffInCalendarDays(before, end)).toBe(1);
        expect(diffInCalendarDays(end, after)).toBe(1);
      });
    },
  );

  test.skipIf(process.platform === "win32")(
    "Australia/Sydney の 2026-04-05 DST 終了を跨ぐ",
    () => {
      withTimezone("Australia/Sydney", () => {
        const before = new Date(2026, 3, 4, 23, 0);
        const end = new Date(2026, 3, 5, 23, 0);
        const after = new Date(2026, 3, 6, 23, 0);

        expect(addDays(before, 1)).toEqual(end);
        expect(addDays(end, 1)).toEqual(after);
        expect(diffInCalendarDays(before, end)).toBe(1);
      });
    },
  );

  test.skipIf(process.platform === "win32")(
    "Australia/Sydney の 2026-10-04 DST 開始を跨ぐ",
    () => {
      withTimezone("Australia/Sydney", () => {
        const before = new Date(2026, 9, 3, 23, 0);
        const start = new Date(2026, 9, 4, 23, 0);
        const after = new Date(2026, 9, 5, 23, 0);

        expect(addDays(before, 1)).toEqual(start);
        expect(addDays(start, 1)).toEqual(after);
        expect(diffInCalendarDays(before, start)).toBe(1);
      });
    },
  );
});

describe("タイムゾーン別の祝日判定", () => {
  for (const timezone of TIMEZONES) {
    test.skipIf(process.platform === "win32")(
      `${timezone} で日本の祝日を判定できる`,
      () => {
        withTimezone(timezone, () => {
          expect(isHoliday(new Date(2026, 4, 6), "ja")).toBe(true);
          expect(isHoliday(new Date(2026, 2, 20), "ja")).toBe(true);
        });
      },
    );
  }
});
