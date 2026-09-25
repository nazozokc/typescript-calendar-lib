import { describe, expect, test } from "vitest";
import { displayWidth } from "./align.ts";
import { renderMonth, renderYear } from "./render.ts";

describe("renderMonth", () => {
  test("日曜始まりのタイトル行と曜日ヘッダー", () => {
    const lines = renderMonth(2026, 9).split("\n");
    expect(lines[0]).toBe("      September 2026");
    expect(lines[1]).toBe("Sun Mon Tue Wed Thu Fri Sat");
  });

  test("月曜始まりの曜日ヘッダー", () => {
    const lines = renderMonth(2026, 9, { weekStart: "monday" }).split("\n");
    expect(lines[1]).toBe("Mon Tue Wed Thu Fri Sat Sun");
  });

  test("空セルはスペースで埋められる", () => {
    const lines = renderMonth(2026, 9).split("\n");
    expect(lines[2]).toBe("          1   2   3   4   5");
  });

  test("最後の行は空欄セルを含む", () => {
    const lines = renderMonth(2026, 9).split("\n");
    expect(lines[lines.length - 1]).toContain("30");
  });

  test("日本語ロケールの月名", () => {
    const lines = renderMonth(2026, 9, { locale: "ja" }).split("\n");
    expect(lines[0]).toBe("         9月 2026");
  });
});

describe("renderMonth - isDateDisabled", () => {
  test("color:false なら disabled セルも従来どおり描画される", () => {
    const out = renderMonth(2026, 9, {
      isDateDisabled: (d) => d.getDate() === 15,
    });
    expect(out).toContain("15");
  });

  test("color:true のとき disabled セルは dim コードで描画される", () => {
    const out = renderMonth(2026, 9, {
      color: true,
      colorScheme: "mono",
      isDateDisabled: (d) => d.getDate() === 15,
    });
    // ANSI dim (90) で 15 が描画される
    expect(out).toContain("\u001b[90m 15\u001b[0m");
  });

  test("default スキームでも dim フォールバックが使われる", () => {
    const out = renderMonth(2026, 9, {
      color: true,
      isDateDisabled: (d) => d.getDate() === 15,
    });
    expect(out).toContain("\u001b[90m 15\u001b[0m");
  });

  test("disabled でも highlight が優先される", () => {
    const out = renderMonth(2026, 9, {
      color: true,
      colorScheme: "mono",
      highlight: new Date(2026, 8, 15),
      highlightStyle: "reverse",
      isDateDisabled: (d) => d.getDate() === 15,
    });
    // 反転 (7) が使われ dim ではない
    expect(out).toContain("\u001b[7m 15\u001b[0m");
  });

  test("disabled セルも renderCell に委譲される", () => {
    const out = renderMonth(2026, 9, {
      isDateDisabled: (d) => d.getDate() === 15,
      renderCell: (day, _date, state) =>
        state.isDisabled ? `x${day}` : String(day),
    });
    expect(out).toContain("x15");
  });
});

describe("renderMonth - highlight", () => {
  test("bracketスタイルは日付を角括囲みにする", () => {
    const lines = renderMonth(2026, 9, {
      highlight: new Date(2026, 8, 8),
    }).split("\n");
    expect(lines[3]).toContain("[8]");
  });

  test("reverseスタイルとcolor:trueで反転色を使う", () => {
    const out = renderMonth(2026, 9, {
      highlight: new Date(2026, 8, 8),
      highlightStyle: "reverse",
      color: true,
    });
    expect(out).toContain("\u001b[7m  8\u001b[0m");
    expect(out).not.toContain("[8]");
  });

  test("color:falseではANSIエスケープを含まない", () => {
    const out = renderMonth(2026, 9, {
      highlight: new Date(2026, 8, 8),
      color: false,
    });
    expect(out).not.toContain("\u001b[");
  });
});

