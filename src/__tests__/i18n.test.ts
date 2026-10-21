import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatNumber,
  formatTemplate,
  isLang,
  mapLocaleTagToLang,
  t,
  tf,
} from "@/lib/i18n";

describe("i18n utilities", () => {
  it("validates supported language codes", () => {
    expect(isLang("en")).toBe(true);
    expect(isLang("zh-TW")).toBe(true);
    expect(isLang("zh-CN")).toBe(false);
    expect(isLang("ja")).toBe(false);
  });

  it("maps browser locale tags according to specification", () => {
    expect(mapLocaleTagToLang("zh-TW")).toBe("zh-TW");
    expect(mapLocaleTagToLang("zh-HK")).toBe("zh-TW");
    expect(mapLocaleTagToLang("zh-CN")).toBe("zh-TW");
    expect(mapLocaleTagToLang("zh")).toBe("zh-TW");
    expect(mapLocaleTagToLang("en-US")).toBe("en");
    expect(mapLocaleTagToLang("en-GB")).toBe("en");
    expect(mapLocaleTagToLang("fr-FR")).toBeNull();
  });

  it("resolves localized values and falls back when a language is missing", () => {
    expect(t("Plain string", "en")).toBe("Plain string");
    expect(t({ en: "Hello", "zh-TW": "你好" }, "en")).toBe("Hello");
    expect(t({ en: "Hello", "zh-TW": "你好" }, "zh-TW")).toBe("你好");
    expect(t({ en: "Fallback to EN" }, "zh-TW")).toBe("Fallback to EN");
  });

  it("substitutes named placeholders without hardcoded concatenation", () => {
    expect(formatTemplate("Highlights ({count})", { count: 3 })).toBe("Highlights (3)");
    expect(
      tf({ en: "{title} · {location}", "zh-TW": "{title} · {location}" }, "zh-TW", {
        title: "軟體工程師",
        location: "台灣・台北",
      }),
    ).toBe("軟體工程師 · 台灣・台北");
  });

  it("formats dates and numbers deterministically with Intl", () => {
    expect(formatDate("2026-10-21", "en")).toContain("2026");
    expect(formatDate("2025-03", "zh-TW")).toContain("2025");
    expect(formatNumber(1234, "en")).toBe("1,234");
  });
});
