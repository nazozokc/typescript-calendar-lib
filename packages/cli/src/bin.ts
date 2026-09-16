#!/usr/bin/env node
import { createRequire } from "node:module";
import type {
  HighlightStyle,
  Locale,
  WeekStart,
} from "@typescript-calendar-lib/core";
import {
  createDate,
  LOCALES,
  MAX_YEAR,
  MIN_YEAR,
} from "@typescript-calendar-lib/core";
import { calendar, calendarRange, calendarYear } from "./calendar.ts";
import type { ColorSchemeName, ThemeName } from "./theme.ts";

export interface CliArgs {
  year?: number;
  month?: number;
  theme?: ThemeName;
  colorScheme?: ColorSchemeName;
  color?: boolean;
  noColor?: boolean;
  locale?: Locale;
  weekStart?: WeekStart;
  highlight?: Date;
  highlightStyle?: HighlightStyle;
  today?: Date;
  yearView?: boolean;
  range?: { from: Date; to: Date };
}

export interface ParseResult {
  args: CliArgs;
  error?: string;
  help?: boolean;
  version?: boolean;
}

const THEMES: readonly ThemeName[] = ["default", "modern"];
const COLOR_SCHEMES: readonly ColorSchemeName[] = [
  "default",
  "ocean",
  "forest",
  "sunset",
  "mono",
];
const LOCALE_LIST: readonly string[] = Object.keys(LOCALES);
const WEEK_STARTS: readonly WeekStart[] = ["sunday", "monday"];
const HIGHLIGHT_STYLES: readonly HighlightStyle[] = ["bracket", "reverse"];

const _require = createRequire(import.meta.url);

/** package.json からバージョンを取得する */
export function getVersion(): string {
  return (_require("../package.json") as { version: string }).version;
}

/**
 * CLI フラグ・環境変数・TTY 状態から最終的な color フラグを解決する。
 * 優先順位: --no-color > --color > NO_COLOR > FORCE_COLOR > TTY
 */
export function resolveColor(
  colorFlag: boolean | undefined,
  noColorFlag: boolean | undefined,
  env: Record<string, string | undefined>,
  isTTY: boolean,
): boolean {
  if (noColorFlag) return false;
  if (colorFlag) return true;
  if (env.NO_COLOR) return false;
  if (env.FORCE_COLOR) return true;
  return isTTY;
}

/** 値を一つ取るオプションと、代入先のフィールド名 */
const VALUE_OPTIONS: Record<string, keyof CliArgs> = {
  "--theme": "theme",
  "--color-scheme": "colorScheme",
  "--locale": "locale",
  "--week-start": "weekStart",
  "--highlight-style": "highlightStyle",
};

