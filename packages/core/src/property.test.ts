import fc from "fast-check";
import { describe, expect, test } from "vitest";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  clampDate,
  diffInCalendarDays,
  isWeekend,
} from "./date-math.ts";
import {
  addBusinessDays,
  diffInBusinessDays,
  getHolidayName,
  HOLIDAY_MAX_YEAR,
  HOLIDAY_MIN_YEAR,
  isBusinessDay,
  isHoliday,
} from "./holidays.ts";
import { createDate, MAX_YEAR, MIN_YEAR } from "./validation.ts";

const DAY_MS = 86_400_000;
const FC_OPTIONS = { seed: 42, numRuns: 500 } as const;

const daysInMonth = (year: number, month: number): number =>
  createDate(year, month, 0).getDate();

const utcDayNumber = (date: Date): number => {
  const utc = new Date(0);
  utc.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.trunc(utc.getTime() / DAY_MS);
};

const validDateArbitrary = fc
  .record({
    year: fc.integer({ min: MIN_YEAR, max: MAX_YEAR }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 31 }),
  })
  .filter(({ year, month, day }) => day <= daysInMonth(year, month))
  .map(({ year, month, day }) => createDate(year, month - 1, day));

const dateWithDayAmount = validDateArbitrary.chain((date) => {
  const dateNumber = utcDayNumber(date);
  const minAmount = utcDayNumber(createDate(MIN_YEAR, 0, 1)) - dateNumber;
  const maxAmount = utcDayNumber(createDate(MAX_YEAR, 11, 31)) - dateNumber;
  return fc.record({
    date: fc.constant(date),
    amount: fc.integer({ min: minAmount, max: maxAmount }),
  });
});

const dateWithWeekAmount = validDateArbitrary.chain((date) => {
  const dateNumber = utcDayNumber(date);
  const minAmount = Math.ceil(
    (utcDayNumber(createDate(MIN_YEAR, 0, 1)) - dateNumber) / 7,
  );
  const maxAmount = Math.floor(
    (utcDayNumber(createDate(MAX_YEAR, 11, 31)) - dateNumber) / 7,
  );
  return fc.record({
    date: fc.constant(date),
    amount: fc.integer({ min: minAmount, max: maxAmount }),
  });
});

const dateWithMonthAmount = validDateArbitrary.chain((date) => {
  const monthNumber = date.getFullYear() * 12 + date.getMonth();
  return fc.record({
    date: fc.constant(date),
    amount: fc.integer({
      min: MIN_YEAR * 12 - monthNumber,
      max: MAX_YEAR * 12 + 11 - monthNumber,
    }),
  });
});

const dateWithYearAmount = validDateArbitrary.chain((date) =>
  fc.record({
    date: fc.constant(date),
    amount: fc.integer({
      min: MIN_YEAR - date.getFullYear(),
      max: MAX_YEAR - date.getFullYear(),
    }),
  }),
);

const dateWithMonthRoundTrip = dateWithMonthAmount.filter(
  ({ date }) => date.getDate() <= 28,
);
const dateWithYearRoundTrip = dateWithYearAmount.filter(
  ({ date }) => date.getDate() <= 28,
);

const sameCalendarDate = (a: Date, b: Date): boolean =>
  createDate(a.getFullYear(), a.getMonth(), a.getDate()).getTime() ===
  createDate(b.getFullYear(), b.getMonth(), b.getDate()).getTime();

const businessDateArbitrary = validDateArbitrary.filter(
  (date) =>
    date.getFullYear() >= HOLIDAY_MIN_YEAR &&
    date.getFullYear() <= HOLIDAY_MAX_YEAR,
);

const businessDateAndAmount = fc.tuple(
  businessDateArbitrary,
  fc.integer({ min: -50, max: 50 }),
);

const lowOutOfRangeDateArbitrary = validDateArbitrary.filter(
  (date) => date.getFullYear() < HOLIDAY_MIN_YEAR,
);
const highOutOfRangeDateArbitrary = validDateArbitrary.filter(
  (date) => date.getFullYear() > HOLIDAY_MAX_YEAR,
);

const nonJapaneseLocales = ["en", "es", "de", "fr", "ko", "zh"] as const;

