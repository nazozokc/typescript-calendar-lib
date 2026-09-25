import { addDays } from "./date-math.ts";
import type { Locale } from "./types.ts";
import { assertValidDate, createDate } from "./validation.ts";

// ─── 日本の祝日 ───────────────────────────────────────────

/**
 * 祝日データを持つロケール。現在は日本語（日本の国民の祝日）のみ。
 * その他のロケールは「祝日なし」として扱われる（isHoliday は常に false）。
 */
export type HolidayLocale = "ja";

/** 祝日が計算できる年範囲（1949 年以降の現行祝日法制に基づく） */
export const HOLIDAY_MIN_YEAR = 1949;

/** 祝日が計算できる年範囲（秋分の日の近似式が有効な上限。実用上十分） */
export const HOLIDAY_MAX_YEAR = 2100;

/** 1回限りの祝日（皇室行事・改元に伴う法律で定められたもの）: "YYYY-MM-DD" → 名称 */
const ONE_OFF_HOLIDAYS: Readonly<Record<string, string>> = {
  "1959-04-10": "皇太子明仁親王の結婚の儀",
  "1989-02-24": "昭和天皇の大喪の礼",
  "1990-11-12": "即位の礼正殿の儀",
  "1993-06-09": "皇太子徳仁親王の結婚の儀",
  "2019-05-01": "天皇即位の日",
  "2019-10-22": "即位礼正殿の儀",
};

/** 年の祝日一覧の1件（month は 1-12） */
interface YearHoliday {
  month: number;
  day: number;
  name: string;
}

/** 年月日の曜日（0=日曜） */
function dayOfWeek(year: number, month: number, day: number): number {
  return createDate(year, month - 1, day).getDay();
}

/**
 * 国民の祝日に関する法律と特例法に基づき、年の祝日一覧を規則から算出する。
 *
 * 計算順: ①祝日（固定日・第n月曜・春分/秋分）→ ②特例の祝日 → ③振替休日
 * （1973年以降、祝日が日曜のとき直後の祝日でない日）→ ④国民の休日
 * （1986年以降、祝日（日曜を除く）に挟まれた平日）。
 * 祝日の名称は「元日」「成人の日」など法律上の名称、「振替休日」「国民の休日」はそのままの名称。
 * 2020/2021 年の東京五輪特例（海の日・山の日・スポーツの日の振替）も反映する。
 * 秋分の日・春分の日は天文学的な秋分/春分の日付（1851〜2099 年で有効な近似式）で算出する。
 */