/** YYYY-MM-DD 形式の日付文字列をパースする */
export function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (
    year < MIN_YEAR ||
    year > MAX_YEAR ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  const date = createDate(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * CLI 引数をパースする。テスト可能なように副作用を分離している。
 */
export function parseArgs(args: readonly string[]): ParseResult {
  const result: CliArgs = {};
  const error = (message: string): ParseResult => ({
    args: result,
    error: message,
  });

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    if (arg === "-h" || arg === "--help") {
      return { args: result, help: true };
    }
    if (arg === "-v" || arg === "--version") {
      return { args: result, version: true };
    }
    if (arg === "--color") {
      result.color = true;
      continue;
    }
    if (arg === "--no-color") {
      result.noColor = true;
      continue;
    }
    if (arg === "--year") {
      result.yearView = true;
      continue;
    }
    if (arg === "--highlight") {
      const value = args[++i];
      if (value === undefined) {
        return error("Missing value for option: --highlight");
      }
      const parsed = parseDate(value);
      if (parsed === null) {
        return error(
          `Invalid --highlight date: "${value}" (expected YYYY-MM-DD, e.g. 2026-09-08)`,
        );
      }
      result.highlight = parsed;
      continue;
    }
    if (arg === "--today") {
      const value = args[++i];
      if (value === undefined) {
        return error("Missing value for option: --today");
      }
      const parsed = parseDate(value);
      if (parsed === null) {
        return error(
          `Invalid --today date: "${value}" (expected YYYY-MM-DD, e.g. 2026-09-08)`,
        );
      }
      result.today = parsed;
      continue;
    }
    if (arg === "--range") {
      const fromStr = args[++i];
      const toStr = args[++i];
      if (fromStr === undefined || toStr === undefined) {
        return error(
          "--range requires two dates (YYYY-MM-DD), e.g. --range 2026-01-01 2026-03-31",
        );
      }
      const from = parseDate(fromStr);
      const to = parseDate(toStr);
      if (from === null || to === null) {
        return error("Invalid --range date (expected YYYY-MM-DD)");
      }
      if (from.getTime() > to.getTime()) {
        return error("--range: from date must not be after to date");
      }
      result.range = { from, to };
      continue;
    }

    const key = VALUE_OPTIONS[arg];
    if (key !== undefined) {
      const value = args[++i];
      if (value === undefined) {
        return error(`Missing value for option: ${arg}`);
      }
      (result as Record<string, unknown>)[key] = value;
      continue;
    }

    const numeric = /^-?\d+$/.test(arg);
    if (arg.startsWith("-") && !numeric) {
      return error(`Unknown option: ${arg}`);
    }
    if (!numeric) {
      return error(
        `Invalid argument: "${arg}" (expected a year or month number)`,
      );
    }
    if (result.year === undefined) {
      result.year = Number(arg);
    } else if (result.month === undefined) {
      result.month = Number(arg);
    } else {
      return error(`Too many arguments: "${arg}"`);
    }
  }

  // 値のバリデーション
  if (
    result.year !== undefined &&
    (result.year < MIN_YEAR || result.year > MAX_YEAR)
  ) {
    return error(
      `Invalid year: ${result.year} (expected ${MIN_YEAR}–${MAX_YEAR})`,
    );
  }
  if (result.month !== undefined && (result.month < 1 || result.month > 12)) {
    return error(`Invalid month: ${result.month} (expected 1–12)`);
  }

  const choiceTable: Array<[string | undefined, readonly string[], string]> = [
    [result.theme, THEMES, "theme"],
    [result.colorScheme, COLOR_SCHEMES, "color-scheme"],
    [result.locale, LOCALE_LIST, "locale"],
    [result.weekStart, WEEK_STARTS, "week-start"],
    [result.highlightStyle, HIGHLIGHT_STYLES, "highlight-style"],
  ];
  for (const [value, choices, name] of choiceTable) {
    if (value !== undefined && !choices.includes(value)) {
      return error(
        `Invalid ${name}: "${value}" (expected: ${choices.join(" | ")})`,
      );
    }
  }

  // 相互排他チェック
  if (result.yearView && result.range) {
    return error("--year and --range cannot be used together");
  }
  if (result.yearView && result.month !== undefined) {
    return error("Month cannot be used with --year (use --year YYYY instead)");
  }
  if (
    result.range &&
    (result.year !== undefined || result.month !== undefined)
  ) {
    return error("Positional arguments cannot be used with --range");
  }

  return { args: result };
}

export function printUsage(): string {
  return `Usage: typescript-calendar-lib [YYYY] [MM] [options]

  typescript-calendar-lib                       Render the current month
  typescript-calendar-lib 2026                  Render the current month of 2026
  typescript-calendar-lib 2026 9                Render September 2026
  typescript-calendar-lib --year                Render the current year (4×3 grid)
  typescript-calendar-lib 2026 --year           Render 2026 as a year grid
  typescript-calendar-lib --range 2026-01-01 2026-03-31
 Render months from Jan to Mar 2026

Options:
  --theme <name>           Look: default | modern (default: default)
  --color-scheme <name>    Colors: default | ocean | forest | sunset | mono
  --color                  Enable ANSI colors (auto-detected for TTY)
  --no-color               Disable ANSI colors
  --locale <lang>          Language: ${LOCALE_LIST.join(" | ")} (default: en)
  --week-start <day>       First weekday: sunday | monday (default: sunday)
  --highlight <YYYY-MM-DD> Highlight a date (e.g. 2026-09-08)
  --highlight-style <style> Highlight style: bracket | reverse (default: bracket)
  --today <YYYY-MM-DD>     Override today (marks the date, defaults year/month)
  --year                   Render the whole year as a 4×3 grid
  --range <FROM> <TO>      Render months from FROM to TO (YYYY-MM-DD)
  -v, --version            Show version
  -h, --help               Show this help
`;
}

if (import.meta.main) {
  const { args, error, help, version } = parseArgs(process.argv.slice(2));

  if (version) {
    console.log(getVersion());
    process.exit(0);
  }
  if (help) {
    console.log(printUsage());
    process.exit(0);
  }
  if (error) {
    console.error(`Error: ${error}`);
    console.error(printUsage());
    process.exit(1);
  }

  const color = resolveColor(
    args.color,
    args.noColor,
    process.env,
    process.stdout.isTTY === true,
  );

  const now = args.today ?? new Date();
  const year = args.year ?? now.getFullYear();
  const month = args.month ?? now.getMonth() + 1;

  const common = {
    theme: args.theme,
    colorScheme: args.colorScheme,
    color,
    locale: args.locale,
    weekStart: args.weekStart,
    highlight: args.highlight,
    highlightStyle: args.highlightStyle,
    today: args.today,
  };

  let output: string;
  if (args.range) {
    output = calendarRange({
      ...common,
      from: args.range.from,
      to: args.range.to,
    });
  } else if (args.yearView) {
    output = calendarYear({ ...common, year });
  } else {
    output = calendar({ ...common, year, month });
  }

  console.log(output);
}
