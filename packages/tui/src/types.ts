import type { Locale, WeekStart } from "@typescript-calendar-lib/core";

// ─── Cell ────────────────────────────────────────────────

/** カレンダー1セルのメタデータ */
export interface CalendarCell<T = unknown> {
  /** 日数 (1–31)。空欄セルは null */
  day: number | null;
  /** 完全な Date オブジェクト。day が null なら null */
  date: Date | null;
  /** 曜日インデックス (0=weekStart準拠) */
  dayOfWeek: number;
  /** 当月の日付か（前月/翌月の埋め込みセルは false） */
  isCurrentMonth: boolean;
  /** 土曜 or 日曜か */
  isWeekend: boolean;
  /** 今日の日付か */
  isToday: boolean;
  /** ハイライト対象か */
  isHighlight: boolean;
  /** 範囲指定の色付け対象か */
  isInRange: boolean;
  /** ユーザー定義データ。cellData が解決した値。未設定セルは undefined */
  data?: T;
}

// ─── MonthData ───────────────────────────────────────────

/** 月カレンダーの完全なデータ */
export interface MonthData<T = unknown> {
  year: number;
  /** 1–12 */
  month: number;
  /** ロケール適用済みタイトル（例: "September 2026", "9月 2026"） */
  title: string;
  /** 曜日ヘッダー（例: ["Sun", "Mon", ...]） */
  weekdays: readonly string[];
  /** 6行 × 7列のセルグリッド */
  cells: CalendarCell<T>[][];
  /** 日付を含む行数（末尾の全 null 行を除く） */
  visibleRows: number;
}

// ─── Options ─────────────────────────────────────────────

/** buildMonthData に渡すオプション（プレゼンテーション情報は含まない） */
export interface MonthDataOptions<T = unknown> {
  locale?: Locale;
  weekStart?: WeekStart;
  /** 今日の基準日。省略時は new Date() */
  today?: Date;
  /** ハイライト対象日 */
  highlight?: Date;
  /** 色付け範囲。from > to は RangeError */
  range?: { from: Date; to: Date };
  /** 各セルに付与するユーザー定義データを解決する関数。実セルのみに呼ばれる */
  cellData?: (date: Date) => T | undefined;
}

// ─── State ───────────────────────────────────────────────

/** createCalendarState に渡すオプション */
export interface CalendarStateOptions<T = unknown> {
  /** 表示開始年。欠落時は today の年。NaN や非整数は RangeError */
  initialYear?: number;
  /** 表示開始月 (1–12)。範囲外は正規化される（例: 13 → 翌年1月） */
  initialMonth?: number;
  /** 初期カーソル位置。null なら未フォーカス（矢印キーで今日 or 先頭日付にスナップ） */
  initialCursor?: { row: number; col: number } | null;
  /** 今日の基準日。省略時は生成時に new Date() で解決され、状態に固定される */
  today?: Date;
  locale?: Locale;
  weekStart?: WeekStart;
  /** ハイライト対象日 */
  highlight?: Date;
  /** 色付け範囲。from > to は RangeError */
  range?: { from: Date; to: Date };
  /** 各セルに付与するユーザー定義データを解決する関数。実セルのみに呼ばれる */
  cellData?: (date: Date) => T | undefined;
}

/** 状態に保持される解決済みオプション（月移動時も引き継がれる） */
export interface ResolvedOptions<T = unknown> {
  locale: Locale;
  weekStart: WeekStart;
  today: Date;
  highlight?: Date;
  range?: { from: Date; to: Date };
  /** 各セルに付与するユーザー定義データを解決する関数。実セルのみに呼ばれる */
  cellData?: (date: Date) => T | undefined;
}

/** インタラクティブカレンダーの状態 */
export interface CalendarState<T = unknown> {
  year: number;
  /** 1–12 */
  month: number;
  /** カーソル位置。null なら未フォーカス */
  cursor: { row: number; col: number } | null;
  /** 選択済み日付。未選択なら null */
  selectedDate: Date | null;
  /** 状態生成時に解決されたオプション */
  options: ResolvedOptions<T>;
  /** 現在表示中の月データ（キャッシュ） */
  monthData: MonthData<T>;
}

/** ナビゲーション方向 */
export type Direction = "up" | "down" | "left" | "right";

/** 月の移動方向 */
export type MonthDirection = "prev" | "next";
