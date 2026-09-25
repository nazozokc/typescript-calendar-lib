import { describe, expect, test } from "vitest";
import { HOLIDAY_FIXTURE } from "./holidays.fixture.ts";
import {
  addBusinessDays,
  diffInBusinessDays,
  getHolidayName,
  HOLIDAY_MAX_YEAR,
  HOLIDAY_MIN_YEAR,
  isBusinessDay,
  isHoliday,
} from "./holidays.ts";
import { createDate } from "./validation.ts";

/** YYYY-MM-DD 形式のキーを作る */
const keyOf = (date: Date): string => {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
};

// ─── 公式データ（holiday-jp、1970-2050）との突き合わせ ────

describe("祝日（公式データとの突き合わせ）", () => {
  const fixtureKeys = Object.keys(HOLIDAY_FIXTURE);
  const fixtureYears = new Set(fixtureKeys.map((k) => Number(k.slice(0, 4))));
  const minYear = Math.min(...fixtureYears);
  const maxYear = Math.max(...fixtureYears);

  test("祝日一覧が公式データ（1970-2050）と完全に一致する", () => {
    for (let year = minYear; year <= maxYear; year++) {
      for (let month = 1; month <= 12; month++) {
        for (let day = 1; day <= 31; day++) {
          const date = createDate(year, month - 1, day);
          if (date.getMonth() + 1 !== month) continue;
          const expected = HOLIDAY_FIXTURE[keyOf(date)] !== undefined;
          expect(isHoliday(date), keyOf(date)).toBe(expected);
        }
      }
    }
  });

  test("祝日名称が公式データ（1970-2050）と一致する", () => {
    // 公式データは「こどもの日 振替休日」形式、実装は「振替休日」と略すため、
    // 名称の突き合わせは「振替休日/国民の休日/特例日を除く通常の祝日」のみ行う。
    for (const [key, name] of Object.entries(HOLIDAY_FIXTURE)) {
      if (name.includes("振替休日")) continue;
      if (name === "休日" || name === "休日（祝日扱い）") continue;
      // データセットは短縮名（「大喪の礼」等）、実装は正式名を返すためスキップ
      if (name === "大喪の礼" || name === "結婚の儀") continue;
      if (name === "即位礼正殿の儀") continue;
      if (name === "体育の日（スポーツの日）") {
        expect(getHolidayName(createDate(2019, 9, 14), "ja")).toBe("体育の日");
        continue;
      }
      const [year, month, day] = key.split("-").map(Number);
      expect(
        getHolidayName(createDate(year!, month! - 1, day!), "ja"),
        key,
      ).toBe(name);
    }
  });

  test("祝日の数が公式データ（1970-2050）と一致する", () => {
    for (const year of fixtureYears) {
      let count = 0;
      for (let month = 1; month <= 12; month++) {
        for (let day = 1; day <= 31; day++) {
          const date = createDate(year, month - 1, day);
          if (date.getMonth() + 1 !== month) continue;
          if (isHoliday(date)) count++;
        }
      }
      const expected = fixtureKeys.filter((k) =>
        k.startsWith(String(year)),
      ).length;
      expect(count, String(year)).toBe(expected);
    }
  });
});

// ─── 主要年の祝日（名称込みのスポット検証） ───────────────

