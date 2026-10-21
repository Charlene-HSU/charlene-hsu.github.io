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

let blogEntriesCache: BlogPost[] | undefined;

/** Every blog file, parsed once (the files are bundled, so they never change at runtime). */
export function getAllBlogEntries(): BlogPost[] {
  if (blogEntriesCache) return blogEntriesCache;
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
      description: frontmatter.description,
      tags: frontmatter.tags,
      draft: Boolean(frontmatter.draft),
      body: parsed.body.trim(),
    });
  }
  blogEntriesCache = entries;
  return entries;
}

type BlogVariants = Partial<Record<Lang, BlogPost>>;

const groupedCache = new Map<boolean, Map<string, BlogVariants>>();

function groupBlogEntries(includeDrafts: boolean): Map<string, BlogVariants> {
  const cached = groupedCache.get(includeDrafts);
  if (cached) return cached;
  const bySlug = new Map<string, BlogVariants>();
  for (const entry of getAllBlogEntries()) {
    if (!includeDrafts && entry.draft) continue;
    const existing = bySlug.get(entry.slug) ?? {};
    existing[entry.lang] = entry;
    bySlug.set(entry.slug, existing);
  }
  groupedCache.set(includeDrafts, bySlug);
  return bySlug;
}

function pickVariant(variants: BlogVariants, lang: Lang): BlogPost | undefined {
  const fallbackLang: Lang = lang === "en" ? "zh-TW" : "en";
  return variants[lang] ?? variants[fallbackLang];
}

/** Published posts for one language (falling back to the other language), newest first. */
export function getBlogPosts(lang: Lang, includeDrafts: boolean = import.meta.env.DEV): BlogPost[] {
  const resolved: BlogPost[] = [];
  for (const variants of groupBlogEntries(includeDrafts).values()) {
    const chosen = pickVariant(variants, lang);
    if (chosen) {
      resolved.push(chosen);
    }
  }
  return resolved.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/** One post for a language, falling back to the other language. */
export function getBlogPost(
  slug: string,
  lang: Lang,
  includeDrafts: boolean = import.meta.env.DEV,
): BlogPost | undefined {
  const variants = groupBlogEntries(includeDrafts).get(slug);
  return variants ? pickVariant(variants, lang) : undefined;
}

/** Languages that have their own file for a post. */
export function getBlogPostLangs(
  slug: string,
  includeDrafts: boolean = import.meta.env.DEV,
): Lang[] {
  const variants = groupBlogEntries(includeDrafts).get(slug) ?? {};
  return languages.filter((lang) => variants[lang] !== undefined);
}

export function getBlogSlugs(includeDrafts: boolean = import.meta.env.DEV): string[] {
  return [...groupBlogEntries(includeDrafts).keys()].sort();
}

export interface BlogTagCount {
  tag: string;
  count: number;
}

/** Tags used by the given posts, most used first. */
export function countBlogTags(posts: BlogPost[], labelOf: (tag: string) => string): BlogTagCount[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || labelOf(a.tag).localeCompare(labelOf(b.tag)));
}
