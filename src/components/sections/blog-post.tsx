import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SectionShell } from "@/components/layout/section-shell";
import { Markdown } from "@/components/markdown";
import { TableOfContents } from "@/components/table-of-contents";
import { getBlogTagLabel } from "@/lib/blog-tags";
import { site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { getHeadings } from "@/lib/headings";
import { getBlogPost } from "@/lib/markdown";
import { cn } from "@/lib/utils";

export function BlogPostSection({ slug }: { slug: string }) {
  const { lang, t, formatDate } = useI18n();
  const post = getBlogPost(slug, lang);

  // The route throws notFound() for unknown slugs, so this only guards types.
  if (!post) return null;

  const headings = getHeadings(post.body);
  const showToc = headings.length >= 2;

  return (
    <SectionShell comment={t(site.ui.sections.blog.comment)}>
      {/* A post shown in the fallback language keeps its own `lang` for screen readers and fonts. */}
      <div className="relative">
        <article
          lang={post.lang === lang ? undefined : post.lang}
          className={cn("flex flex-col gap-8", showToc && "xl:pr-26")}
        >
          <header className="flex flex-col gap-4 border-b border-rule pb-6">
            <Link
              to="/$lang/blog/"
              params={{ lang }}
              className="inline-flex w-fit items-center gap-2 font-mono text-body text-gray transition-colors hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span>{t(site.ui.sections.blog.backToList)}</span>
            </Link>
            <h1 className="font-mono text-display font-bold text-foreground">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <time dateTime={post.date} className="font-mono text-caption text-gray">
                {formatDate(post.date)}
              </time>
              {post.tags.length > 0 ? (
                <ul
                  aria-label={t(site.ui.sections.blog.postTagsAriaLabel)}
                  className="flex flex-wrap gap-2"
                >
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        to="/$lang/blog/"
                        params={{ lang }}
                        search={{ tag }}
                        className="inline-flex items-center rounded-xs border border-rule bg-surface px-2 py-0.5 font-mono text-caption text-gray transition-colors hover:border-green hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                      >
                        {getBlogTagLabel(tag, lang)}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </header>
          <Markdown content={post.body} blogSlug={post.slug} />
        </article>
        {showToc ? (
          // Extra-wide screens only. The contents start 52px inside the column's right edge,
          // under the navbar's GitHub button (border 1 + padding 16 + button 36 ≈ 52px), and
          // reach past the column; the post leaves room for them with xl:pr-26.
          <aside className="absolute inset-y-0 left-full -ml-13 hidden w-44 xl:block">
            <TableOfContents
              headings={headings}
              title={t(site.ui.sections.blog.tocTitle)}
              expandLabel={t(site.ui.sections.blog.tocExpandAriaLabel)}
              className="sticky top-header pt-8"
            />
          </aside>
        ) : null}
      </div>
    </SectionShell>
  );
}
