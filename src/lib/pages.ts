import { site } from "@/lib/content";
import { languages, t, tf, type Lang } from "@/lib/i18n";
import { getBlogPost, getBlogPostLangs, getBlogSlugs } from "@/lib/markdown";
import type { PageId } from "@/types/content";

/** Route path (as the router types it) for every page in `site.yaml` `nav`. */
export const pageRoutes = {
  about: "/$lang/about/",
  skills: "/$lang/skills/",
  experience: "/$lang/experience/",
  projects: "/$lang/projects/",
  blog: "/$lang/blog/",
  friends: "/$lang/friends/",
  contact: "/$lang/contact/",
} as const satisfies Record<PageId, string>;

export type PageRef =
  { kind: "home" } | { kind: "nav"; id: PageId } | { kind: "post"; slug: string };

export interface PageMeta {
  title: string;
  description: string;
}

/** Public URL path of a page (without the deploy base path), always with a trailing slash. */
export function pagePath(page: PageRef, lang: Lang): string {
  switch (page.kind) {
    case "home":
      return `/${lang}/`;
    case "nav":
      return `/${lang}/${page.id}/`;
    case "post":
      return `/${lang}/blog/${page.slug}/`;
  }
}

export function getPageMeta(page: PageRef, lang: Lang): PageMeta {
  const siteName = t(site.meta.siteName, lang);
  const siteDescription = t(site.meta.description, lang);

  if (page.kind === "home") {
    return { title: t(site.meta.title, lang), description: siteDescription };
  }

  if (page.kind === "nav") {
    const entry = site.nav.find((item) => item.id === page.id);
    if (!entry) {
      return { title: t(site.meta.title, lang), description: siteDescription };
    }
    return {
      title: tf(site.ui.pageTitleTemplate, lang, { page: t(entry.label, lang), site: siteName }),
      description: t(entry.description, lang),
    };
  }

  const post = getBlogPost(page.slug, lang);
  if (!post) {
    return { title: t(site.meta.title, lang), description: siteDescription };
  }
  return {
    title: tf(site.ui.pageTitleTemplate, lang, { page: post.title, site: siteName }),
    description: post.description ?? siteDescription,
  };
}

export interface PublicPage extends PageMeta {
  /** URL path of this page, e.g. `/en/blog/hello-world/`. */
  path: string;
  lang: Lang;
  /** URL path search engines should treat as the original. */
  canonicalPath: string;
  /** URL path per language that has its own content for this page. */
  alternates: Partial<Record<Lang, string>>;
}

function pageLangs(page: PageRef): Lang[] {
  if (page.kind === "post") {
    return getBlogPostLangs(page.slug, false);
  }
  return [...languages];
}

/**
 * Every prerendered page in every language. Prerendering, the sitemap and the
 * content tests all read this list, so they never disagree.
 */
export function getPublicPages(): PublicPage[] {
  const refs: PageRef[] = [
    { kind: "home" },
    ...site.nav.map((item): PageRef => ({ kind: "nav", id: item.id })),
    ...getBlogSlugs(false).map((slug): PageRef => ({ kind: "post", slug })),
  ];

  const pages: PublicPage[] = [];
  for (const ref of refs) {
    const ownLangs = pageLangs(ref);
    if (ownLangs.length === 0) continue;
    const alternates: Partial<Record<Lang, string>> = {};
    for (const lang of ownLangs) {
      alternates[lang] = pagePath(ref, lang);
    }
    for (const lang of languages) {
      const canonicalLang = ownLangs.includes(lang) ? lang : ownLangs[0];
      pages.push({
        ...getPageMeta(ref, lang),
        path: pagePath(ref, lang),
        lang,
        canonicalPath: pagePath(ref, canonicalLang),
        alternates,
      });
    }
  }
  return pages;
}
