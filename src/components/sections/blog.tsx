import { SectionShell } from "@/components/layout/section-shell";
import { Markdown } from "@/components/markdown";
import { site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { getBlogPosts } from "@/lib/markdown";

export function BlogSection() {
  const { lang, t, formatDate } = useI18n();
  const posts = getBlogPosts(lang);

  return (
    <SectionShell
      id="blog"
      comment={t(site.ui.sections.blog.comment)}
      title={t(site.ui.sections.blog.title)}
    >
      {posts.length === 0 ? (
        <p className="font-mono text-body text-gray">{t(site.ui.sections.blog.empty)}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col gap-5 rounded-lg border border-rule bg-surface p-6"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-4">
                <h3 className="font-mono text-h1 font-bold text-foreground">{post.title}</h3>
                <time dateTime={post.date} className="font-mono text-caption text-gray">
                  {formatDate(post.date)}
                </time>
              </header>
              <Markdown content={post.body} blogSlug={post.slug} />
            </article>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
