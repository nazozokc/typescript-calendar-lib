import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { useCalendarState } from "./hooks.ts";
import { Calendar } from "./index.tsx";
import { InteractiveCalendar } from "./interactive.tsx";
import { isSizeName } from "./size.ts";

const TODAY = new Date(2026, 8, 15); // 2026-09-15

afterEach(cleanup);

// ─── useCalendarState hook ──────────────────────────────

function HookTestComponent() {
  const {
    state,
    goNext,
    goPrev,
    goToday,
    moveCursor,
    selectDate,
    setCursorToDate,
    selectDateAt,
    clearSelection,
    cursorDate,
    selectedDate,
    hoveredDate,
    setHoveredDate,
  } = useCalendarState({
    initialYear: 2026,
    initialMonth: 9,
    today: TODAY,
  });

  return createElement(
    "div",
    null,
    createElement("span", { "data-testid": "title" }, state.monthData.title),
    createElement(
      "span",
      { "data-testid": "cursor" },
      cursorDate?.toISOString() ?? "null",
    ),
    createElement(
      "span",
      { "data-testid": "selected" },
      selectedDate?.toISOString() ?? "null",
    ),
    createElement(
      "span",
      { "data-testid": "hovered" },
      hoveredDate?.toISOString() ?? "null",
    ),
    createElement(
      "button",
      { "data-testid": "next", type: "button", onClick: goNext },
      "Next",
    ),
    createElement(
      "button",
      { "data-testid": "prev", type: "button", onClick: goPrev },
      "Prev",
    ),
    createElement(
      "button",
      { "data-testid": "today", type: "button", onClick: goToday },
      "Today",
    ),
    createElement(
      "button",
      {
        "data-testid": "right",
        type: "button",
        onClick: () => moveCursor("right"),
      },
      "Right",
    ),
    createElement(
      "button",
      { "data-testid": "select", type: "button", onClick: selectDate },
      "Select",
    ),
    createElement(
      "button",
      { "data-testid": "clear", type: "button", onClick: clearSelection },
      "Clear",
    ),
    createElement(
      "button",
      {
        "data-testid": "cursor-to",
        type: "button",
        onClick: () => setCursorToDate(new Date(2026, 8, 20)),
      },
      "CursorTo",
    ),
    createElement(
      "button",
      {
        "data-testid": "cursor-to-outside",
        type: "button",
        onClick: () => setCursorToDate(new Date(2026, 9, 1)),
      },
      "CursorToOutside",
    ),
    createElement(
      "button",
      {
        "data-testid": "select-at",
        type: "button",
        onClick: () => selectDateAt(new Date(2026, 8, 20)),
      },
      "SelectAt",
    ),
    createElement(
      "button",
      {
        "data-testid": "select-at-outside",
        type: "button",
        onClick: () => selectDateAt(new Date(2026, 9, 1)),
      },
      "SelectAtOutside",
    ),
    createElement(
      "button",
      {
        "data-testid": "hover",
        type: "button",
        onClick: () => setHoveredDate(new Date(2026, 8, 20)),
      },
      "Hover",
    ),
    createElement(
      "button",
      {
        "data-testid": "unhover",
        type: "button",
        onClick: () => setHoveredDate(null),
      },
      "Unhover",
    ),
  );
}

