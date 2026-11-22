import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createMemoryHistory, createRouter, RouterContextProvider } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { Markdown } from "@/components/markdown";
import { I18nProvider } from "@/lib/i18n";
import { getBlogPosts, parseBlogFilename } from "@/lib/markdown";
import { routeTree } from "@/routeTree.gen";

const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ["/en/"] }),
  trailingSlash: "always",
});

function render(content: string, inline = false): string {
  return renderToString(
    <StrictMode>
      <RouterContextProvider router={router}>
        <I18nProvider lang="en">
          <Markdown content={content} inline={inline} />
        </I18nProvider>
      </RouterContextProvider>
    </StrictMode>,
  );
}

describe("Markdown headings", () => {
  it("gives repeated headings unique ids and keeps code text in them", () => {
    const html = render(["# Setup", "", "## Install `pnpm`", "", "# Setup"].join("\n"));
    expect(html).toContain('id="setup"');
    expect(html).toContain('id="install-pnpm"');
    expect(html).toContain('id="setup-2"');
    expect(html).not.toContain("setup-3");
  });
});

describe("Markdown highlights", () => {
  it("turns ==text== into a mark and reads the color", () => {
    const html = render("Plain ==yellow== and =={red}danger== and =={pink}x== `==code==`");
    expect(html).toContain("<mark");
    expect(html).toContain("text-yellow");
    expect(html).toContain("text-red");
    expect(html).toContain(">danger</mark>");
    // An unknown color is left as plain text, and code is never highlighted.
    expect(html).toContain("=={pink}x==");
    expect(html).toContain("==code==");
  });

  it("leaves a lone or spaced == alone", () => {
    const html = render("a == b and == c ==");
    expect(html).not.toContain("<mark");
  });
});

describe("Markdown alerts", () => {
  it("turns > [!WARNING] into a titled callout", () => {
    const html = render("> [!WARNING]\n> Be careful.");
    expect(html).toContain("Warning");
    expect(html).toContain("Be careful.");
    expect(html).not.toContain("[!WARNING]");
    expect(html).not.toContain("<blockquote");
  });

  it("keeps plain quotes as blockquotes", () => {
    expect(render("> Just a quote.")).toContain("<blockquote");
  });
});

describe("Markdown images", () => {
  it("does not wrap an image paragraph in <p>", () => {
    // An unknown image renders nothing, but the paragraph around it must not be a <p>.
    expect(render("![caption](missing.jpg)")).not.toContain("<p");
  });
});

describe("Table of contents headings", () => {
  it("uses the same ids as the rendered headings", async () => {
    const { getHeadings } = await import("@/lib/headings");
    const source = [
      "# Setup",
      "## Install `pnpm`",
      "```md",
      "# not a heading",
      "```",
      "## ==Marked== and [link](https://example.com)",
      "# Setup",
    ].join("\n\n");
    const headings = getHeadings(source);
    expect(headings.map((h) => h.id)).toEqual([
      "setup",
      "install-pnpm",
      "marked-and-link",
      "setup-2",
    ]);
    const html = render(source);
    for (const { id } of headings) expect(html).toContain(`id="${id}"`);
  });

  it("matches every heading in every blog post", async () => {
    const { getHeadings } = await import("@/lib/headings");
    const { getBlogSlugs, getBlogPost } = await import("@/lib/markdown");
    for (const slug of getBlogSlugs(true)) {
      for (const lang of ["en", "zh-TW"] as const) {
        const post = getBlogPost(slug, lang, true);
        if (!post) continue;
        const html = render(post.body);
        for (const { id } of getHeadings(post.body)) expect(html).toContain(`id="${id}"`);
      }
    }
  });
});

describe("Markdown safety and links", () => {
  it("never renders raw HTML from content", () => {
    const html = render('<script>alert(1)</script>\n\n<b onclick="x()">bold</b>\n\nok');
    // The tags may show up as escaped text, never as elements or attributes.
    expect(html).not.toMatch(/<script|<b[ >]/);
    expect(html).not.toMatch(/<[a-z][^>]*\sonclick=/);
  });

  it("opens external and mailto links in a new tab with noopener", () => {
    for (const href of ["https://example.com/x", "mailto:me@example.com"]) {
      const html = render(`See [here](${href}) now.`);
      expect(html).toContain(`href="${href}"`);
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    }
  });

  it("keeps links between notes on this site in the same tab", () => {
    const html = render("[筆記總覽](/zh-TW/blog/medical-informatics-notes/)");
    expect(html).toContain('href="/zh-TW/blog/medical-informatics-notes/"');
    expect(html).not.toContain('target="_blank"');
  });

  it("turns a standalone https URL into a link card, but not a URL inside a sentence", () => {
    const card = render("https://example.com/page");
    // The card is the block itself: an <a> straight inside the Markdown wrapper, not in a <p>.
    expect(card).toMatch(/^<div[^>]*><a href="https:\/\/example\.com\/page"/);
    expect(render("Read https://example.com/page today.")).toMatch(/^<div[^>]*><p/);
  });
});

describe("Markdown inline mode", () => {
  it("keeps only bold, links, code, lists and highlights", () => {
    const html = render("# Title\n\n**bold** `code` ==mark== ![img](x.png)\n\n> quote", true);
    expect(html).toContain("<strong");
    expect(html).toContain("<code");
    expect(html).toContain("<mark");
    expect(html).not.toMatch(/<h\d|<img|<blockquote|<p[ >]/);
  });
});

describe("Markdown alert kinds", () => {
  it("renders every kind, in any case, with its title", () => {
    for (const [marker, title] of [
      ["NOTE", "Note"],
      ["tip", "Tip"],
      ["Important", "Important"],
      ["WARNING", "Warning"],
      ["CAUTION", "Caution"],
    ]) {
      const html = render(`> [!${marker}]\n> Body text.`);
      expect(html, marker).toContain(title);
      expect(html, marker).toContain("Body text.");
      expect(html, marker).not.toContain("<blockquote");
    }
  });

  it("leaves an unknown kind as a normal quote", () => {
    const html = render("> [!NOTEE]\n> Body text.");
    expect(html).toContain("<blockquote");
    expect(html).toContain("[!NOTEE]");
  });

  it("highlights inside bold and inside callouts", () => {
    expect(render("**==both==**")).toMatch(/<strong[^>]*><mark[^>]*>both<\/mark><\/strong>/);
    expect(render("> [!TIP]\n> =={green}yes==")).toContain(">yes</mark>");
  });
});

describe("Blog folders", () => {
  it("reads the folder from a post path and keeps the slug from the file name", () => {
    expect(parseBlogFilename("/src/content/blog/hello-world.en.md")).toEqual({
      slug: "hello-world",
      lang: "en",
    });
    expect(parseBlogFilename("/src/content/blog/notes/ch-01.zh-TW.md")).toEqual({
      slug: "ch-01",
      lang: "zh-TW",
      folder: "notes",
    });
    expect(parseBlogFilename("/src/content/blog/a/b/too-deep.en.md")).toBeNull();
  });

  it("loads posts from blog sub-folders", () => {
    const folderPosts = getBlogPosts("zh-TW", false).filter((post) => post.folder);
    expect(folderPosts.length).toBeGreaterThan(0);
  });
});
