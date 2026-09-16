import { cleanup, fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import Calendar from "../src/Calendar.svelte";
import InteractiveCalendar from "../src/InteractiveCalendar.svelte";
import { isSizeName } from "../src/size.js";
import HookHarness from "./HookHarness.svelte";

const TODAY = new Date(2026, 8, 15); // 2026-09-15

afterEach(cleanup);

// ─── useCalendarState ────────────────────────────────────

describe("useCalendarState", () => {
  test("初期状態は指定月を表示", () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    expect(screen.getByTestId("title").textContent).toBe("September 2026");
  });

  test("カーソルは今日の日付を指す", () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    expect(screen.getByTestId("cursor").textContent).toBe(TODAY.toISOString());
  });

  test("翌月に移動できる", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    await fireEvent.click(screen.getByTestId("next"));
    expect(screen.getByTestId("title").textContent).toBe("October 2026");
  });

  test("前月に移動できる", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    await fireEvent.click(screen.getByTestId("prev"));
    expect(screen.getByTestId("title").textContent).toBe("August 2026");
  });

  test("今日にジャンプできる", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    await fireEvent.click(screen.getByTestId("next"));
    await fireEvent.click(screen.getByTestId("next"));
    await fireEvent.click(screen.getByTestId("today"));
    expect(screen.getByTestId("title").textContent).toBe("September 2026");
  });

  test("カーソルを右に動かせる", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    const before = screen.getByTestId("cursor").textContent;
    await fireEvent.click(screen.getByTestId("right"));
    const after = screen.getByTestId("cursor").textContent;
    expect(after).not.toBe(before);
  });

  test("日付を選択できる", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    await fireEvent.click(screen.getByTestId("select"));
    expect(screen.getByTestId("selected").textContent).toBe(
      TODAY.toISOString(),
    );
  });
});

// ─── useCalendarState マウス操作ヘルパー ─────────────────

describe("useCalendarState マウス操作ヘルパー", () => {
  test("選択を解除できる", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    await fireEvent.click(screen.getByTestId("select"));
    await fireEvent.click(screen.getByTestId("clear"));
    expect(screen.getByTestId("selected").textContent).toBe("null");
  });

  test("setCursorToDate でカーソルが指定日付へ移動する", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    await fireEvent.click(screen.getByTestId("cursor-to"));
    expect(screen.getByTestId("cursor").textContent).toBe(
      new Date(2026, 8, 20).toISOString(),
    );
  });

  test("setCursorToDate は当月外の日付では no-op", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    await fireEvent.click(screen.getByTestId("cursor-to-outside"));
    expect(screen.getByTestId("cursor").textContent).toBe(TODAY.toISOString());
  });

  test("selectDateAt で指定日付が選択されカーソルも移動する", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    await fireEvent.click(screen.getByTestId("select-at"));
    expect(screen.getByTestId("selected").textContent).toBe(
      new Date(2026, 8, 20).toISOString(),
    );
    expect(screen.getByTestId("cursor").textContent).toBe(
      new Date(2026, 8, 20).toISOString(),
    );
  });

  test("selectDateAt は当月外の日付では no-op", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    await fireEvent.click(screen.getByTestId("select-at-outside"));
    expect(screen.getByTestId("selected").textContent).toBe("null");
  });

  test("hoveredDate は初期状態で null", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    expect(screen.getByTestId("hovered").textContent).toBe("null");
  });

  test("setHoveredDate でホバー日付を更新・クリアできる", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    await fireEvent.click(screen.getByTestId("hover"));
    expect(screen.getByTestId("hovered").textContent).toBe(
      new Date(2026, 8, 20).toISOString(),
    );
    await fireEvent.click(screen.getByTestId("unhover"));
    expect(screen.getByTestId("hovered").textContent).toBe("null");
  });

  test("月移動で hoveredDate がクリアされる", async () => {
    render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    await fireEvent.click(screen.getByTestId("hover"));
    await fireEvent.click(screen.getByTestId("next"));
    expect(screen.getByTestId("hovered").textContent).toBe("null");
  });
});