function holidaysOfYear(year: number): YearHoliday[] {
  const list: YearHoliday[] = [];
  const add = (month: number, day: number, name: string): void => {
    list.push({ month, day, name });
  };
  /** 指定月の第 n 曜日（weekday: 0=日曜 .. 6=土曜）の日付を返す */
  const nthWeekday = (weekday: number, n: number, month: number): number => {
    const first = createDate(year, month - 1, 1);
    const offset = (weekday - first.getDay() + 7) % 7;
    return 1 + offset + (n - 1) * 7;
  };
  const monday = (n: number, month: number): number => nthWeekday(1, n, month);
  const springEquinox = Math.floor(
    20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4),
  );
  const fallEquinox = Math.floor(
    23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4),
  );

  // ── ① 国民の祝日（法律上の規則） ──
  if (year >= 1949) add(1, 1, "元日");
  if (year >= 1949) {
    // 成人の日: 2000年以降は1月第2月曜
    add(1, year <= 1999 ? 15 : monday(2, 1), "成人の日");
  }
  if (year >= 1967) add(2, 11, "建国記念の日");
  if (year >= 1949) {
    // 天皇誕生日: 4/29（〜1988）→ 12/23（1989-2018）→ 2019年はなし → 2/23（2020-）
    if (year <= 1988) {
      add(4, 29, "天皇誕生日");
    } else if (year <= 2018) {
      add(12, 23, "天皇誕生日");
    } else if (year >= 2020) {
      add(2, 23, "天皇誕生日");
    }
  }
  if (year >= 2007) add(4, 29, "昭和の日");
  if (year >= 1949) add(5, 3, "憲法記念日");
  if (year >= 1989 && year <= 2006) add(4, 29, "みどりの日");
  if (year >= 2007) add(5, 4, "みどりの日");
  if (year >= 1949) add(5, 5, "こどもの日");
  if (year >= 1996) {
    // 海の日: 7/20（〜2002）→ 第3月曜（2003-）。2020/2021 は東京五輪特例
    if (year <= 2002) {
      add(7, 20, "海の日");
    } else if (year === 2020) {
      add(7, 23, "海の日");
    } else if (year === 2021) {
      add(7, 22, "海の日");
    } else {
      add(7, monday(3, 7), "海の日");
    }
  }
  if (year >= 2016) {
    // 山の日: 8/11。2020/2021 は東京五輪特例
    if (year === 2020) {
      add(8, 10, "山の日");
    } else if (year === 2021) {
      add(8, 8, "山の日");
    } else {
      add(8, 11, "山の日");
    }
  }
  if (year >= 1949) add(3, springEquinox, "春分の日");
  if (year >= 1966) {
    // 敬老の日: 9/15（〜2002）→ 第3月曜（2003-）
    add(9, year <= 2002 ? 15 : monday(3, 9), "敬老の日");
  }
  if (year >= 1949) add(9, fallEquinox, "秋分の日");
  if (year >= 1966) {
    // 体育の日: 10/10（〜1999）→ 第2月曜（2000-2019）→ スポーツの日（2020-）。
    // 2020/2021 は東京五輪特例
    if (year <= 1999) {
      add(10, 10, "体育の日");
    } else if (year <= 2019) {
      add(10, monday(2, 10), "体育の日");
    } else if (year === 2020) {
      add(7, 24, "スポーツの日");
    } else if (year === 2021) {
      add(7, 23, "スポーツの日");
    } else {
      add(10, monday(2, 10), "スポーツの日");
    }
  }
  if (year >= 1949) add(11, 3, "文化の日");
  if (year >= 1949) add(11, 23, "勤労感謝の日");

  // ── ② 特例の祝日 ──
  for (const [key, name] of Object.entries(ONE_OFF_HOLIDAYS)) {
    const [y, m, d] = key.split("-").map(Number);
    if (y === year) add(m! as number, d! as number, name);
  }

  const inList = (month: number, day: number): boolean =>
    list.some((h) => h.month === month && h.day === day);

  // ── ③ 振替休日（1973年の法改正により同年4月12日から施行）: 祝日が日曜に当たるとき、直後の祝日でない日を休日とする ──
  if (year >= 1973) {
    const substituteFrom = createDate(1973, 3, 12).getTime(); // 制度施行日 1973-04-12
    for (const h of [...list]) {
      if (dayOfWeek(year, h.month, h.day) !== 0) continue;
      const base = createDate(year, h.month - 1, h.day);
      if (base.getTime() < substituteFrom) continue;
      for (let i = 1; i <= 7; i++) {
        const next = addDays(base, i);
        if (!inList(next.getMonth() + 1, next.getDate())) {
          add(next.getMonth() + 1, next.getDate(), "振替休日");
          break;
        }
      }
    }
  }

  // ── ④ 国民の休日（1986年の法改正以降）: 祝日（日曜を除く）に挟まれた平日を休日とする ──
  if (year >= 1986) {
    for (let month = 1; month <= 12; month++) {
      const days = createDate(year, month, 0).getDate();
      for (let day = 1; day <= days; day++) {
        if (inList(month, day)) continue;
        const date = createDate(year, month - 1, day);
        if (date.getDay() === 0) continue;
        const prev = addDays(date, -1);
        const next = addDays(date, 1);
        if (
          inList(prev.getMonth() + 1, prev.getDate()) &&
          inList(next.getMonth() + 1, next.getDate())
        ) {
          add(month, day, "国民の休日");
        }
      }
    }
  }

  return list;
}

