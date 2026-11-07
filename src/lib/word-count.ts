import { getMarkdownBodies } from "@/lib/markdown";
import type { Lang } from "@/types/content";

// Han characters count one each; runs of Latin letters or digits count as one word.
const wordPattern = /\p{Script=Han}|[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

/** Words in Markdown source, ignoring code blocks, link targets and syntax characters. */
export function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    // Highlight colors (`=={red}…==`) and callout markers (`> [!NOTE]`) are syntax, not words.
    .replace(/==\{[a-z]+\}/g, " ")
    .replace(/\[![A-Za-z]+\]/g, " ");
  return text.match(wordPattern)?.length ?? 0;
}

const totals = new Map<Lang, number>();

/** Total words across every Markdown page (About, projects, blog posts) in one language. */
export function getSiteWordCount(lang: Lang): number {
  const cached = totals.get(lang);
  if (cached !== undefined) return cached;
  const total = getMarkdownBodies(lang).reduce((sum, body) => sum + countWords(body), 0);
  totals.set(lang, total);
  return total;
}
