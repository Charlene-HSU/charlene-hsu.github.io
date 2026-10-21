import fm from "front-matter";
import { BlogFrontMatterSchema, languages, type BlogPost, type Lang } from "@/types/content";

const mdModules = import.meta.glob<string>("/src/content/md/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const blogModules = import.meta.glob<string>("/src/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export interface ParsedMarkdown {
  attributes: Record<string, unknown>;
  body: string;
}

export function parseMarkdownRaw(raw: string): ParsedMarkdown {
  const parsed = fm<Record<string, unknown>>(raw);
  return {
    attributes: parsed.attributes ?? {},
    body: parsed.body.trim(),
  };
}

export function getMarkdownContent(key: string, lang: Lang): string {
  const primaryPath = `/src/content/md/${key}.${lang}.md`;
  const fallbackLang: Lang = lang === "en" ? "zh-TW" : "en";
  const fallbackPath = `/src/content/md/${key}.${fallbackLang}.md`;

  const raw = mdModules[primaryPath] ?? mdModules[fallbackPath];
  if (!raw) {
    if (import.meta.env.DEV) {
      console.warn(`[markdown] Missing markdown file for key "${key}" (${lang})`);
    }
    return "";
  }
  if (!mdModules[primaryPath] && import.meta.env.DEV) {
    console.warn(
      `[markdown] Missing "${lang}" markdown for "${key}", falling back to "${fallbackLang}"`,
    );
  }
  return parseMarkdownRaw(raw).body;
}

export function parseBlogFilename(filePath: string): { slug: string; lang: Lang } | null {
  const filename = filePath.split("/").pop();
  if (!filename || !filename.endsWith(".md")) {
    return null;
  }
  for (const lang of languages) {
    const suffix = `.${lang}.md`;
    if (filename.endsWith(suffix)) {
      const slug = filename.slice(0, -suffix.length);
      if (slug.length > 0) {
        return { slug, lang };
      }
    }
  }
  return null;
}

export function getAllBlogEntries(): BlogPost[] {
  const entries: BlogPost[] = [];
  for (const [filePath, raw] of Object.entries(blogModules)) {
    const meta = parseBlogFilename(filePath);
    if (!meta) continue;
    const parsed = fm<unknown>(raw);
    const frontmatter = BlogFrontMatterSchema.parse(parsed.attributes);
    entries.push({
      slug: meta.slug,
      lang: meta.lang,
      title: frontmatter.title,
      date: frontmatter.date,
      draft: Boolean(frontmatter.draft),
      body: parsed.body.trim(),
    });
  }
  return entries;
}

export function getBlogPosts(lang: Lang, includeDrafts: boolean = import.meta.env.DEV): BlogPost[] {
  const allEntries = getAllBlogEntries().filter((post) => includeDrafts || !post.draft);
  const bySlug = new Map<string, Partial<Record<Lang, BlogPost>>>();

  for (const entry of allEntries) {
    const existing = bySlug.get(entry.slug) ?? {};
    existing[entry.lang] = entry;
    bySlug.set(entry.slug, existing);
  }

  const fallbackLang: Lang = lang === "en" ? "zh-TW" : "en";
  const resolved: BlogPost[] = [];

  for (const variants of bySlug.values()) {
    const chosen = variants[lang] ?? variants[fallbackLang];
    if (chosen) {
      resolved.push(chosen);
    }
  }

  return resolved.sort((a, b) => b.date.localeCompare(a.date));
}