// ─── useCalendarState options 更新 ──────────────────────

describe("useCalendarState options 更新", () => {
  test("highlight の変更が状態に反映される", async () => {
    const first = new Date(2026, 8, 10);
    const result = render(HookHarness, {
      props: {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        highlight: first,
      },
    });
    expect(screen.getByTestId("highlight").textContent).toBe(
      first.toISOString(),
    );

    const next = new Date(2026, 8, 11);
    await result.rerender({ highlight: next });
    expect(screen.getByTestId("highlight").textContent).toBe(
      next.toISOString(),
    );
  });

  test("range の変更が状態に反映される", async () => {
    const result = render(HookHarness, {
      props: {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) },
      },
    });
    expect(screen.getByTestId("range-count").textContent).toBe("15");

    await result.rerender({
      range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 10) },
    });
    expect(screen.getByTestId("range-count").textContent).toBe("10");
  });

  test("today の変更が状態に反映される", async () => {
    const result = render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    expect(screen.getByTestId("today-cell").textContent).toBe("15");

    await result.rerender({ today: new Date(2026, 8, 20) });
    expect(screen.getByTestId("today-cell").textContent).toBe("20");
  });

  test("ナビゲーション後に options を変更しても表示月が初期値に戻らない", async () => {
    const result = render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 9, today: TODAY },
    });
    await fireEvent.click(screen.getByTestId("next"));
    expect(screen.getByTestId("title").textContent).toBe("October 2026");

    // highlight の変更は表示月を September に引き戻さない
    await result.rerender({ highlight: new Date(2026, 8, 10) });
    expect(screen.getByTestId("title").textContent).toBe("October 2026");
  });

  test("initialMonth が範囲外でも options 更新後に state と monthData が乖離しない", async () => {
    const result = render(HookHarness, {
      props: { initialYear: 2026, initialMonth: 13, today: TODAY },
    });
    expect(screen.getByTestId("title").textContent).toContain("January 2027");

    // 別オプション（locale）の変更で再構築されても正規化済みの位置を維持する
    await result.rerender({ locale: "ja" });
    expect(screen.getByTestId("title").textContent).toBe("1月 2027");
  });
});

// ─── Calendar component ─────────────────────────────────

describe("Calendar", () => {
  test("タイトルとセルが描画される", () => {
    const { container } = render(Calendar, {
      props: { year: 2026, month: 9, today: TODAY },
    });
    expect(screen.getByText("September 2026")).toBeTruthy();
    expect(container.querySelectorAll("td")).not.toHaveLength(0);
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  test("interactive モードではセル内に button がレンダリングされる", () => {
    render(Calendar, {
      props: { year: 2026, month: 9, interactive: true, today: TODAY },
    });
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    // テーブルセルのセマンティクスを保つため button は td の内側にある
    expect(buttons[0]!.closest("td")).not.toBeNull();
  });

  test("セルクリックで onDateClick が呼ばれる", () => {
    const onClick = vi.fn();
    render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        onDateClick: onClick,
      },
    });
    const cells = screen.getAllByRole("button");
    fireEvent.click(cells[0]!);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]![0]).toBeInstanceOf(Date);
  });

  test("セルホバーで onDateHover が呼ばれる", () => {
    const onHover = vi.fn();
    render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        onDateHover: onHover,
      },
    });
    const cells = screen.getAllByRole("button");
    fireEvent.mouseEnter(cells[0]!);
    expect(onHover).toHaveBeenCalledTimes(1);
  });

  test("interactive モードで calendar-interactive クラスがつく", () => {
    const { container } = render(Calendar, {
      props: { year: 2026, month: 9, interactive: true, today: TODAY },
    });
    expect(container.firstChild).toHaveClass("calendar-interactive");
  });

  test("逆転した range は RangeError", () => {
    expect(() =>
      render(Calendar, {
        props: {
          year: 2026,
          month: 9,
          range: { from: new Date(2026, 8, 15), to: new Date(2026, 8, 1) },
        },
      }),
    ).toThrow(RangeError);
  });

  test("isSizeName は組み込みサイズ名のみ true", () => {
    expect(isSizeName("sm")).toBe(true);
    expect(isSizeName("md")).toBe(true);
    expect(isSizeName("lg")).toBe(true);
    expect(isSizeName("xl" as never)).toBe(false);
    expect(isSizeName({ width: 48 })).toBe(false);
  });

  test("未知のサイズ名文字列でもクラッシュしない", () => {
    const { container } = render(Calendar, {
      props: { year: 2026, month: 9, size: "xl" as never },
    });
    const root = container.firstChild as HTMLElement;
    expect(root.className).not.toContain("calendar-size");
    expect(root.querySelectorAll("td")).not.toHaveLength(0);
  });
});

