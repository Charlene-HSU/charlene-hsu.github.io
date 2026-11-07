import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import YAML from "yaml";
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

describe("translations in YAML content", () => {
  // Every { en, zh-TW } pair in the content files, with where it was found.
  function collectPairs(value: unknown, where: string, out: [string, string, string][]) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => collectPairs(item, `${where}[${index}]`, out));
    } else if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (typeof record.en === "string" && typeof record["zh-TW"] === "string") {
        out.push([where, record.en, record["zh-TW"]]);
      }
      for (const [key, child] of Object.entries(record))
        collectPairs(child, `${where}.${key}`, out);
    }
  }

  const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

  it("uses the same {placeholders} in both languages", () => {
    const dir = path.resolve(__dirname, "../content");
    const pairs: [string, string, string][] = [];
    for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".yaml"))) {
      collectPairs(YAML.parse(fs.readFileSync(path.join(dir, file), "utf-8")), file, pairs);
    }
    expect(pairs.length).toBeGreaterThan(0);
    for (const [where, en, zh] of pairs) {
      // A placeholder missing in one language would show up as raw `{name}` text, or not at all.
      expect(placeholders(zh), `${where}: zh-TW "${zh}" vs en "${en}"`).toEqual(placeholders(en));
    }
  });
});
