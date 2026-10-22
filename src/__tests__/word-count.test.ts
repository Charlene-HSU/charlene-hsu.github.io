import { describe, expect, it } from "vitest";
import { countWords, getSiteWordCount } from "@/lib/word-count";

describe("countWords", () => {
  it("counts each Han character and each Latin word once", () => {
    expect(countWords("你好 world, it's **fine**")).toBe(5);
  });

  it("ignores code blocks and link targets", () => {
    expect(countWords("[讀我](https://example.com/a-b)\n\n```ts\nconst x = 1;\n```")).toBe(2);
  });

  it("totals the site's Markdown in each language", () => {
    expect(getSiteWordCount("en")).toBeGreaterThan(0);
    expect(getSiteWordCount("zh-TW")).toBeGreaterThan(0);
  });
});