describe("renderMonth - range color", () => {
  test("範囲内の日付をcolor:trueで黄色にする", () => {
    const out = renderMonth(2026, 9, {
      range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) },
      color: true,
    });
    expect(out).toContain("\u001b[33m  1\u001b[0m");
    expect(out).toContain("\u001b[33m 15\u001b[0m");
    expect(out).not.toContain("\u001b[33m 16\u001b[0m");
  });

  test("範囲とハイライトが重なる場合、ハイライトが優先される", () => {
    const out = renderMonth(2026, 9, {
      highlight: new Date(2026, 8, 8),
      highlightStyle: "reverse",
      range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) },
      color: true,
    });
    expect(out).toContain("\u001b[7m  8\u001b[0m");
  });
});

describe("renderMonth - holiday color", () => {
  test("祝日・振替休日にcolor:trueで着色する", () => {
    const out = renderMonth(2026, 5, { color: true });
    // 5/3 憲法記念日・5/4 みどりの日・5/5 こどもの日・5/6 振替休日
    expect(out).toContain("\u001b[31m  3\u001b[0m");
    expect(out).toContain("\u001b[31m  6\u001b[0m");
    // 5/8 は平日なので weekend 系の色（このスキームでは未設定）であって祝日色ではない
    expect(out).not.toContain("\u001b[31m  8\u001b[0m");
  });

  test("color:falseでは祝日も着色しない", () => {
    const out = renderMonth(2026, 5, { color: false });
    expect(out).not.toContain("\u001b[");
  });

  test("holidayLocale を指定するとそのロケールで判定する", () => {
    const out = renderMonth(2026, 5, { color: true, holidayLocale: "en" });
    expect(out).not.toContain("\u001b[31m  6\u001b[0m");
  });
});

describe("renderMonth - themes", () => {
  const base = { today: new Date(2026, 8, 1) };

  test("modernテーマは枠線と縦区切りを使う", () => {
    const out = renderMonth(2026, 9, { theme: "modern", ...base });
    const lines = out.split("\n");
    expect(lines[0]).toBe("┌───────────────────────────┐");
    expect(lines[1]).toBe("│      September 2026       │");
    expect(lines[2]).toBe("├───┬───┬───┬───┬───┬───┬───┤");
    expect(lines[3]).toBe("│Sun│Mon│Tue│Wed│Thu│Fri│Sat│");
    expect(lines[lines.length - 1]).toBe("└───┴───┴───┴───┴───┴───┴───┘");
  });

  test("modernテーマで週番号列を表示できる", () => {
    const out = renderMonth(2026, 9, {
      theme: "modern",
      showWeekNumbers: true,
      weekStart: "monday",
      ...base,
    });
    const lines = out.split("\n");
    // 上枠は連続線（既存仕様）。innerWidth = 7*3 + 6 + (2+1) = 30
    expect(lines[0]).toBe(`┌${"─".repeat(30)}┐`);
    // 区切り行は週番号列（幅2）とセル列（幅3）が別セグメントになる
    expect(lines[2]).toBe("├──┬───┬───┬───┬───┬───┬───┬───┤");
    expect(lines[3]).toBe("│  │Mon│Tue│Wed│Thu│Fri│Sat│Sun│");
    expect(lines[5]).toContain("│36│");
    expect(lines[lines.length - 1]).toBe("└──┴───┴───┴───┴───┴───┴───┴───┘");
  });

  test("modernテーマでも日付とハイライトは描画される", () => {
    const out = renderMonth(2026, 9, {
      theme: "modern",
      highlight: new Date(2026, 8, 8),
      ...base,
    });
    expect(out).toContain("│ [8]│");
    expect(out).toContain("│  30│");
  });

  test("bracketスタイルの2桁日付はセル幅に収まる", () => {
    const out = renderMonth(2026, 9, {
      theme: "modern",
      highlight: new Date(2026, 8, 10),
      ...base,
    });
    expect(out).toContain("│[10]│");
    expect(out).toContain("│  30│");
  });

  test("modernテーマとカラースキームで枠と曜日が着色される", () => {
    const out = renderMonth(2026, 9, {
      theme: "modern",
      colorScheme: "ocean",
      color: true,
      ...base,
    });
    expect(out).toContain("\u001b[36m┌───────────────────────────┐\u001b[0m");
    expect(out).toContain("\u001b[36m│Sun│Mon│Tue│Wed│Thu│Fri│Sat│\u001b[0m");
  });

  test("カスタムテーマオブジェクトを受け付ける", () => {
    const out = renderMonth(2026, 9, {
      theme: {
        cellWidth: 3,
        separator: "|",
        frame: null,
      },
      ...base,
    });
    expect(out).toContain("Sun|Mon|Tue|Wed|Thu|Fri|Sat");
  });

  test("不明なテーマ名はdefaultにフォールバックする", () => {
    // @ts-expect-error 不明なテーマ名
    const out = renderMonth(2026, 9, { theme: "unknown", ...base });
    expect(out.split("\n")[0]).toBe("      September 2026");
  });
});

