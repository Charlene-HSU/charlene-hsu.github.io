import { describe, expect, it } from "vitest";
import {
  assertSafeHostname,
  collectMarkdownStandaloneUrls,
  decodeHtmlEntities,
  extractOgMetadata,
  isCacheEntryFresh,
  isPrivateOrLoopbackIp,
  normalizeUrl,
} from "../../scripts/fetch-og.mjs";

describe("fetch-og script utilities", () => {
  it("normalizes https URLs and rejects non-https protocols", () => {
    expect(normalizeUrl("https://example.com/path#section")).toBe("https://example.com/path");
    expect(() => normalizeUrl("http://example.com")).toThrow();
    expect(() => normalizeUrl("javascript:alert(1)")).toThrow();
  });

  it("rejects private, loopback, and link-local IP addresses (SSRF protection)", () => {
    expect(isPrivateOrLoopbackIp("127.0.0.1")).toBe(true);
    expect(isPrivateOrLoopbackIp("10.0.0.1")).toBe(true);
    expect(isPrivateOrLoopbackIp("172.16.0.5")).toBe(true);
    expect(isPrivateOrLoopbackIp("192.168.1.1")).toBe(true);
    expect(isPrivateOrLoopbackIp("169.254.169.254")).toBe(true);
    expect(isPrivateOrLoopbackIp("::1")).toBe(true);
    expect(isPrivateOrLoopbackIp("fe80::1")).toBe(true);
    expect(isPrivateOrLoopbackIp("93.184.216.34")).toBe(false);
  });

  it("checks the IPv4 address inside IPv4-mapped IPv6 addresses", () => {
    expect(isPrivateOrLoopbackIp("::ffff:127.0.0.1")).toBe(true);
    expect(isPrivateOrLoopbackIp("::ffff:172.16.0.1")).toBe(true);
    expect(isPrivateOrLoopbackIp("::ffff:169.254.169.254")).toBe(true);
    expect(isPrivateOrLoopbackIp("::ffff:7f00:1")).toBe(true);
    expect(isPrivateOrLoopbackIp("0:0:0:0:0:ffff:a00:1")).toBe(true);
    expect(isPrivateOrLoopbackIp("::ffff:93.184.216.34")).toBe(false);
    expect(isPrivateOrLoopbackIp("::ffff:5db8:d822")).toBe(false);
  });

  it("rejects localhost and hosts resolving to private IPs", async () => {
    await expect(assertSafeHostname("localhost")).rejects.toThrow();
    await expect(
      assertSafeHostname("internal.example.com", async () => [{ address: "10.1.2.3", family: 4 }]),
    ).rejects.toThrow();
    await expect(
      assertSafeHostname("public.example.com", async () => [
        { address: "93.184.216.34", family: 4 },
      ]),
    ).resolves.toBeUndefined();
  });

  it("extracts Open Graph metadata and falls back to title/domain", () => {
    const html = `
      <!doctype html>
      <html>
        <head>
          <title>Fallback Title</title>
          <meta property="og:title" content="OG Title &amp; More" />
          <meta property="og:description" content="OG Description" />
          <meta property="og:site_name" content="Example Site" />
        </head>
      </html>
    `;
    const meta = extractOgMetadata(html, "example.com");
    expect(meta).toEqual({
      title: "OG Title & More",
      description: "OG Description",
      siteName: "Example Site",
    });
  });

  it("keeps apostrophes inside double-quoted values and the reverse", () => {
    const html = `
      <meta property="og:title" content="It's here" />
      <meta content='Say "hi"' name="description" />
    `;
    const meta = extractOgMetadata(html, "example.com");
    expect(meta.title).toBe("It's here");
    expect(meta.description).toBe('Say "hi"');
  });

  it("decodes numeric and named HTML entities exactly once", () => {
    expect(decodeHtmlEntities("Charlene&#8217;s &#x2014; Blog")).toBe(
      "Charlene\u2019s \u2014 Blog",
    );
    expect(decodeHtmlEntities("a &amp;lt; b &unknown;")).toBe("a &lt; b &unknown;");
  });

  it("reuses cache entries younger than 30 days", () => {
    const now = Date.parse("2026-10-21T00:00:00.000Z");
    const freshEntry = { fetchedAt: "2026-10-10T00:00:00.000Z" };
    const staleEntry = { fetchedAt: "2026-08-01T00:00:00.000Z" };

    expect(isCacheEntryFresh(freshEntry, now)).toBe(true);
    expect(isCacheEntryFresh(staleEntry, now)).toBe(false);
  });

  it("collects standalone https URLs from Markdown while ignoring fenced code blocks", () => {
    const md = [
      "# Heading",
      "",
      "https://github.com/you/awesome-cli",
      "",
      "```ts",
      "https://ignored.example.com",
      "```",
      "",
      "Inline link [here](https://inline.example.com) is not standalone.",
    ].join("\n");

    expect(collectMarkdownStandaloneUrls(md)).toEqual(["https://github.com/you/awesome-cli"]);
  });
});