describe("日付演算のプロパティ", () => {
  test("addDays は加算後に逆算すると日付単位で元に戻る", () => {
    fc.assert(
      fc.property(dateWithDayAmount, ({ date, amount }) => {
        const result = addDays(addDays(date, amount), -amount);
        expect(sameCalendarDate(result, date)).toBe(true);
      }),
      FC_OPTIONS,
    );
  });

  test("addWeeks は 0 で同一日付になり、加算と減算で元に戻る", () => {
    fc.assert(
      fc.property(dateWithWeekAmount, ({ date, amount }) => {
        expect(addWeeks(date, 0)).toEqual(date);
        const result = addWeeks(addWeeks(date, amount), -amount);
        expect(sameCalendarDate(result, date)).toBe(true);
      }),
      FC_OPTIONS,
    );
  });

  test("addMonths は 0 で同一日付になる", () => {
    fc.assert(
      fc.property(dateWithMonthAmount, ({ date }) => {
        expect(addMonths(date, 0)).toEqual(date);
      }),
      FC_OPTIONS,
    );
  });

  test("addMonths は丸めが起きない日付で加算と減算で元に戻る", () => {
    fc.assert(
      fc.property(dateWithMonthRoundTrip, ({ date, amount }) => {
        const result = addMonths(addMonths(date, amount), -amount);
        expect(sameCalendarDate(result, date)).toBe(true);
      }),
      FC_OPTIONS,
    );
  });

  test("addYears は 0 で同一日付になる", () => {
    fc.assert(
      fc.property(dateWithYearAmount, ({ date }) => {
        expect(addYears(date, 0)).toEqual(date);
      }),
      FC_OPTIONS,
    );
  });

  test("addYears は丸めが起きない日付で加算と減算で元に戻る", () => {
    fc.assert(
      fc.property(dateWithYearRoundTrip, ({ date, amount }) => {
        const result = addYears(addYears(date, amount), -amount);
        expect(sameCalendarDate(result, date)).toBe(true);
      }),
      FC_OPTIONS,
    );
  });

  test("clampDate の結果は min と max の間にある", () => {
    fc.assert(
      fc.property(
        validDateArbitrary,
        validDateArbitrary,
        validDateArbitrary,
        (date, first, second) => {
          const min = first.getTime() <= second.getTime() ? first : second;
          const max = first.getTime() <= second.getTime() ? second : first;
          const result = clampDate(date, min, max);
          expect(result.getTime()).toBeGreaterThanOrEqual(min.getTime());
          expect(result.getTime()).toBeLessThanOrEqual(max.getTime());
        },
      ),
      FC_OPTIONS,
    );
  });

  test("diffInCalendarDays は addDays の日数と一致する", () => {
    fc.assert(
      fc.property(dateWithDayAmount, ({ date, amount }) => {
        expect(diffInCalendarDays(date, addDays(date, amount))).toBe(amount);
      }),
      FC_OPTIONS,
    );
  });
});

describe("祝日・営業日のプロパティ", () => {
  test("営業日の加算と差分は逆関係になる", () => {
    fc.assert(
      fc.property(businessDateAndAmount, ([date, amount]) => {
        const result = addBusinessDays(date, amount, "ja");
        expect(diffInBusinessDays(date, result, "ja")).toBe(amount);
        expect(sameCalendarDate(addBusinessDays(date, 0, "ja"), date)).toBe(
          true,
        );
      }),
      FC_OPTIONS,
    );
  });

  test("営業日と週末・祝日は排他的である", () => {
    fc.assert(
      fc.property(businessDateArbitrary, (date) => {
        expect(isBusinessDay(date, "ja")).toBe(
          !isWeekend(date) && !isHoliday(date, "ja"),
        );
      }),
      FC_OPTIONS,
    );
  });

  test("非 ja ロケールでは祝日にならない", () => {
    fc.assert(
      fc.property(
        businessDateArbitrary,
        fc.constantFrom(...nonJapaneseLocales),
        (date, locale) => {
          const japaneseHolidayName = getHolidayName(date, "ja");
          expect(isHoliday(date, "ja")).toBe(japaneseHolidayName !== undefined);
          expect(isHoliday(date, locale)).toBe(false);
          expect(getHolidayName(date, locale)).toBeUndefined();
        },
      ),
      FC_OPTIONS,
    );
  });

  test("1949 より前の年は祝日 API の対象外である", () => {
    fc.assert(
      fc.property(lowOutOfRangeDateArbitrary, (date) => {
        expect(isHoliday(date, "ja")).toBe(false);
        expect(getHolidayName(date, "ja")).toBeUndefined();
      }),
      FC_OPTIONS,
    );
  });

  test("2100 より後の年は祝日 API の対象外である", () => {
    fc.assert(
      fc.property(highOutOfRangeDateArbitrary, (date) => {
        expect(isHoliday(date, "ja")).toBe(false);
        expect(getHolidayName(date, "ja")).toBeUndefined();
      }),
      FC_OPTIONS,
    );
  });
});