describe("renderMonth - color schemes", () => {
  const base = { today: new Date(2026, 8, 1), color: true };

  test("defaultスキームは従来どおりの着色のみ", () => {
    const out = renderMonth(2026, 9, {
      range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 5) },
      ...base,
    });
    expect(out).toContain("\u001b[33m  1\u001b[0m");
    // 曜日ヘッダーや通常の日付には着色しない
    expect(out).not.toContain("\u001b[36m");
  });

  test("oceanスキームは曜日・今日・土日を着色する", () => {
    const out = renderMonth(2026, 9, {
      colorScheme: "ocean",
      ...base,
      today: new Date(2026, 8, 11),
    });
    // 曜日ヘッダー
    expect(out).toContain("\u001b[36mSun\u001b[0m");
    // 今日
    expect(out).toContain("\u001b[36m 11\u001b[0m");
    // 土日（9/5 は土曜、9/6 は日曜）
    expect(out).toContain("\u001b[34m  5\u001b[0m");
    expect(out).toContain("\u001b[34m  6\u001b[0m");
  });

  test("カスタムパレットを受け付ける", () => {
    const out = renderMonth(2026, 9, {
      colorScheme: { range: 95 },
      range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 5) },
      ...base,
    });
    expect(out).toContain("\u001b[95m  1\u001b[0m");
  });

  test("不明なカラースキーム名はdefaultにフォールバックする", () => {
    // @ts-expect-error 不明なカラースキーム名
    const out = renderMonth(2026, 9, { colorScheme: "unknown", ...base });
    expect(out.split("\n")[1]).toBe("Sun Mon Tue Wed Thu Fri Sat");
  });
});

describe("renderMonth - セル幅とロケール", () => {
  test("fr のように曜日ヘッダーが3文字を超えるロケールでも列が揃う", () => {
    const lines = renderMonth(2026, 9, { locale: "fr" }).split("\n");
    const widths = lines.map((l) => displayWidth(l));
    // ヘッダー行（dim. lun. ...）と全グリッド行が同じ幅になる（タイトルは中央揃えで短い）
    const gridWidth = widths[2]!;
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBe(gridWidth);
    }
  });

  test("fr + modern テーマでは枠内に曜日ヘッダーが収まる", () => {
    const lines = renderMonth(2026, 9, {
      locale: "fr",
      theme: "modern",
      today: new Date(2026, 8, 1),
    }).split("\n");
    const widths = lines.map((l) => displayWidth(l));
    expect(widths[1]!).toBe(widths[0]!); // タイトル行 = 上枠
    expect(widths[3]!).toBe(widths[0]!); // 曜日ヘッダー = 上枠
    expect(widths[5]!).toBe(widths[0]!); // 日付行 = 上枠
  });

  test("カスタムテーマの cellWidth が反映される", () => {
    const out = renderMonth(2026, 9, {
      theme: {
        cellWidth: 5,
        separator: " ",
        frame: null,
      },
      today: new Date(2026, 8, 1),
    });
    const lines = out.split("\n");
    // 曜日ヘッダー行は右詰め5幅×7列 + 区切り6 = 41
    expect(lines[1]).toBe("  Sun   Mon   Tue   Wed   Thu   Fri   Sat");
    expect(displayWidth(lines[1]!)).toBe(41);
    // 日付行も同じ幅に揃う
    expect(displayWidth(lines[2]!)).toBe(41);
  });
});