describe("useCalendarState", () => {
  test("初期状態は指定月を表示", () => {
    render(createElement(HookTestComponent));
    expect(screen.getByTestId("title").textContent).toBe("September 2026");
  });

  test("カーソルは今日の日付を指す", () => {
    render(createElement(HookTestComponent));
    expect(screen.getByTestId("cursor").textContent).toBe(TODAY.toISOString());
  });

  test("翌月に移動できる", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("next"));
    expect(screen.getByTestId("title").textContent).toBe("October 2026");
  });

  test("前月に移動できる", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("prev"));
    expect(screen.getByTestId("title").textContent).toBe("August 2026");
  });

  test("今日にジャンプできる", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("next"));
    fireEvent.click(screen.getByTestId("next"));
    fireEvent.click(screen.getByTestId("today"));
    expect(screen.getByTestId("title").textContent).toBe("September 2026");
  });

  test("カーソルを右に動かせる", () => {
    render(createElement(HookTestComponent));
    const before = screen.getByTestId("cursor").textContent;
    fireEvent.click(screen.getByTestId("right"));
    const after = screen.getByTestId("cursor").textContent;
    expect(after).not.toBe(before);
  });

  test("日付を選択できる", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("select"));
    expect(screen.getByTestId("selected").textContent).toBe(
      TODAY.toISOString(),
    );
  });

  test("選択を解除できる", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("select"));
    fireEvent.click(screen.getByTestId("clear"));
    expect(screen.getByTestId("selected").textContent).toBe("null");
  });

  test("setCursorToDate でカーソルが指定日付へ移動する", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("cursor-to"));
    expect(screen.getByTestId("cursor").textContent).toBe(
      new Date(2026, 8, 20).toISOString(),
    );
  });

  test("setCursorToDate は当月外の日付では no-op", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("cursor-to-outside"));
    expect(screen.getByTestId("cursor").textContent).toBe(TODAY.toISOString());
  });

  test("selectDateAt で指定日付が選択されカーソルも移動する", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("select-at"));
    expect(screen.getByTestId("selected").textContent).toBe(
      new Date(2026, 8, 20).toISOString(),
    );
    expect(screen.getByTestId("cursor").textContent).toBe(
      new Date(2026, 8, 20).toISOString(),
    );
  });

  test("selectDateAt は当月外の日付では no-op", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("select-at-outside"));
    expect(screen.getByTestId("selected").textContent).toBe("null");
  });

  test("hoveredDate は初期状態で null", () => {
    render(createElement(HookTestComponent));
    expect(screen.getByTestId("hovered").textContent).toBe("null");
  });

  test("setHoveredDate でホバー日付を更新・クリアできる", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("hover"));
    expect(screen.getByTestId("hovered").textContent).toBe(
      new Date(2026, 8, 20).toISOString(),
    );
    fireEvent.click(screen.getByTestId("unhover"));
    expect(screen.getByTestId("hovered").textContent).toBe("null");
  });

  test("月移動で hoveredDate がクリアされる", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("hover"));
    fireEvent.click(screen.getByTestId("next"));
    expect(screen.getByTestId("hovered").textContent).toBe("null");
  });
});

// ─── Calendar component interaction ─────────────────────

