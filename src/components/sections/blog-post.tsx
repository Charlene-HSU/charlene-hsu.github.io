import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SectionShell } from "@/components/layout/section-shell";
import { Markdown } from "@/components/markdown";
import { getBlogTagLabel } from "@/lib/blog-tags";
import { site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { getBlogPost } from "@/lib/markdown";

export function BlogPostSection({ slug }: { slug: string }) {
  const { lang, t, formatDate } = useI18n();
  const post = getBlogPost(slug, lang);

  // The route throws notFound() for unknown slugs, so this only guards types.
  if (!post) return null;

  return (
    <SectionShell comment={t(site.ui.sections.blog.comment)}>
      <article className="flex flex-col gap-8">
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
    </SectionShell>
  );
}