describe("祝日（主要年）", () => {
  test("2026年（令和8年）の祝日", () => {
    const holidays: [string, string][] = [
      ["2026-01-01", "元日"],
      ["2026-01-12", "成人の日"],
      ["2026-02-11", "建国記念の日"],
      ["2026-02-23", "天皇誕生日"],
      ["2026-03-20", "春分の日"],
      ["2026-04-29", "昭和の日"],
      ["2026-05-03", "憲法記念日"],
      ["2026-05-04", "みどりの日"],
      ["2026-05-05", "こどもの日"],
      ["2026-05-06", "振替休日"],
      ["2026-07-20", "海の日"],
      ["2026-08-11", "山の日"],
      ["2026-09-21", "敬老の日"],
      ["2026-09-22", "国民の休日"],
      ["2026-09-23", "秋分の日"],
      ["2026-10-12", "スポーツの日"],
      ["2026-11-03", "文化の日"],
      ["2026-11-23", "勤労感謝の日"],
    ];
    for (const [key, name] of holidays) {
      const [y, m, d] = key.split("-").map(Number);
      const date = createDate(y!, m! - 1, d!);
      expect(isHoliday(date), key).toBe(true);
      expect(getHolidayName(date), key).toBe(name);
    }
    // 祝日でない代表日
    expect(isHoliday(createDate(2026, 4, 30))).toBe(false);
    expect(isHoliday(createDate(2026, 7, 19))).toBe(false);
  });

  test("2019年（改元）の特例", () => {
    const holidays: [string, string | null][] = [
      ["2019-04-29", "昭和の日"],
      ["2019-04-30", null], // 休日（法律）だが名称は祝日の名称ではない
      ["2019-05-01", "天皇即位の日"],
      ["2019-05-02", null], // 休日（法律）
      ["2019-05-03", "憲法記念日"],
      ["2019-05-06", "振替休日"],
      ["2019-10-14", "体育の日"],
      ["2019-10-22", "即位礼正殿の儀"],
    ];
    for (const [key, name] of holidays) {
      const [y, m, d] = key.split("-").map(Number);
      const date = createDate(y!, m! - 1, d!);
      expect(isHoliday(date), key).toBe(true);
      if (name !== null) expect(getHolidayName(date), key).toBe(name);
    }
    expect(isHoliday(createDate(2019, 11, 23))).toBe(false); // 12/23 この年は天皇誕生日なし
  });

  test("2020/2021年（東京五輪特例）", () => {
    expect(getHolidayName(createDate(2020, 6, 23))).toBe("海の日");
    expect(getHolidayName(createDate(2020, 6, 24))).toBe("スポーツの日");
    expect(getHolidayName(createDate(2020, 7, 10))).toBe("山の日");
    expect(getHolidayName(createDate(2021, 6, 22))).toBe("海の日");
    expect(getHolidayName(createDate(2021, 6, 23))).toBe("スポーツの日");
    expect(getHolidayName(createDate(2021, 7, 8))).toBe("山の日");
    expect(getHolidayName(createDate(2021, 7, 9))).toBe("振替休日");
    expect(isHoliday(createDate(2020, 6, 20))).toBe(false); // 通常の第3月曜ではない
    expect(isHoliday(createDate(2021, 6, 21))).toBe(false);
  });

  test("天皇誕生日の変遷", () => {
    expect(getHolidayName(createDate(1988, 3, 29))).toBe("天皇誕生日"); // 4/29
    expect(getHolidayName(createDate(1989, 3, 29))).toBe("みどりの日"); // 4/29 はみどりの日
    expect(getHolidayName(createDate(2018, 11, 23))).toBe("天皇誕生日"); // 12/23
    expect(getHolidayName(createDate(2020, 1, 23))).toBe("天皇誕生日"); // 2/23
    expect(isHoliday(createDate(1989, 11, 23))).toBe(true);
    expect(isHoliday(createDate(1988, 11, 23))).toBe(false);
  });

  test("1回限りの祝日（皇室行事）", () => {
    expect(getHolidayName(createDate(1959, 3, 10))).toBe(
      "皇太子明仁親王の結婚の儀",
    );
    expect(getHolidayName(createDate(1989, 1, 24))).toBe("昭和天皇の大喪の礼");
    expect(getHolidayName(createDate(1990, 10, 12))).toBe("即位の礼正殿の儀");
    expect(getHolidayName(createDate(1993, 5, 9))).toBe(
      "皇太子徳仁親王の結婚の儀",
    );
    // 通常の祝日ではない日は出ない
    expect(isHoliday(createDate(1959, 3, 11))).toBe(false);
  });

  test("昭和時代の祝日（振替休日導入前）", () => {
    expect(getHolidayName(createDate(1966, 9, 10))).toBe("体育の日"); // 10/10（1966年から）
    expect(getHolidayName(createDate(1968, 0, 15))).toBe("成人の日"); // 1/15
    expect(getHolidayName(createDate(1966, 8, 15))).toBe("敬老の日"); // 9/15
    expect(getHolidayName(createDate(1950, 2, 21))).toBe("春分の日");
    // 1972年はまだ振替休日がない（制度は1973年から）: 1972-09-23（土）に秋分の日が
    // 日曜で当たるが、翌 9/24 は休日にならない
    expect(isHoliday(createDate(1972, 8, 23))).toBe(true); // 9/23 秋分の日（日曜）
    expect(isHoliday(createDate(1972, 8, 24))).toBe(false); // 9/24 は休日にならない
    // 1973年は振替休日が発生する: 1973-04-29（日）天皇誕生日 → 4/30 が振替休日
    expect(getHolidayName(createDate(1973, 3, 30))).toBe("振替休日");
  });

  test("範囲外の年・ロケール", () => {
    expect(isHoliday(createDate(1948, 10, 3))).toBe(false); // 1948-11-03 文化の日は対象外
    expect(isHoliday(createDate(2101, 0, 1))).toBe(false); // 上限超
    expect(getHolidayName(createDate(2101, 0, 1))).toBeUndefined();
    expect(isHoliday(createDate(2026, 0, 1), "en")).toBe(false);
    expect(getHolidayName(createDate(2026, 0, 1), "en")).toBeUndefined();
    expect(HOLIDAY_MIN_YEAR).toBe(1949);
    expect(HOLIDAY_MAX_YEAR).toBe(2100);
    expect(() => isHoliday(new Date("invalid"))).toThrow(RangeError);
  });
});