/** 年の計算結果キャッシュ（同じ年を何度も参照する描画用途のため） */
const holidayCache = new Map<number, YearHoliday[]>();

/** 祝日一覧を取得する。対象外ロケール・範囲外の年は null */
function holidaysOf(date: Date, locale: Locale): YearHoliday[] | null {
  if (locale !== "ja") return null;
  const year = date.getFullYear();
  if (year < HOLIDAY_MIN_YEAR || year > HOLIDAY_MAX_YEAR) return null;
  const cached = holidayCache.get(year);
  if (cached !== undefined) return cached;
  const list = holidaysOfYear(year);
  holidayCache.set(year, list);
  return list;
}

/** 日付が祝日（日本の国民の祝日・振替休日・国民の休日）か判定する。対象外ロケール/年は false */
export function isHoliday(date: Date, locale: Locale = "ja"): boolean {
  assertValidDate(date);
  const list = holidaysOf(date, locale);
  if (list === null) return false;
  return list.some(
    (h) => h.month === date.getMonth() + 1 && h.day === date.getDate(),
  );
}

/** 日付の祝日名を返す。祝日でない・対象外ロケール/年は undefined */
export function getHolidayName(
  date: Date,
  locale: Locale = "ja",
): string | undefined {
  assertValidDate(date);
  const list = holidaysOf(date, locale);
  if (list === null) return undefined;
  return list.find(
    (h) => h.month === date.getMonth() + 1 && h.day === date.getDate(),
  )?.name;
}

// ─── 営業日 ───────────────────────────────────────────────

/** 日付が営業日（平日かつ祝日でない）か判定する */
export function isBusinessDay(date: Date, locale: Locale = "ja"): boolean {
  assertValidDate(date);
  if (date.getDay() === 0 || date.getDay() === 6) return false;
  return !isHoliday(date, locale);
}

/** 加算する営業日数が整数であることを検証する */
function assertBusinessAmount(amount: number): void {
  if (!Number.isInteger(amount)) {
    throw new RangeError(`Invalid amount: ${amount} (expected an integer)`);
  }
}

/**
 * 日付に営業日数を加算する（負数で減算）。土日・祝日はスキップされる。
 * 加算の起点は date そのもの（date 自体は数えない）。date === 戻り値になるのは amount = 0 のとき。
 * 例: 2026-05-01（金）に 1 を足すと 2026-05-07（木）になる（5/3-5/6 が祝日）。
 */
export function addBusinessDays(
  date: Date,
  amount: number,
  locale: Locale = "ja",
): Date {
  assertValidDate(date);
  assertBusinessAmount(amount);
  const result = new Date(date.getTime());
  const step = amount >= 0 ? 1 : -1;
  let remaining = Math.abs(amount);
  while (remaining > 0) {
    result.setDate(result.getDate() + step);
    if (isBusinessDay(result, locale)) remaining--;
  }
  return result;
}

/**
 * 2つの日付の間の営業日数（to - from 方向）を返す。マイナスもありうる。
 * from 自身は数えず、to は数える。例: 月曜→火曜 = 1、金曜→翌月曜 = 1（土日はスキップ）。
 * `addBusinessDays(from, n) === to` と `diffInBusinessDays(from, to) === n` は同値。
 */
export function diffInBusinessDays(
  from: Date,
  to: Date,
  locale: Locale = "ja",
): number {
  assertValidDate(from);
  assertValidDate(to);
  const sign = to.getTime() >= from.getTime() ? 1 : -1;
  const cursor = new Date(from.getTime());
  let count = 0;
  for (;;) {
    cursor.setDate(cursor.getDate() + sign);
    if (
      sign > 0
        ? cursor.getTime() > to.getTime()
        : cursor.getTime() < to.getTime()
    ) {
      break;
    }
    if (isBusinessDay(cursor, locale)) count++;
  }
  return count * sign;
}