describe("Calendar interactive", () => {
  test("interactive モードではセル内に button がレンダリングされる", () => {
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
      }),
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    // テーブルセルのセマンティクスを保つため button は td の内側にある
    expect(buttons[0]!.closest("td")).not.toBeNull();
  });

  test("interactive でない場合は button がない", () => {
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        today: TODAY,
      }),
    );
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  test("セルクリックで onDateClick が呼ばれる", () => {
    const onClick = vi.fn();
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        onDateClick: onClick,
      }),
    );
    const cells = screen.getAllByRole("button");
    fireEvent.click(cells[0]!);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]![0]).toBeInstanceOf(Date);
  });

  test("セルホバーで onDateHover が呼ばれる", () => {
    const onHover = vi.fn();
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        onDateHover: onHover,
      }),
    );
    const cells = screen.getAllByRole("button");
    fireEvent.mouseEnter(cells[0]!);
    expect(onHover).toHaveBeenCalledTimes(1);
  });

  test("Enter キーで onDateClick が呼ばれる", () => {
    const onClick = vi.fn();
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        onDateClick: onClick,
      }),
    );
    const cells = screen.getAllByRole("button");
    cells[0]!.focus();
    // 実ブラウザではフォーカス中の button への Enter は click を発火する。
    // jsdom はこの既定動作を実装していないため、keyDown 後の click で再現する。
    fireEvent.keyDown(cells[0]!, { key: "Enter" });
    fireEvent.click(cells[0]!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("interactive モードで calendar-interactive クラスがつく", () => {
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
      }),
    );
    expect(container.firstChild).toHaveClass("calendar-interactive");
  });

  test("responsive 有効で calendar-responsive クラスがつく", () => {
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        responsive: true,
        today: TODAY,
      }),
    );
    expect(container.firstChild).toHaveClass("calendar-responsive");
  });

  test("responsive 未指定では calendar-responsive クラスがつかない", () => {
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        today: TODAY,
      }),
    );
    expect(container.firstChild).not.toHaveClass("calendar-responsive");
  });

  test("hoveredDate のセルに is-hovered クラスがつく", () => {
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        hoveredDate: new Date(2026, 8, 10),
      }),
    );
    const hovered = screen.getByRole("button", { name: /September 10, 2026/ });
    expect(hovered.closest("td")).toHaveClass("is-hovered");
    const other = screen.getByRole("button", { name: /September 11, 2026/ });
    expect(other.closest("td")).not.toHaveClass("is-hovered");
  });

  test("rangePreview 内のセルに is-in-range-preview クラスがつく", () => {
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        rangePreview: {
          from: new Date(2026, 8, 5),
          to: new Date(2026, 8, 10),
        },
      }),
    );
    const inPreview = screen.getByRole("button", {
      name: /September 7, 2026/,
    });
    expect(inPreview.closest("td")).toHaveClass("is-in-range-preview");
    const outPreview = screen.getByRole("button", {
      name: /September 12, 2026/,
    });
    expect(outPreview.closest("td")).not.toHaveClass("is-in-range-preview");
  });

  test("マウス離脱で onDateLeave が呼ばれる", () => {
    const onLeave = vi.fn();
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        onDateLeave: onLeave,
      }),
    );
    fireEvent.mouseLeave(container.firstChild!);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  test("非インタラクティブでは onDateLeave は呼ばれない", () => {
    const onLeave = vi.fn();
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        onDateLeave: onLeave,
      }),
    );
    fireEvent.mouseLeave(container.firstChild!);
    expect(onLeave).not.toHaveBeenCalled();
  });
});

describe("Calendar isDateDisabled", () => {
  const disabled15 = (d: Date) => d.getDate() === 15;

  test("disabled セルに is-disabled クラスがつく", () => {
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        today: TODAY,
        isDateDisabled: disabled15,
      }),
    );
    const disabledCells = container.querySelectorAll("td.is-disabled");
    expect(disabledCells).toHaveLength(1);
    expect(disabledCells[0]!.textContent).toBe("15");
  });

  test("disabled セルに aria-disabled がつく", () => {
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        today: TODAY,
        isDateDisabled: disabled15,
      }),
    );
    expect(container.querySelector('td[aria-disabled="true"]')).not.toBeNull();
  });

  test("interactive 時は disabled セルの button が disabled になる", () => {
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        isDateDisabled: disabled15,
      }),
    );
    const btn = [
      ...container.querySelectorAll<HTMLButtonElement>("button"),
    ].find((b) => b.textContent === "15");
    expect(btn).toBeDefined();
    expect(btn!.disabled).toBe(true);
    expect(btn!.closest("td")!.classList.contains("is-disabled")).toBe(true);
  });

  test("disabled セルのクリックで onDateClick は呼ばれない", () => {
    const onClick = vi.fn();
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        isDateDisabled: disabled15,
        onDateClick: onClick,
      }),
    );
    const btn = [
      ...container.querySelectorAll<HTMLButtonElement>("button"),
    ].find((b) => b.textContent === "15")!;
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("disabled セルへのホバーで onDateHover は呼ばれない", () => {
    const onHover = vi.fn();
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        isDateDisabled: disabled15,
        onDateHover: onHover,
      }),
    );
    const btn = [
      ...container.querySelectorAll<HTMLButtonElement>("button"),
    ].find((b) => b.textContent === "15")!;
    fireEvent.mouseEnter(btn);
    expect(onHover).not.toHaveBeenCalled();
  });
});

