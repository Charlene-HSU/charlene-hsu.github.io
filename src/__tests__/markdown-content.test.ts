import fs from "node:fs";
import path from "node:path";
import fm from "front-matter";
import { describe, expect, it } from "vitest";
import { getMarkdownAsset, site } from "@/lib/content";
import { getHeadings } from "@/lib/headings";
import { getPublicPages } from "@/lib/pages";

/**
 * Checks what owners write inside Markdown (About, project bodies, blog posts): things the
 * renderer would otherwise drop silently, such as a missing image, a dead site link, a
 * mistyped highlight color or callout type.
 */

const ROOT = path.resolve(__dirname, "../..");
const CONTENT_DIR = path.join(ROOT, "src/content");

interface MarkdownFile {
  /** Path relative to the repository root, for messages. */
  name: string;
  body: string;
  /** Set for blog posts: their images resolve against src/assets/blog/<slug>/. */
  blogSlug?: string;
}

function walkMarkdown(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdown(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

const markdownFiles: MarkdownFile[] = [
  ...walkMarkdown(path.join(CONTENT_DIR, "md")),
  ...walkMarkdown(path.join(CONTENT_DIR, "blog")),
].map((full) => {
  const name = path.relative(ROOT, full);
  const body = fm(fs.readFileSync(full, "utf-8")).body;
  const blogMatch = name.match(/blog[\\/](?:[a-z0-9-]+[\\/])?([a-z0-9-]+)\.[A-Za-z-]+\.md$/);
  return { name, body, blogSlug: blogMatch?.[1] };
});

/** Splits Markdown into prose (code removed) and the fenced code blocks with their info string. */
function splitCode(markdown: string): { prose: string; blocks: { info: string; code: string }[] } {
  const prose: string[] = [];
  const blocks: { info: string; code: string }[] = [];
  let open: { fence: string; info: string; lines: string[] } | null = null;
  for (const line of markdown.split("\n")) {
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})\s*([^\s`]*)/);
    if (open) {
      if (fence && fence[1][0] === open.fence[0] && fence[1].length >= open.fence.length) {
        blocks.push({ info: open.info, code: open.lines.join("\n") });
        open = null;
      } else {
        open.lines.push(line);
      }
    } else if (fence) {
      open = { fence: fence[1], info: fence[2], lines: [] };
    } else {
      // Inline code is not Markdown syntax either.
      prose.push(line.replace(/`[^`\n]*`/g, ""));
    }
  }
  return { prose: prose.join("\n"), blocks };
}

const imagePattern = /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
const linkPattern = /(?<!!)\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;

describe("Markdown content", () => {
  it("finds the Markdown files", () => {
    expect(markdownFiles.length).toBeGreaterThan(0);
    expect(markdownFiles.some((file) => file.blogSlug)).toBe(true);
  });

  it("only references local images that the site can show, with alt text", () => {
    for (const file of markdownFiles) {
      for (const [, alt, src] of splitCode(file.body).prose.matchAll(imagePattern)) {
        const where = `${file.name}: ![${alt}](${src})`;
        // The renderer only shows local images (optimized at build time); remote ones vanish.
        expect(/^[a-z]+:/i.test(src), `${where} must be a local file`).toBe(false);
        // Supported: webp, png, jpg, jpeg, svg (any case). HEIC and others do not render.
        expect(
          getMarkdownAsset(src, file.blogSlug),
          `${where} not found in src/assets/${file.blogSlug ? `blog/${file.blogSlug}/` : "projects/"}`,
        ).toBeDefined();
        // The alt text is also the caption and what screen readers announce.
        expect(alt.trim().length, `${where} needs alt text`).toBeGreaterThan(0);
      }
    }
  });

  it("links to https, mailto, real headings or real pages of this site", () => {
    const pagePaths = new Set(getPublicPages().map((page) => page.path));
    for (const file of markdownFiles) {
      const headingIds = new Set(getHeadings(file.body).map((heading) => heading.id));
      for (const [, href] of splitCode(file.body).prose.matchAll(linkPattern)) {
        const where = `${file.name}: link "${href}"`;
        if (/^https:\/\//.test(href)) {
          expect(() => new URL(href), `${where} is not a valid URL`).not.toThrow();
        } else if (href.startsWith("mailto:")) {
          expect(href.length, where).toBeGreaterThan("mailto:".length);
        } else if (href.startsWith("#")) {
          expect(headingIds.has(href.slice(1)), `${where}: no heading with that id`).toBe(true);
        } else if (href.startsWith("/")) {
          const [pathAndSearch] = href.split("#", 1);
          const [pathname, search = ""] = pathAndSearch.split("?", 2);
          const withSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
          expect(pagePaths.has(withSlash), `${where}: no published page at ${withSlash}`).toBe(
            true,
          );
          const tag = new URLSearchParams(search).get("tag");
          if (tag) {
            expect(site.blogTags[tag], `${where}: unknown blog tag "${tag}"`).toBeDefined();
          }
        } else {
          // http://, relative paths and other schemes go nowhere useful (or home).
          expect.fail(`${where}: use https://, mailto:, #heading or a site path like /en/about/`);
        }
      }
    }
  });

  it("only uses the supported highlight colors and callout types", () => {
    for (const file of markdownFiles) {
      const { prose } = splitCode(file.body);
      for (const [, color] of prose.matchAll(/==\{([^}]*)\}/g)) {
        expect(["yellow", "green", "blue", "red"], `${file.name}: =={${color}}`).toContain(color);
      }
      for (const [, kind] of prose.matchAll(/^\s*>\s*\[!([^\]]*)\]/gm)) {
        expect(
          ["note", "tip", "important", "warning", "caution"],
          `${file.name}: > [!${kind}]`,
        ).toContain(kind.toLowerCase());
      }
    }
  });

  it("gives every Mermaid diagram an accDescr for its alt text", () => {
    for (const file of markdownFiles) {
      for (const block of splitCode(file.body).blocks.filter((b) => b.info === "mermaid")) {
        expect(block.code, `${file.name}: Mermaid diagram without accDescr`).toMatch(
          /^\s*accDescr\s*[:{]/m,
        );
      }
    }
  });
});