// ─── Calendar の視覚プロップ ─────────────────────────────

describe("Calendar の視覚プロップ", () => {
  test("theme 名に対応するクラスが付く", () => {
    const { container } = render(Calendar, {
      props: { year: 2026, month: 9, theme: "modern", today: TODAY },
    });
    expect(container.firstChild).toHaveClass("calendar-theme-modern");
  });

  test("カスタムテーマのクラスが付く", () => {
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        theme: { className: "my-cal" },
        today: TODAY,
      },
    });
    expect(container.firstChild).toHaveClass("my-cal");
  });

  test("未知のテーマ名は default にフォールバックする", () => {
    const { container } = render(Calendar, {
      props: { year: 2026, month: 9, theme: "unknown" as never, today: TODAY },
    });
    expect(container.firstChild).toHaveClass("calendar-theme-default");
  });

  test("colorScheme で CSS 変数が設定される", () => {
    const { container } = render(Calendar, {
      props: { year: 2026, month: 9, colorScheme: "ocean", today: TODAY },
    });
    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue("--cal-bg")).toBe("#f0f9ff");
  });

  test("カスタムカラースキームが反映される", () => {
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        colorScheme: { "--cal-bg": "#123456" },
        today: TODAY,
      },
    });
    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue("--cal-bg")).toBe("#123456");
  });

  test("未知のカラースキーム名は default にフォールバックする", () => {
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        colorScheme: "unknown" as never,
        today: TODAY,
      },
    });
    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue("--cal-bg")).toBe("#ffffff");
  });

  test("size 名でサイズクラスが付く", () => {
    const { container } = render(Calendar, {
      props: { year: 2026, month: 9, size: "lg", today: TODAY },
    });
    expect(container.firstChild).toHaveClass("calendar-size-lg");
  });

  test("カスタムサイズで CSS 変数が設定される", () => {
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        size: { width: 48, height: 40 },
        today: TODAY,
      },
    });
    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue("--cal-cell-w")).toBe("48px");
    expect(root.style.getPropertyValue("--cal-cell-h")).toBe("40px");
  });

  test("style で CSS 変数を上書きできる", () => {
    const { container } = render(Calendar, {
      props: { year: 2026, month: 9, style: { "--cal-bg": "#000000" } },
    });
    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue("--cal-bg")).toBe("#000000");
  });

  test("locale でタイトルと言語が変わる", () => {
    render(Calendar, { props: { year: 2026, month: 9, locale: "ja" } });
    expect(screen.getByText("9月 2026")).toBeTruthy();
  });

  test("weekStart=monday で月曜始まりになる", () => {
    const { container } = render(Calendar, {
      props: { year: 2026, month: 9, weekStart: "monday" },
    });
    const header = container.querySelectorAll("th");
    expect(header[0]!.textContent).toBe("Mon");
  });

  test("範囲外の month は RangeError（fail fast）", () => {
    expect(() => render(Calendar, { props: { year: 2026, month: 0 } })).toThrow(
      RangeError,
    );
    expect(() =>
      render(Calendar, { props: { year: 2026, month: 13 } }),
    ).toThrow(RangeError);
  });
});