// ─── useCalendarState options 更新 ─────────────────────

describe("useCalendarState options 更新", () => {
  test("highlight の変更が状態に反映される", () => {
    function Capture({ highlight }: { highlight?: Date }) {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        highlight,
      });
      return createElement(
        "span",
        { "data-testid": "highlight" },
        state.options.highlight?.toISOString() ?? "none",
      );
    }
    const first = new Date(2026, 8, 10);
    const { rerender } = render(createElement(Capture, { highlight: first }));
    expect(screen.getByTestId("highlight").textContent).toBe(
      first.toISOString(),
    );

    const next = new Date(2026, 8, 11);
    rerender(createElement(Capture, { highlight: next }));
    expect(screen.getByTestId("highlight").textContent).toBe(
      next.toISOString(),
    );
  });

  test("同じ値の options で再レンダリングしても状態は再構築されない", () => {
    const observed: unknown[] = [];
    let highlight: Date | undefined = new Date(2026, 8, 10);
    function Capture() {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        highlight,
      });
      observed.push(state);
      return null;
    }
    const { rerender } = render(createElement(Capture));
    // 新しいインスタンスだが同じ時刻 → 再構築されず state 参照が維持される
    highlight = new Date(2026, 8, 10);
    rerender(createElement(Capture));
    expect(observed[1]).toBe(observed[0]);
  });

  test("値が変わると状態が再構築される", () => {
    const observed: unknown[] = [];
    let highlight: Date | undefined = new Date(2026, 8, 10);
    function Capture() {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        highlight,
      });
      observed.push(state);
      return null;
    }
    const { rerender } = render(createElement(Capture));
    highlight = new Date(2026, 8, 11);
    rerender(createElement(Capture));
    // effect 後の再レンダリングで新 state が生成される
    expect(observed.at(-1)).not.toBe(observed[0]);
  });

  test("range の変更が状態に反映される", () => {
    function Capture({ range }: { range?: { from: Date; to: Date } }) {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        range,
      });
      const count = state.monthData.cells
        .flat()
        .filter((c) => c.isInRange).length;
      return createElement("span", { "data-testid": "count" }, String(count));
    }
    const { rerender } = render(
      createElement(Capture, {
        range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) },
      }),
    );
    expect(screen.getByTestId("count").textContent).toBe("15");

    rerender(
      createElement(Capture, {
        range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 10) },
      }),
    );
    expect(screen.getByTestId("count").textContent).toBe("10");
  });

  test("today の変更が状態に反映される", () => {
    function Capture({ today }: { today: Date }) {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 9,
        today,
      });
      const todayCell = state.monthData.cells.flat().find((c) => c.isToday);
      return createElement(
        "span",
        { "data-testid": "today" },
        String(todayCell?.day ?? "none"),
      );
    }
    const { rerender } = render(createElement(Capture, { today: TODAY }));
    expect(screen.getByTestId("today").textContent).toBe("15");

    rerender(createElement(Capture, { today: new Date(2026, 8, 20) }));
    expect(screen.getByTestId("today").textContent).toBe("20");
  });

  test("ナビゲーション後に options を変更しても表示月が初期値に戻らない", () => {
    let highlight: Date | undefined;
    function Capture() {
      const { state, goNext } = useCalendarState({
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        highlight,
      });
      const title = state.monthData.title;
      return createElement(
        "button",
        { type: "button", onClick: goNext, "data-testid": "title" },
        String(title),
      );
    }
    const { rerender } = render(createElement(Capture));
    fireEvent.click(screen.getByTestId("title"));
    expect(screen.getByTestId("title").textContent).toBe("October 2026");

    // highlight の変更は表示月を September に引き戻さない
    highlight = new Date(2026, 8, 10);
    rerender(createElement(Capture));
    expect(screen.getByTestId("title").textContent).toBe("October 2026");
  });

  test("initialMonth が範囲外でも options 更新後に state と monthData が乖離しない", () => {
    function Capture() {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 13,
        today: TODAY,
      });
      return createElement(
        "span",
        { "data-testid": "ym" },
        `${state.year}-${state.month} ${state.monthData.title}`,
      );
    }
    const { rerender } = render(createElement(Capture));
    // 初期表示は正規化後の 2027-01
    expect(screen.getByTestId("ym").textContent).toContain(
      "2027-1 January 2027",
    );

    // 別オプション（locale）の変更で再構築されても正規化済みの位置を維持する
    function CaptureJa() {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 13,
        today: TODAY,
        locale: "ja",
      });
      return createElement(
        "span",
        { "data-testid": "ym" },
        `${state.year}-${state.month} ${state.monthData.title}`,
      );
    }
    rerender(createElement(CaptureJa));
    expect(screen.getByTestId("ym").textContent).toContain("2027-1");
    expect(screen.getByTestId("ym").textContent).toContain("1月 2027");
    expect(screen.getByTestId("ym").textContent).not.toContain("2026-13");
  });
});

