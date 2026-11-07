import { describe, expect, it } from "vitest";
import { site } from "@/lib/content";
import { languages } from "@/lib/i18n";
import { getBlogPost, getBlogSlugs, getBlogPosts } from "@/lib/markdown";
import { getPublicPages, pagePath } from "@/lib/pages";

describe("public page list", () => {
  const pages = getPublicPages();
  const paths = pages.map((page) => page.path);

  it("has unique paths that all end with a slash", () => {
    expect(new Set(paths).size).toBe(paths.length);
    for (const p of paths) {
      expect(p.endsWith("/"), p).toBe(true);
    }
  });

  it("includes home, every nav page and every published post in both languages", () => {
    for (const lang of languages) {
      expect(paths).toContain(pagePath({ kind: "home" }, lang));
      for (const item of site.nav) {
        expect(paths).toContain(pagePath({ kind: "nav", id: item.id }, lang));
      }
      for (const slug of getBlogSlugs(false)) {
        expect(paths).toContain(pagePath({ kind: "post", slug }, lang));
      }
    }
  });

  it("gives every page a title and description, and canonicals point at real pages", () => {
    for (const page of pages) {
      expect(page.title.length, page.path).toBeGreaterThan(0);
      expect(page.description.length, page.path).toBeGreaterThan(0);
      expect(paths).toContain(page.canonicalPath);
      for (const alternate of Object.values(page.alternates)) {
        expect(paths).toContain(alternate);
      }
    }
  });
});

describe("blog posts", () => {
  it("keeps drafts out of the published list, pages and sitemap input", () => {
    const published = new Set(getBlogSlugs(false));
    const paths = new Set(getPublicPages().map((page) => page.path));
    for (const slug of getBlogSlugs(true)) {
      const isDraft = languages.every((lang) => getBlogPost(slug, lang, true)?.draft);
      expect(published.has(slug), `"${slug}" published`).toBe(!isDraft);
      for (const lang of languages) {
        expect(paths.has(pagePath({ kind: "post", slug }, lang)), `${slug} (${lang})`).toBe(
          !isDraft,
        );
      }
    }
    for (const lang of languages) {
      expect(getBlogPosts(lang, false).every((post) => !post.draft)).toBe(true);
    }
  });

  it("lists posts newest first", () => {
    for (const lang of languages) {
      const dates = getBlogPosts(lang, false).map((post) => post.date);
      expect(dates).toEqual([...dates].sort().reverse());
    }
  });
});
