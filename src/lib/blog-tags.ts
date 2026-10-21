import { site } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

/** Display label of a blog tag id from `site.yaml` `blogTags`; falls back to the id. */
export function getBlogTagLabel(tag: string, lang: Lang): string {
  const label = site.blogTags[tag];
  return label ? t(label, lang) : tag;
}