// ─── Calendar の堅牢性 ─────────────────────────────────

describe("Calendar の入力検証・正規化", () => {
  test("逆転した range は RangeError", () => {
    expect(() =>
      render(
        createElement(Calendar, {
          year: 2026,
          month: 9,
          range: { from: new Date(2026, 8, 15), to: new Date(2026, 8, 1) },
        }),
      ),
    ).toThrow(RangeError);
  });

  test("範囲外の month は RangeError（fail fast）", () => {
    expect(() =>
      render(createElement(Calendar, { year: 2026, month: 0 })),
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
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        size: "xl" as never,
      }),
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).not.toContain("calendar-size");
    expect(root.querySelectorAll("td")).not.toHaveLength(0);
  });
});

// ─── useCalendarState ナビゲーション API ────────────────

function NavigationHarness({
  onMonthChange,
}: {
  onMonthChange?: (year: number, month: number) => void;
}) {
  const { state, goNext, goToDate, goToMonth, navigateYear } = useCalendarState(
    {
      initialYear: 2026,
      initialMonth: 9,
      today: TODAY,
      onMonthChange,
    },
  );

  return createElement(
    "div",
    null,
    createElement("span", { "data-testid": "title" }, state.monthData.title),
    createElement(
      "button",
      {
        type: "button",
        "data-testid": "next-year",
        onClick: () => navigateYear("next"),
      },
      "NextYear",
    ),
    createElement(
      "button",
      {
        type: "button",
        "data-testid": "prev-year",
        onClick: () => navigateYear("prev"),
      },
      "PrevYear",
    ),
    createElement(
      "button",
      {
        type: "button",
        "data-testid": "goto",
        onClick: () => goToMonth(2027, 3),
      },
      "GoTo",
    ),
    createElement(
      "button",
      {
        type: "button",
        "data-testid": "goto-same",
        onClick: () => goToMonth(2026, 9),
      },
      "GoToSame",
    ),
    createElement(
      "button",
      {
        type: "button",
        "data-testid": "goto-date",
        onClick: () => goToDate(new Date(2025, 0, 20)),
      },
      "GoToDate",
    ),
    createElement(
      "button",
      { type: "button", "data-testid": "next", onClick: goNext },
      "Next",
    ),
  );
}

