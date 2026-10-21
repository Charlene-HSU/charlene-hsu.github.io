import { describe, expect, it } from "vitest";
import { site } from "@/lib/content";
import { firstParagraph, getShortcuts, isRecent, parseContentDate } from "@/lib/shortcuts";

describe("home shortcuts", () => {
  const now = new Date(Date.UTC(2026, 9, 22));

  it("parses YYYY-MM-DD and YYYY-MM dates", () => {
    expect(parseContentDate("2026-10-21")).toBe(Date.UTC(2026, 9, 21));
    expect(parseContentDate("2026-10")).toBe(Date.UTC(2026, 9, 1));
  });

  it("treats dates within the window as recent", () => {
    expect(isRecent("2026-10-22", now, 30)).toBe(true);
    expect(isRecent("2026-09-22", now, 30)).toBe(true);
    expect(isRecent("2026-09-21", now, 30)).toBe(false);
    expect(isRecent("2026-12-01", now, 30)).toBe(true);
  });

  it("keeps pinned items first, respects the limit and hides old unpinned items", () => {
    const farFuture = new Date(Date.UTC(2100, 0, 1));
    for (const lang of ["en", "zh-TW"] as const) {
      const items = getShortcuts(lang, farFuture);
      expect(items.length).toBeLessThanOrEqual(site.shortcuts.limit);
      // Nothing is recent in 2100, so only pinned items remain.
      expect(items.every((item) => item.pinned)).toBe(true);
    }
  });
});

describe("about shortcut text", () => {
  it("takes the first real paragraph as plain text", () => {
    const md =
      "# Title\n\n- list\n\nHi! I build **fast** [sites](https://example.com) with `code`.\n\nSecond.";
    expect(firstParagraph(md)).toBe("Hi! I build fast sites with code.");
    expect(firstParagraph("")).toBe("");
  });
});