// ─── Calendar selected / cursorDate ──────────────────────

describe("Calendar selected / cursorDate", () => {
  test("selected の日にちに is-selected クラスが付く", () => {
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        selected: new Date(2026, 8, 10),
        today: TODAY,
      },
    });
    const cell = container.querySelector("td.is-selected");
    expect(cell).not.toBeNull();
    expect(cell!.textContent).toBe("10");
  });

  test("cursorDate の日にちに is-cursor クラスが付く", () => {
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        cursorDate: new Date(2026, 8, 12),
        today: TODAY,
      },
    });
    const cell = container.querySelector("td.is-cursor");
    expect(cell).not.toBeNull();
    expect(cell!.textContent).toBe("12");
  });

  test("当月外の selected にはクラスが付かない", () => {
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        selected: new Date(2026, 10, 5),
        today: TODAY,
      },
    });
    expect(container.querySelector("td.is-selected")).toBeNull();
  });

  test("interactive で selected の button に aria-pressed=true が付く", () => {
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        interactive: true,
        selected: new Date(2026, 8, 10),
        today: TODAY,
      },
    });
    const pressed = container.querySelector('button[aria-pressed="true"]');
    expect(pressed).not.toBeNull();
    expect(pressed!.textContent).toBe("10");
  });

  test("selected 以外の button には aria-pressed が付かない", () => {
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        interactive: true,
        selected: new Date(2026, 8, 10),
        today: TODAY,
      },
    });
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(1);
    for (const button of buttons) {
      if (button.textContent !== "10") {
        expect(button.getAttribute("aria-pressed")).toBeNull();
      }
    }
  });

  test("today の button に aria-current=date が付く", () => {
    const { container } = render(Calendar, {
      props: { year: 2026, month: 9, interactive: true, today: TODAY },
    });
    const current = container.querySelector('button[aria-current="date"]');
    expect(current).not.toBeNull();
    expect(current!.textContent).toBe("15");
  });

  test("非 interactive では aria 属性は付かない", () => {
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        selected: new Date(2026, 8, 10),
        cursorDate: new Date(2026, 8, 12),
        today: TODAY,
      },
    });
    expect(container.querySelector("button")).toBeNull();
    // クラス付与は interactive の有無に関わらず行われる
    expect(container.querySelector("td.is-selected")).not.toBeNull();
    expect(container.querySelector("td.is-cursor")).not.toBeNull();
  });
});

// ─── Calendar マウス操作プロップ ──────────────────────────

describe("Calendar マウス操作プロップ", () => {
  test("hoveredDate のセルに is-hovered クラスがつく", () => {
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        hoveredDate: new Date(2026, 8, 10),
      },
    });
    const hovered = container.querySelector("td.is-hovered");
    expect(hovered).not.toBeNull();
    expect(hovered!.textContent).toBe("10");
    const other = container.querySelector("td:not(.is-hovered)");
    expect(other).not.toBeNull();
  });

  test("rangePreview 内のセルに is-in-range-preview クラスがつく", () => {
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        rangePreview: { from: new Date(2026, 8, 5), to: new Date(2026, 8, 10) },
      },
    });
    const preview = container.querySelectorAll("td.is-in-range-preview");
    expect(preview.length).toBe(6); // 5日〜10日
  });

  test("マウス離脱で onDateLeave が呼ばれる", () => {
    const onLeave = vi.fn();
    const { container } = render(Calendar, {
      props: {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        onDateLeave: onLeave,
      },
    });
    fireEvent.mouseLeave(container.firstChild!);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  test("非インタラクティブでは onDateLeave は呼ばれない", () => {
    const onLeave = vi.fn();
    const { container } = render(Calendar, {
      props: { year: 2026, month: 9, today: TODAY, onDateLeave: onLeave },
    });
    fireEvent.mouseLeave(container.firstChild!);
    expect(onLeave).not.toHaveBeenCalled();
  });
});