describe("useCalendarState ナビゲーション API", () => {
  test("navigateYear で翌年/前年へ移動できる", () => {
    render(createElement(NavigationHarness));
    fireEvent.click(screen.getByTestId("next-year"));
    expect(screen.getByTestId("title").textContent).toBe("September 2027");
    fireEvent.click(screen.getByTestId("prev-year"));
    expect(screen.getByTestId("title").textContent).toBe("September 2026");
  });

  test("goToMonth で指定年月へジャンプできる", () => {
    render(createElement(NavigationHarness));
    fireEvent.click(screen.getByTestId("goto"));
    expect(screen.getByTestId("title").textContent).toBe("March 2027");
  });

  test("goToDate で指定日付の月へジャンプできる", () => {
    render(createElement(NavigationHarness));
    fireEvent.click(screen.getByTestId("goto-date"));
    expect(screen.getByTestId("title").textContent).toBe("January 2025");
  });

  test("onMonthChange は月移動時に呼ばれる（初回レンダリングでは呼ばれない）", () => {
    const onChange = vi.fn();
    render(createElement(NavigationHarness, { onMonthChange: onChange }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("next"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(2026, 10);
  });

  test("onMonthChange は同じ月への goToMonth では呼ばれない", () => {
    const onChange = vi.fn();
    render(createElement(NavigationHarness, { onMonthChange: onChange }));
    fireEvent.click(screen.getByTestId("goto-same"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ─── Calendar ARIA ──────────────────────────────────────

describe("Calendar ARIA", () => {
  test("table に role=grid と aria-label がつく（interactive 時）", () => {
    render(
      createElement(Calendar, { year: 2026, month: 9, interactive: true }),
    );
    const grid = screen.getByRole("grid");
    expect(grid).toHaveAttribute("aria-label", "September 2026");
  });

  test("非 interactive ではネイティブ table セマンティクスのまま", () => {
    const { container } = render(
      createElement(Calendar, { year: 2026, month: 9 }),
    );
    expect(container.querySelector("table")).not.toHaveAttribute("role");
  });

  test("今日のセルに aria-current=date がつく", () => {
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        today: TODAY,
        interactive: true,
      }),
    );
    const btn = screen.getByRole("button", { name: /September 15, 2026/ });
    expect(btn.closest("td")).toHaveAttribute("aria-current", "date");
  });

  test("selectedDate のセルに aria-selected がつく", () => {
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        selectedDate: new Date(2026, 8, 10),
      }),
    );
    const btn = screen.getByRole("button", { name: /September 10, 2026/ });
    expect(btn.closest("td")).toHaveAttribute("aria-selected", "true");
  });

  test("cursorDate のセルだけ tabIndex=0 になる（roving tabindex）", () => {
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        cursorDate: new Date(2026, 8, 15),
      }),
    );
    const cursorBtn = screen.getByRole("button", {
      name: /September 15, 2026/,
    });
    const otherBtn = screen.getByRole("button", { name: /September 1, 2026/ });
    expect(cursorBtn).toHaveAttribute("tabindex", "0");
    expect(otherBtn).toHaveAttribute("tabindex", "-1");
  });
});

// ─── Calendar renderCell ────────────────────────────────

describe("Calendar renderCell", () => {
  test("非インタラクティブでもセル内容をカスタムできる", () => {
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        renderCell: (day) => createElement("span", null, `D${day}`),
      }),
    );
    expect(screen.getByText("D1")).toBeInTheDocument();
  });

  test("インタラクティブ時は button の子として描画される", () => {
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        renderCell: (day) => createElement("span", null, `D${day}`),
      }),
    );
    const btn = screen.getByRole("button", { name: /September 1, 2026/ });
    expect(btn).toHaveTextContent("D1");
  });

  test("renderCell の第4引数に cellData のデータが渡る", () => {
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        cellData: (date) => (date.getDate() === 15 ? "holiday" : undefined),
        renderCell: (_day, _date, _state, data) =>
          createElement("span", null, String(data ?? "none")),
      }),
    );
    expect(screen.getByText("holiday")).toBeInTheDocument();
    expect(screen.getAllByText("none").length).toBeGreaterThan(0);
  });

  test("cellData 未指定時は renderCell の第4引数が undefined", () => {
    const renderer = vi.fn((_day, _date, _state, _data) => null);
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        renderCell: renderer,
      }),
    );
    const called = renderer.mock.calls.find((args) => {
      const day = args[0] as number;
      return day === 1;
    })!;
    expect(called[3]).toBeUndefined();
  });
});

// ─── Calendar cellData / onDateClick ─────────────────────