describe("renderYear", () => {
  test("12ヶ月全てのタイトルを含む", () => {
    const out = renderYear(2026);
    expect(out).toContain("January 2026");
    expect(out).toContain("February 2026");
    expect(out).toContain("March 2026");
    expect(out).toContain("April 2026");
    expect(out).toContain("May 2026");
    expect(out).toContain("June 2026");
    expect(out).toContain("July 2026");
    expect(out).toContain("August 2026");
    expect(out).toContain("September 2026");
    expect(out).toContain("October 2026");
    expect(out).toContain("November 2026");
    expect(out).toContain("December 2026");
  });

  test("4列×3行構成", () => {
    const out = renderYear(2026);
    const firstLine = out.split("\n")[0];
    expect(firstLine).toContain("January 2026");
    expect(firstLine).toContain("February 2026");
    expect(firstLine).toContain("March 2026");
    expect(firstLine).toContain("April 2026");
  });

  test("modernテーマで描画できる", () => {
    const out = renderYear(2026, {
      theme: "modern",
      today: new Date(2026, 0, 1),
    });
    expect(out).toContain("┌");
    expect(out).toContain("January 2026");
  });

  test("ハイライトを反映する", () => {
    const out = renderYear(2026, {
      highlight: new Date(2026, 0, 15),
      highlightStyle: "bracket",
    });
    expect(out).toContain("[15]");
  });

  test("カラースキームを反映する", () => {
    const out = renderYear(2026, {
      colorScheme: "ocean",
      color: true,
      today: new Date(2026, 0, 1),
    });
    expect(out).toContain("\u001b[36m");
  });

  test("日本語ロケールを反映する", () => {
    const out = renderYear(2026, { locale: "ja" });
    expect(out).toContain("1月 2026");
    expect(out).toContain("12月 2026");
  });
});

// ─── renderMonth cellData / renderCell ───────────────────

describe("renderMonth - cellData / renderCell", () => {
  test("cellData と renderCell でセル内容をカスタムできる", () => {
    const out = renderMonth(2026, 9, {
      cellData: (date) => (date.getDate() === 15 ? "★" : undefined),
      renderCell: (day, _date, _state, data) =>
        data !== undefined ? `${data}${day}` : String(day),
    });
    expect(out).toContain("★15");
    expect(out).not.toContain("[15]");
  });

  test("renderCell に day/date/state/data が渡る", () => {
    const seen: Array<
      [number, Date, { isWeekend: boolean; isToday: boolean }, unknown]
    > = [];
    renderMonth(2026, 9, {
      today: new Date(2026, 8, 8),
      cellData: (date) => (date.getDate() === 15 ? "meeting" : undefined),
      renderCell: (day, date, state, data) => {
        if (day === 15) seen.push([day, date, state, data]);
        return String(day);
      },
    });
    expect(seen).toHaveLength(1);
    const [day, date, state, data] = seen[0]!;
    expect(day).toBe(15);
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2026);
    expect(state.isWeekend).toBe(false);
    expect(state.isToday).toBe(false);
    expect(data).toBe("meeting");
  });

  test("cellData 未指定時は renderCell の data が undefined", () => {
    const seen: unknown[] = [];
    renderMonth(2026, 9, {
      renderCell: (day, _date, _state, data) => {
        seen.push(data);
        return String(day);
      },
    });
    expect(seen).not.toHaveLength(0);
    expect(seen.every((d) => d === undefined)).toBe(true);
  });
});
