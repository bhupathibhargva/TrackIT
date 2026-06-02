import { describe, test, expect } from "vitest";
import { WEEK, TODAY, uid } from "./constants.js";
import { expandRecurring, exportICS } from "./utils.js";

describe("WEEK", () => {
  // Locked against Finding A — must hold regardless of the machine's timezone.
  test("is May 25–31, 2026 in order", () => {
    expect(WEEK).toEqual([
      "2026-05-25", "2026-05-26", "2026-05-27", "2026-05-28",
      "2026-05-29", "2026-05-30", "2026-05-31",
    ]);
  });
  test("TODAY is the first day of the week", () => {
    expect(TODAY).toBe("2026-05-25");
  });
});

describe("uid", () => {
  test("returns a non-empty string", () => {
    expect(typeof uid()).toBe("string");
    expect(uid().length).toBeGreaterThan(0);
  });
  test("no collisions across 10k generations", () => {
    const seen = new Set();
    for (let i = 0; i < 10000; i++) seen.add(uid());
    expect(seen.size).toBe(10000);
  });
});

describe("expandRecurring", () => {
  const week = ["2026-05-25", "2026-05-26", "2026-05-27"];

  test("non-recurring tasks pass through unchanged", () => {
    const t = { id: "a", title: "One-off", recurrence: null, done: false };
    expect(expandRecurring([t], week)).toEqual([t]);
  });

  test("daily recurrence yields one instance per day", () => {
    const out = expandRecurring(
      [{ id: "d", recurrence: "daily", completedDates: ["2026-05-26"] }],
      week
    );
    expect(out).toHaveLength(3);
    expect(out.map(t => t.scheduledDate)).toEqual(week);
    // completedDates reflected onto the matching instance
    expect(out.find(t => t.scheduledDate === "2026-05-26").done).toBe(true);
    expect(out.find(t => t.scheduledDate === "2026-05-25").done).toBe(false);
  });

  test("weekly recurrence only lands on the original weekday", () => {
    // 2026-05-25 is a Monday; only that weekday in the window should match.
    const out = expandRecurring(
      [{ id: "w", recurrence: "weekly", scheduledDate: "2026-05-25", completedDates: [] }],
      week
    );
    expect(out).toHaveLength(1);
    expect(out[0].scheduledDate).toBe("2026-05-25");
  });

  test("done recurring tasks are not expanded", () => {
    const t = { id: "x", recurrence: "daily", done: true };
    expect(expandRecurring([t], week)).toEqual([t]);
  });
});

describe("exportICS escaping (Finding B)", () => {
  // exportICS triggers a DOM download; stub the browser globals (no jsdom needed)
  // and capture the Blob text instead of clicking.
  function capture(tasks) {
    let text = "";
    const g = globalThis;
    const saved = { Blob: g.Blob, URL: g.URL, document: g.document };
    g.Blob = class { constructor(parts) { text = parts.join(""); } };
    g.URL = { createObjectURL: () => "blob:stub" };
    g.document = { createElement: () => ({ click() {} }) };
    try { exportICS(tasks); } finally {
      g.Blob = saved.Blob; g.URL = saved.URL; g.document = saved.document;
    }
    return text;
  }

  test("commas, semicolons and newlines in titles are escaped", () => {
    const ics = capture([{
      id: "1", title: "Dinner, drinks; talk\nmore", assignee: "Both",
      category: "date", scheduledDate: "2026-05-25", scheduledTime: "19:30",
      done: false, notes: "bring; cash, please",
    }]);
    const summary = ics.split("\r\n").find(l => l.startsWith("SUMMARY:"));
    expect(summary).toContain("Dinner\\, drinks\\; talk\\nmore");
    // No raw comma/semicolon/newline leaked into the SUMMARY line
    expect(summary).not.toMatch(/[^\\][,;]/);
    expect(ics.split("\r\n").find(l => l.startsWith("DESCRIPTION:")))
      .toContain("bring\\; cash\\, please");
  });
});