describe("Calendar cellData / onDateClick", () => {
  test("onDateClick の第2引数に cellData のデータが渡る", () => {
    const onClick = vi.fn();
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        cellData: (date) => (date.getDate() === 10 ? "meeting" : undefined),
        onDateClick: onClick,
      }),
    );
    const withData = screen.getByRole("button", {
      name: /September 10, 2026/,
    });
    fireEvent.click(withData);
    expect(onClick.mock.calls[0]![0]).toBeInstanceOf(Date);
    expect(onClick.mock.calls[0]![1]).toBe("meeting");

    const withoutData = screen.getByRole("button", {
      name: /September 11, 2026/,
    });
    fireEvent.click(withoutData);
    expect(onClick.mock.calls[1]![0]).toBeInstanceOf(Date);
    expect(onClick.mock.calls[1]![1]).toBeUndefined();
  });

  test("cellData 未指定時は onDateClick の第2引数が undefined", () => {
    const onClick = vi.fn();
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        onDateClick: onClick,
      }),
    );
    const btn = screen.getByRole("button", { name: /September 10, 2026/ });
    fireEvent.click(btn);
    expect(onClick.mock.calls[0]![1]).toBeUndefined();
  });
});

// ─── InteractiveCalendar ────────────────────────────────

describe("InteractiveCalendar", () => {
  test("現在の月が表示される", () => {
    render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
      }),
    );
    expect(screen.getByText("September 2026")).toBeInTheDocument();
    // カーソルは今日（15日）に置かれる
    const today = screen.getByRole("button", { name: /September 15, 2026/ });
    expect(today).toHaveAttribute("tabindex", "0");
  });

  test("矢印キーでカーソルが移動しフォーカスが追従する", () => {
    render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
      }),
    );
    const before = screen.getByRole("button", { name: /September 15, 2026/ });
    before.focus();
    fireEvent.keyDown(before, { key: "ArrowRight" });
    const after = screen.getByRole("button", { name: /September 16, 2026/ });
    expect(after).toHaveAttribute("tabindex", "0");
    expect(after).toHaveFocus();
    expect(before).toHaveAttribute("tabindex", "-1");
  });

  test("PageDown で翌月へ移動し onMonthChange が呼ばれる", () => {
    const onChange = vi.fn();
    render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        onMonthChange: onChange,
      }),
    );
    const btn = screen.getByRole("button", { name: /September 15, 2026/ });
    btn.focus();
    fireEvent.keyDown(btn, { key: "PageDown" });
    expect(screen.getByText("October 2026")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(2026, 10);
  });

  test("セルクリックで onDateClick が呼ばれる", () => {
    const onClick = vi.fn();
    render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        onDateClick: onClick,
      }),
    );
    const btn = screen.getByRole("button", { name: /September 10, 2026/ });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]![0]).toBeInstanceOf(Date);
  });

  test("renderCell を InteractiveCalendar 経由で渡せる", () => {
    render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        renderCell: (day) => createElement("span", null, `D${day}`),
      }),
    );
    expect(screen.getByText("D1")).toBeInTheDocument();
  });

  test("responsive が InteractiveCalendar 経由で反映される", () => {
    const { container } = render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        responsive: true,
      }),
    );
    expect(container.querySelector(".calendar")).toHaveClass(
      "calendar-responsive",
    );
  });

  test("セルクリックで onDateClick に cellData のデータが渡る", () => {
    const onClick = vi.fn();
    render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        cellData: (date) => (date.getDate() === 10 ? "meeting" : undefined),
        onDateClick: onClick,
      }),
    );
    const btn = screen.getByRole("button", { name: /September 10, 2026/ });
    fireEvent.click(btn);
    expect(onClick.mock.calls[0]![0]).toBeInstanceOf(Date);
    expect(onClick.mock.calls[0]![1]).toBe("meeting");
  });

  test("セルクリックで日付が選択されカーソルも移動する", () => {
    render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
      }),
    );
    const btn = screen.getByRole("button", { name: /September 10, 2026/ });
    fireEvent.click(btn);
    expect(btn.closest("td")).toHaveAttribute("aria-selected", "true");
    expect(btn).toHaveAttribute("tabindex", "0");
  });

  test("Enter キーでも日付が選択される（クリックと同等）", () => {
    render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
      }),
    );
    const btn = screen.getByRole("button", { name: /September 15, 2026/ });
    btn.focus();
    // 実ブラウザではフォーカス中の button への Enter は click を発火する。
    // jsdom はこの既定動作を実装していないため、keyDown 後の click で再現する。
    fireEvent.keyDown(btn, { key: "Enter" });
    fireEvent.click(btn);
    expect(btn.closest("td")).toHaveAttribute("aria-selected", "true");
  });

  test("ホバーで is-hovered クラスがつき、離脱で消える", () => {
    const { container } = render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
      }),
    );
    const btn = screen.getByRole("button", { name: /September 10, 2026/ });
    fireEvent.mouseEnter(btn);
    expect(btn.closest("td")).toHaveClass("is-hovered");
    fireEvent.mouseLeave(container.firstChild!);
    expect(btn.closest("td")).not.toHaveClass("is-hovered");
  });

  test("選択後にホバーすると範囲プレビューが表示される", () => {
    render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: /September 10, 2026/ }));
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /September 15, 2026/ }),
    );
    const mid = screen.getByRole("button", { name: /September 12, 2026/ });
    expect(mid.closest("td")).toHaveClass("is-in-range-preview");
    const out = screen.getByRole("button", { name: /September 17, 2026/ });
    expect(out.closest("td")).not.toHaveClass("is-in-range-preview");
  });

  test("選択していない状態ではホバーしてもプレビューは出ない", () => {
    render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
      }),
    );
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /September 10, 2026/ }),
    );
    const mid = screen.getByRole("button", { name: /September 12, 2026/ });
    expect(mid.closest("td")).not.toHaveClass("is-in-range-preview");
  });

  test("逆順ホバー（選択より前の日付）でもプレビュー範囲が正しく出る", () => {
    render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: /September 15, 2026/ }));
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /September 10, 2026/ }),
    );
    const mid = screen.getByRole("button", { name: /September 12, 2026/ });
    expect(mid.closest("td")).toHaveClass("is-in-range-preview");
    const out = screen.getByRole("button", { name: /September 17, 2026/ });
    expect(out.closest("td")).not.toHaveClass("is-in-range-preview");
  });

  test("isDateDisabled の日付はクリックで選択されない", () => {
    const onClick = vi.fn();
    render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        isDateDisabled: (d) => d.getDate() === 15,
        onDateClick: onClick,
      }),
    );
    const btn = screen.getByRole("button", { name: /September 15, 2026/ });
    // disabled ボタンはクリック不可
    expect((btn as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("矢印キーで disabled セルをスキップしてカーソルが移動する", () => {
    const { container } = render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        // 初期カーソルは今日(15日)。16(水) だけ disabled → 右矢印で 17(木) へ
        isDateDisabled: (d) => d.getDate() === 16,
      }),
    );
    const before = screen.getByRole("button", { name: /September 15, 2026/ });
    before.focus();
    fireEvent.keyDown(before, { key: "ArrowRight" });
    const cursorBtn = container.querySelector('[data-cursor="true"]');
    expect(cursorBtn).not.toBeNull();
    expect(cursorBtn!.getAttribute("aria-label")).toMatch(/September 17/);
  });

  test("today が disabled なら初期カーソルは最初の有効セルに置かれる", () => {
    const { container } = render(
      createElement(InteractiveCalendar, {
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        isDateDisabled: (d) => d.getDate() === 15,
      }),
    );
    const cursorBtn = container.querySelector('[data-cursor="true"]');
    expect(cursorBtn).not.toBeNull();
    expect(cursorBtn!.getAttribute("aria-label")).toMatch(/September 1/);
  });
});