// ─── InteractiveCalendar ─────────────────────────────────

describe("InteractiveCalendar", () => {
  const props = () => ({
    initialYear: 2026,
    initialMonth: 9,
    today: TODAY,
  });

  test("セルクリックで日付が選択され aria-pressed が付く", async () => {
    render(InteractiveCalendar, { props: props() });
    const btn = screen.getByRole("button", { name: /September 10, 2026/ });
    await fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn.closest("td")).toHaveClass("is-selected");
  });

  test("ホバーで is-hovered クラスがつき、離脱で消える", async () => {
    const { container } = render(InteractiveCalendar, { props: props() });
    const btn = screen.getByRole("button", { name: /September 10, 2026/ });
    await fireEvent.mouseEnter(btn);
    expect(btn.closest("td")).toHaveClass("is-hovered");
    const calendarRoot = container.querySelector(".calendar")!;
    await fireEvent.mouseLeave(calendarRoot);
    expect(btn.closest("td")).not.toHaveClass("is-hovered");
  });

  test("選択後にホバーすると範囲プレビューが表示される", async () => {
    render(InteractiveCalendar, { props: props() });
    await fireEvent.click(
      screen.getByRole("button", { name: /September 10, 2026/ }),
    );
    await fireEvent.mouseEnter(
      screen.getByRole("button", { name: /September 15, 2026/ }),
    );
    const mid = screen.getByRole("button", { name: /September 12, 2026/ });
    expect(mid.closest("td")).toHaveClass("is-in-range-preview");
    const out = screen.getByRole("button", { name: /September 17, 2026/ });
    expect(out.closest("td")).not.toHaveClass("is-in-range-preview");
  });

  test("選択していない状態ではホバーしてもプレビューは出ない", async () => {
    render(InteractiveCalendar, { props: props() });
    await fireEvent.mouseEnter(
      screen.getByRole("button", { name: /September 10, 2026/ }),
    );
    const mid = screen.getByRole("button", { name: /September 12, 2026/ });
    expect(mid.closest("td")).not.toHaveClass("is-in-range-preview");
  });

  test("逆順ホバー（選択より前の日付）でもプレビュー範囲が正しく出る", async () => {
    render(InteractiveCalendar, { props: props() });
    await fireEvent.click(
      screen.getByRole("button", { name: /September 15, 2026/ }),
    );
    await fireEvent.mouseEnter(
      screen.getByRole("button", { name: /September 10, 2026/ }),
    );
    const mid = screen.getByRole("button", { name: /September 12, 2026/ });
    expect(mid.closest("td")).toHaveClass("is-in-range-preview");
    const out = screen.getByRole("button", { name: /September 17, 2026/ });
    expect(out.closest("td")).not.toHaveClass("is-in-range-preview");
  });

  test("矢印キーでカーソルが移動しフォーカスも追従する", async () => {
    const { container } = render(InteractiveCalendar, { props: props() });
    const btn = screen.getByRole("button", { name: /September 15, 2026/ });
    await fireEvent.keyDown(btn, { key: "ArrowRight" });
    const cursorBtn = container.querySelector('[data-cursor="true"]');
    expect(cursorBtn?.textContent).toBe("16");
  });

  test("Enter キーでも日付が選択される（クリックと同等）", async () => {
    render(InteractiveCalendar, { props: props() });
    const btn = screen.getByRole("button", { name: /September 15, 2026/ });
    btn.focus();
    // jsdom は button の Enter アクティベーションを実装していないため
    // keyDown 後の click で再現する（実ブラウザでは Enter が click を発火する）
    await fireEvent.keyDown(btn, { key: "Enter" });
    await fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });
});
