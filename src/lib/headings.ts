/** Turns heading text into an anchor id: lowercase, letters and digits joined by `-`. */
export function slugifyHeading(text: string): string {
  const raw = text.trim().toLowerCase();
  return raw.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "section";
}

export interface HeadingEntry {
  id: string;
  text: string;
  /** Markdown level: 1 for `#`, 2 for `##`, 3 for `###`. */
  level: number;
}

/** The visible text of a Markdown heading line, without inline syntax. */
function headingText(raw: string): string {
  return raw
    .replace(/\s+#+\s*$/, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/==(?:\{(?:yellow|green|blue|red)\})?/g, "")
    .replace(/[*~`]/g, "")
    .trim();
}

/**
 * The `#`–`###` headings of a Markdown document with the same ids the `<Markdown>`
 * component gives them (repeats get `-2`, `-3`, …). Headings inside fenced code are skipped.
 */
export function getHeadings(markdown: string): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  const seen = new Map<string, number>();
  let fence: string | null = null;
  for (const line of markdown.split("\n")) {
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1][0];
      else if (fenceMatch[1][0] === fence) fence = null;
      continue;
    }
    if (fence !== null) continue;
    const match = line.match(/^\s{0,3}(#{1,3})\s+(.+)$/);
    if (!match) continue;
    const text = headingText(match[2]);
    const base = slugifyHeading(text);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    headings.push({ id: count === 1 ? base : `${base}-${count}`, text, level: match[1].length });
  }
  return headings;
}
