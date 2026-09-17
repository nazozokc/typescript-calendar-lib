# Architecture

typescript-calendar-lib は 6 つのパッケージからなる monorepo です。すべてのパッケージが共有ロジックを持つ `core` に依存し、下位レイヤーほど汎用的、上位レイヤーほど具体的な出力を持ちます。

## Dependency Graph

```
core (zero runtime dependencies)
 ├── tui (zero extra deps)
 │    ├── cli
 │    └── web ──┬── react (+ react ^19 peer)
 │              └── svelte (+ svelte ^5 peer)
 └── react / svelte / cli は core にも直接依存する
```

| Package | Layer | Role |
| :--- | :--- | :--- |
| [`core`](/packages/core) | ドメイン | 日付計算・ロケールデータ・グリッド生成・検証 |
| [`tui`](/packages/tui) | 状態 | ヘッドレスなカーソル/選択/ナビゲーション状態マシン |
| [`cli`](/packages/cli) | 出力 | プレーンテキスト + ANSI 色での描画、CLI バイナリ |
| [`web`](/packages/web) | 見た目 | テーマ・カラースキーム・セルサイズ・共有 CSS（フレームワーク非依存） |
| [`react`](/packages/react) | 出力 | `<Calendar />` コンポーネント + `useCalendarState` hook |
| [`svelte`](/packages/svelte) | 出力 | `Calendar` / `InteractiveCalendar` コンポーネント + `useCalendarState` |

## Layer 1: core — ドメインロジック

`core` はフレームワーク非依存のロジックだけを提供します。

- **日付計算**: `firstDayOfMonth`, `lastDayOfMonth`, `isSameDay`, `isDateInRange`, `sortRange`, `getMonthRange`
- **グリッド生成**: `buildMonthGrid` — 6×7 のグリッドを組み立てる
- **セル状態**: `getCalendarCellState` — 週末/今日/ハイライト/範囲の boolean 判定
- **ロケール**: `LOCALES`, `getMonthName`, `getWeekdayHeaders` — 英日 + 追加ロケール
- **検証**: `createDate`（year 0-99 の JS Date 陷阱を回避）, `assertValid*` — 不正入力は `RangeError`

`core` は **状態を持ちません**。渡された値から純粋に計算し、文字列や配列を返すだけです。

```ts
import { buildMonthGrid } from "@typescript-calendar-lib/core";

const grid = buildMonthGrid(2026, 9, "sunday");
// [ [null, null, 1, 2, 3, 4, 5], [6, 7, 8, ...], ... ]
```

## Layer 2: tui — 状態マシン

`tui` は `core` の上に**不変状態**を追加します。レンダリングは一切行わず、データ（`MonthData`）と状態（`CalendarState`）を提供します。

- **データ層**: `buildMonthData()` — 各セルにメタデータ（今日/ハイライト/範囲/週末）を付けた完全な月データ
- **状態層**: `createCalendarState()` — カーソル・選択・表示月を保持し、ナビゲーション関数が新しい状態を返す
- **入力層**: `keyToAction()` — キーボードの `key` からカーソル移動/月移動アクションへのマッピング
- **テーマ**: 文字ベースの見た目定義（`THEMES` / `COLOR_SCHEMES`）— cli がそのまま再利用する

すべての操作は**イミュータブル**です。`moveCursor(state, "right")` は元の `state` を変えず、新しい state を返します。これは React/TUI のレンダーループと相性が良い設計です。

```ts
import { createCalendarState, moveCursor, navigateMonth } from "@typescript-calendar-lib/tui";

let state = createCalendarState({ weekStart: "monday" });
state = moveCursor(state, "right");       // → 新しい状態
state = navigateMonth(state, "next");     // → また新しい状態
state = selectDateAt(state, someDate);    // 指定日付へカーソル移動 + 選択
```

## Layer 3: cli — テキスト出力

`cli` は `core` + `tui` のロジックを**プレーンテキスト**として出力します。

- `calendar()` — 単月
- `calendarYear()` — 年間（4列×3行）
- `calendarRange()` — 任意の日付範囲

文字テーマ（枠線の有無・セル幅）は `tui` の定義を再利用し（複製しない）、ANSI カラーパレットのみ `cli` 固有です。`color: false`（既定）ならエスケープコードを含まない安全なプレーンテキストを返します。

```ts
import { calendar } from "@typescript-calendar-lib/cli";

console.log(calendar({ year: 2026, month: 9, theme: "modern", color: true }));
```

`bin.ts` はこれを CLI バイナリとして公開します。

## Layer 4: web — 共有プレゼンテーションデータ

`react` と `svelte` は同じ見た目（テーマ・カラースキーム・セルサイズ・CSS）を共有します。この共通部分を `web` に集約し、各 UI パッケージは型の別名と薄いアダプタだけを持ちます。

- **テーマ**: `THEMES`（default/modern/minimal/rounded/retro）と 7 つのカラースキーム（CSS 変数マップ）
- **セルサイズ**: `isSizeName` / `buildSizeStyle` — CSS 変数（`--cal-cell-w/h`）への変換
- **ラベル**: `formatCellLabel` — セルの aria-label 用テキスト
- **共有 CSS**: `calendar.css` — react / svelte のビルド時に `dist/calendar.css` として同梱

```ts
import { resolveTheme, resolveColorScheme } from "@typescript-calendar-lib/web";
```

## Layer 5: react / svelte — コンポーネント

`react` と `svelte` は `core` + `tui` + `web` を各フレームワークのコンポーネントとして提供します。

- `<Calendar />` — 制御コンポーネント。`year`/`month` を受け取ってグリッドを描画（同名の Svelte 版も同一仕様）
- `useCalendarState` — `tui` の状態マシンを包む hook。カーソル・選択・月移動をフレームワークの状態として管理
- `InteractiveCalendar` — hook + Calendar を一体化し、マウス（クリック選択・ホバー範囲プレビュー）とキーボード（roving tabindex + 矢印/PageUp/PageDown）に対応

```tsx
import { Calendar, useCalendarState } from "@typescript-calendar-lib/react";
import "@typescript-calendar-lib/react/calendar.css";

function App() {
  const { state, goNext, goPrev, cursorDate } = useCalendarState({
    initialYear: 2026,
    initialMonth: 9,
  });

  return (
    <>
      <button onClick={goPrev}>‹</button>
      <Calendar
        year={state.year}
        month={state.month}
        interactive
        onDateClick={(d) => console.log(d)}
      />
      <button onClick={goNext}>›</button>
    </>
  );
}
```

## パッケージの選び方

| やりたいこと | 使うパッケージ |
| :--- | :--- |
| ターミナルにテキストで表示 | `cli` |
| CLI ツールとして使う | `cli`（`typescript-calendar-lib` バイナリ） |
| React アプリの部品にする | `react` |
| Svelte アプリの部品にする | `svelte` |
| Ink / blessed 等の TUI を自作する | `tui` |
| 独自レンダラーを作る | `core` |
| テーマを自作して react/svelte に流用する | `web` |

## 状態管理の思想

`tui` と UI フック（react / svelte）は同じ「不変状態」の思想を共有しています。

- 状態は生成時に解釈され、以後は関数適用で遷移する
- 各関数は必ず新しい状態を返す（破壊的変更なし）
- 表示対象の月データは状態内にキャッシュされる
- 表示ロジック（色・枠線・CSS）は状態から完全に分離されている

この分離により、同じ状態マシンを **CLI・React・Svelte・任意の TUI フレームワーク** で再利用できます。