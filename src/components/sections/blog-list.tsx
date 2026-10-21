import { Link, useNavigate } from "@tanstack/react-router";
import { SectionShell } from "@/components/layout/section-shell";
import { Badge } from "@/components/ui/badge";
import { Toggle, ToggleGroup } from "@/components/ui/toggle-group";
import { getBlogTagLabel } from "@/lib/blog-tags";
import { site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { countBlogTags, getBlogPosts } from "@/lib/markdown";
import { useHydrated } from "@/lib/use-hydrated";

const ALL_TAGS = "all";

export function BlogListSection({ tag }: { tag?: string }) {
  const { lang, t, formatDate, formatNumber } = useI18n();
  const navigate = useNavigate();
  const hydrated = useHydrated();

  const posts = getBlogPosts(lang);
  const tagCounts = countBlogTags(posts, (id) => getBlogTagLabel(id, lang));

  // The prerendered HTML is the unfiltered list; apply `?tag=` after hydration.
  // Unknown tags fall back to "All".
  const activeTag =
    hydrated && tag && tagCounts.some((entry) => entry.tag === tag) ? tag : undefined;
  const visiblePosts = activeTag ? posts.filter((post) => post.tags.includes(activeTag)) : posts;

  const handleTagChange = (values: string[]) => {
    const next = values[0];
    // Pressing the active tag again would leave nothing selected; keep it selected instead.
    if (!next) return;
    void navigate({
      to: "/$lang/blog/",
      params: { lang },
      search: next === ALL_TAGS ? {} : { tag: next },
      replace: true,
      resetScroll: false,
    });
  };

  return (
    <SectionShell
      id="blog"
      comment={t(site.ui.sections.blog.comment)}
      title={t(site.ui.sections.blog.title)}
    >
      {tagCounts.length > 0 ? (
        <ToggleGroup
          value={[activeTag ?? ALL_TAGS]}
          onValueChange={handleTagChange}
          aria-label={t(site.ui.sections.blog.tagFilterAriaLabel)}
          className="-mx-6 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        >
          <Toggle value={ALL_TAGS}>
            <span>{t(site.ui.sections.blog.allTags)}</span>
            <span className="text-caption">{formatNumber(posts.length)}</span>
          </Toggle>
          {tagCounts.map((entry) => (
            <Toggle key={entry.tag} value={entry.tag}>
              <span>{getBlogTagLabel(entry.tag, lang)}</span>
              <span className="text-caption">{formatNumber(entry.count)}</span>
            </Toggle>
          ))}
        </ToggleGroup>
      ) : null}

      {visiblePosts.length === 0 ? (
        <p className="font-mono text-body text-gray">
          {t(activeTag ? site.ui.sections.blog.emptyTag : site.ui.sections.blog.empty)}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {visiblePosts.map((post) => (
            <li key={post.slug} lang={post.lang === lang ? undefined : post.lang}>
              <Link
                to="/$lang/blog/$slug/"
                params={{ lang, slug: post.slug }}
                className="group flex flex-col gap-3 rounded-lg border border-rule bg-surface p-6 transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                <time dateTime={post.date} className="font-mono text-caption text-gray">
                  {formatDate(post.date)}
                </time>
                <h2 className="font-mono text-h2 font-bold text-foreground group-hover:text-green">
                  {post.title}
                </h2>
                {post.description ? (
                  <p className="font-sans text-paragraph text-gray">{post.description}</p>
                ) : null}
                {post.tags.length > 0 ? (
                  <span className="flex flex-wrap gap-2">
                    {post.tags.map((postTag) => (
                      <Badge key={postTag} variant={postTag === activeTag ? "green" : "default"}>
                        {getBlogTagLabel(postTag, lang)}
                      </Badge>
                    ))}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
