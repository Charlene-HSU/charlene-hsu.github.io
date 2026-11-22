import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Folder } from "lucide-react";
import { BlogFolderNav } from "@/components/blog-folder-nav";
import { SectionShell } from "@/components/layout/section-shell";
import { Badge } from "@/components/ui/badge";
import { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Toggle, ToggleGroup } from "@/components/ui/toggle-group";
import { getBlogTagLabel } from "@/lib/blog-tags";
import { site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { countBlogTags, getBlogPosts } from "@/lib/markdown";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types/content";

const ALL_TAGS = "all";

type ListEntry =
  | { kind: "post"; date: string; post: BlogPost }
  | { kind: "folder"; date: string; id: string; posts: BlogPost[] };

/**
 * Posts outside a folder stay as they are; posts in a folder collapse into one entry,
 * dated by its newest post. Inside a folder: pinned posts first, then by file name.
 */
function groupIntoFolders(posts: BlogPost[]): ListEntry[] {
  const entries: ListEntry[] = [];
  const folders = new Map<string, BlogPost[]>();
  for (const post of posts) {
    if (!post.folder) {
      entries.push({ kind: "post", date: post.date, post });
      continue;
    }
    const list = folders.get(post.folder) ?? [];
    list.push(post);
    folders.set(post.folder, list);
  }
  for (const [id, folderPosts] of folders) {
    folderPosts.sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.slug.localeCompare(b.slug));
    const date = folderPosts.reduce((newest, p) => (p.date > newest ? p.date : newest), "");
    entries.push({ kind: "folder", date, id, posts: folderPosts });
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export function BlogListSection({ tag }: { tag?: string }) {
  const { lang, t, tf, formatDate, formatNumber } = useI18n();
  const navigate = useNavigate();
  const hydrated = useHydrated();

  const posts = getBlogPosts(lang);
  const tagCounts = countBlogTags(posts, (id) => getBlogTagLabel(id, lang));

  // The prerendered HTML is the unfiltered list; apply `?tag=` after hydration.
  // Unknown tags fall back to "All".
  const activeTag =
    hydrated && tag && tagCounts.some((entry) => entry.tag === tag) ? tag : undefined;
  const visiblePosts = activeTag ? posts.filter((post) => post.tags.includes(activeTag)) : posts;
  const entries = groupIntoFolders(visiblePosts);
  const folders = entries.flatMap((entry) =>
    entry.kind === "folder"
      ? [
          {
            id: entry.id,
            title: t(site.blogFolders[entry.id]?.title ?? entry.id),
            posts: entry.posts,
          },
        ]
      : [],
  );
  // From xl up, folders move into a side list like a post's table of contents, as long as
  // the main list still has posts of its own; otherwise they stay in the list.
  const showFolderNav = folders.length > 0 && entries.some((entry) => entry.kind === "post");

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
        <div className="xl:flex xl:gap-13">
          <ul className="flex min-w-0 flex-1 flex-col gap-4">
            {entries.map((entry) =>
              entry.kind === "post" ? (
                <li
                  key={entry.post.slug}
                  lang={entry.post.lang === lang ? undefined : entry.post.lang}
                >
                  <Link
                    to="/$lang/blog/$slug/"
                    params={{ lang, slug: entry.post.slug }}
                    className="group flex flex-col gap-3 rounded-lg border border-rule bg-surface p-6 transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                  >
                    <time dateTime={entry.post.date} className="font-mono text-caption text-gray">
                      {formatDate(entry.post.date)}
                    </time>
                    <h2 className="font-mono text-h2 font-bold text-foreground group-hover:text-green">
                      {entry.post.title}
                    </h2>
                    {entry.post.description ? (
                      <p className="font-sans text-paragraph text-gray">{entry.post.description}</p>
                    ) : null}
                    {entry.post.tags.length > 0 ? (
                      <span className="flex flex-wrap gap-2">
                        {entry.post.tags.map((postTag) => (
                          <Badge
                            key={postTag}
                            variant={postTag === activeTag ? "green" : "default"}
                          >
                            {getBlogTagLabel(postTag, lang)}
                          </Badge>
                        ))}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ) : (
                <li key={`folder:${entry.id}`} className={cn(showFolderNav && "xl:hidden")}>
                  {/* Remounting on a tag change opens the folder while a tag filter is active. */}
                  <CollapsibleRoot
                    key={activeTag ?? ALL_TAGS}
                    defaultOpen={activeTag !== undefined}
                    className="rounded-lg border border-rule bg-surface transition-colors hover:border-foreground data-open:border-foreground"
                  >
                    <h2>
                      <CollapsibleTrigger className="flex w-full flex-col items-start gap-3 rounded-lg p-6 text-left font-normal text-foreground hover:text-foreground data-panel-open:text-foreground">
                        <span className="flex items-center gap-2 font-mono text-caption text-gray">
                          <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                          <span aria-hidden="true">·</span>
                          <span>
                            {tf(site.ui.sections.blog.folderCount, {
                              count: formatNumber(entry.posts.length),
                            })}
                          </span>
                        </span>
                        <span className="flex w-full items-center gap-3 font-mono text-h2 font-bold group-hover:text-green">
                          <Folder aria-hidden="true" className="size-6 shrink-0" />
                          <span className="flex-1">
                            {t(site.blogFolders[entry.id]?.title ?? entry.id)}
                          </span>
                          <ChevronDown
                            aria-hidden="true"
                            className="size-5 shrink-0 text-gray transition-transform group-data-panel-open:rotate-180 motion-reduce:transition-none"
                          />
                        </span>
                        {site.blogFolders[entry.id]?.description ? (
                          <span className="font-sans text-paragraph text-gray">
                            {t(site.blogFolders[entry.id]?.description ?? "")}
                          </span>
                        ) : null}
                      </CollapsibleTrigger>
                    </h2>
                    {/* hiddenUntilFound keeps the links in the prerendered HTML and in find-in-page. */}
                    <CollapsiblePanel hiddenUntilFound className="px-6 pt-0 pb-6">
                      <ul className="flex flex-col border-t border-rule">
                        {entry.posts.map((post) => (
                          <li
                            key={post.slug}
                            lang={post.lang === lang ? undefined : post.lang}
                            className="border-b border-rule last:border-b-0"
                          >
                            <Link
                              to="/$lang/blog/$slug/"
                              params={{ lang, slug: post.slug }}
                              className="group/post flex flex-col gap-1 rounded-sm py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                            >
                              <h3 className="font-mono text-lead font-bold text-foreground group-hover/post:text-green">
                                {post.title}
                              </h3>
                              {post.description ? (
                                <p className="font-sans text-body text-gray">{post.description}</p>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CollapsiblePanel>
                  </CollapsibleRoot>
                </li>
              ),
            )}
          </ul>
          {showFolderNav ? (
            // Extra-wide screens only, placed like a post's table of contents: it starts 52px
            // inside the column's right edge and reaches 124px past it (-mr-31). It stays in the
            // flex row, so an opened folder makes the page taller instead of covering the footer.
            <aside className="-mr-31 hidden w-44 shrink-0 xl:block">
              <BlogFolderNav
                folders={folders}
                title={t(site.ui.sections.blog.foldersTitle)}
                countLabel={t(site.ui.sections.blog.folderCount)}
                defaultOpen={activeTag !== undefined}
                className="sticky top-header pt-2"
              />
            </aside>
          ) : null}
        </div>
      )}
    </SectionShell>
  );
}
