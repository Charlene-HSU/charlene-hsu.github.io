import { projects, site } from "@/lib/content";
import type { Lang } from "@/lib/i18n";
import { getBlogPosts } from "@/lib/markdown";

const DAY_MS = 24 * 60 * 60 * 1000;

export type Shortcut =
  | { kind: "project"; id: string; date: string; pinned: boolean }
  | { kind: "post"; slug: string; title: string; date: string; pinned: boolean };

/** `YYYY-MM-DD` or `YYYY-MM` (first of the month) as a UTC timestamp. */
export function parseContentDate(value: string): number {
  const [year, month = 1, day = 1] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** True when `date` is no more than `days` days before `now` (dates in the future count as recent). */
export function isRecent(date: string, now: Date, days: number): boolean {
  return now.getTime() - parseContentDate(date) <= days * DAY_MS;
}

/**
 * Projects and posts for the home shortcuts: everything marked `pinned`, plus
 * anything updated in the last `site.shortcuts.recentDays` days. Pinned items
 * come first, then newest first; at most `site.shortcuts.limit` items.
 */
export function getShortcuts(lang: Lang, now: Date): Shortcut[] {
  const { recentDays, limit } = site.shortcuts;

  const candidates: Shortcut[] = [
    ...projects.items.map((project): Shortcut => ({
      kind: "project",
      id: project.id,
      date: project.updated ?? project.period.start,
      pinned: Boolean(project.pinned),
    })),
    ...getBlogPosts(lang).map((post): Shortcut => ({
      kind: "post",
      slug: post.slug,
      title: post.title,
      date: post.updated ?? post.date,
      pinned: post.pinned,
    })),
  ];

  return candidates
    .filter((item) => item.pinned || isRecent(item.date, now, recentDays))
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) || parseContentDate(b.date) - parseContentDate(a.date),
    )
    .slice(0, limit);
}

/** Markdown to plain text for short previews: drops links, emphasis, code marks and headings. */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_~`]+/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** First paragraph of a Markdown body (skipping headings, lists, quotes and code), as plain text. */
export function firstParagraph(markdown: string): string {
  const blocks = markdown.split(/\n\s*\n/).map((block) => block.trim());
  const paragraph = blocks.find(
    (block) => block.length > 0 && !/^(#|[-*+] |\d+\. |>|```)/.test(block),
  );
  return paragraph ? markdownToPlainText(paragraph) : "";
}