// ─── 営業日 ───────────────────────────────────────────────

describe("営業日", () => {
  test("isBusinessDay", () => {
    // 2026-05-06（水）は振替休日 → 営業日ではない
    expect(isBusinessDay(createDate(2026, 4, 6))).toBe(false);
    expect(isBusinessDay(createDate(2026, 4, 8))).toBe(true); // 5/8 金
    expect(isBusinessDay(createDate(2026, 4, 9))).toBe(false); // 5/9 土
    expect(isBusinessDay(createDate(2026, 4, 10))).toBe(false); // 5/10 日
    expect(isBusinessDay(createDate(2026, 8, 25))).toBe(true); // 9/25 金
    // en ロケールは祝日を考慮しない
    expect(isBusinessDay(createDate(2026, 4, 6), "en")).toBe(true);
  });

  test("addBusinessDays（平日のみ）", () => {
    const fri = createDate(2026, 8, 4); // 2026-09-04 金
    expect(keyOf(addBusinessDays(fri, 1))).toBe("2026-09-07"); // 月
    expect(keyOf(addBusinessDays(fri, 2))).toBe("2026-09-08");
    expect(keyOf(addBusinessDays(fri, 0))).toBe("2026-09-04");
    expect(keyOf(addBusinessDays(fri, -1))).toBe("2026-09-03");
    // 土曜日起点: 次の営業日が1日後
    const sat = createDate(2026, 8, 5); // 9/5 土
    expect(keyOf(addBusinessDays(sat, 1))).toBe("2026-09-07");
  });

  test("addBusinessDays（ゴールデンウィーク）", () => {
    // 2026-05-01（金）→ +1 営業日 = 5/7（木）（5/3-5/6 が祝日）
    const may1 = createDate(2026, 4, 1);
    expect(keyOf(addBusinessDays(may1, 1))).toBe("2026-05-07");
    expect(keyOf(addBusinessDays(may1, 2))).toBe("2026-05-08");
    expect(keyOf(addBusinessDays(createDate(2026, 4, 6), -1))).toBe(
      "2026-05-01",
    ); // 5/6 → 5/1
  });

  test("diffInBusinessDays", () => {
    expect(
      diffInBusinessDays(createDate(2026, 7, 31), createDate(2026, 8, 3)),
    ).toBe(3); // 8/31(月)→9/3(木): 9/1,9/2,9/3 の3営業日
    expect(
      diffInBusinessDays(createDate(2026, 8, 3), createDate(2026, 8, 4)),
    ).toBe(1); // 9/7(月)→9/8(火): 1営業日(9/7は平日だが起点は数えない)
    expect(
      diffInBusinessDays(createDate(2026, 8, 3), createDate(2026, 8, 3)),
    ).toBe(0);
    // ゴールデンウィーク 2026: 5/1（金）→ 5/7（木）間の営業日
    // 5/4(月),5/5(火) は祝日、5/6（水）は振替休日 → 営業日は 5/7（木）の1日だけ
    expect(
      diffInBusinessDays(createDate(2026, 4, 1), createDate(2026, 4, 7)),
    ).toBe(1);
    // 逆行
    expect(
      diffInBusinessDays(createDate(2026, 8, 4), createDate(2026, 8, 3)),
    ).toBe(-1);
    // en ロケールは祝日を考慮しない: 5/4,5/5,5/6,5/7 が営業日になる
    expect(
      diffInBusinessDays(createDate(2026, 4, 1), createDate(2026, 4, 7), "en"),
    ).toBe(4);
  });

  test("addBusinessDays と diffInBusinessDays の逆関係", () => {
    const start = createDate(2026, 3, 1); // 2026-04-01（水）
    for (const n of [-10, -5, -1, 0, 1, 5, 10]) {
      const to = addBusinessDays(start, n);
      expect(diffInBusinessDays(start, to)).toBe(n);
    }
  });

  test("営業日の検証エラー", () => {
    expect(() => addBusinessDays(createDate(2026, 0, 1), 1.5)).toThrow(
      RangeError,
    );
    expect(() => addBusinessDays(new Date("invalid"), 1)).toThrow(RangeError);
    expect(() =>
      diffInBusinessDays(createDate(2026, 0, 1), new Date("invalid")),
    ).toThrow(RangeError);
  });
});
