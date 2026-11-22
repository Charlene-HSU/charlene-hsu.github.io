import { Link } from "@tanstack/react-router";
import { ChevronDown, Folder } from "lucide-react";
import { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatTemplate, useI18n } from "@/lib/i18n";
import { cn, type WithClassName } from "@/lib/utils";
import type { BlogPost } from "@/types/content";

export interface BlogFolderEntry {
  id: string;
  title: string;
  posts: BlogPost[];
}

export type BlogFolderNavProps = WithClassName<{
  folders: BlogFolderEntry[];
  title: string;
  /** Number of posts in a folder; `{count}` is the number. */
  countLabel: string;
  /** Open every folder, e.g. while a tag filter is active. */
  defaultOpen?: boolean;
}>;

/**
 * The blog folders as a sticky side list, styled like a post's table of contents.
 * Each folder opens to list its posts; folders start closed unless `defaultOpen`.
 */
export function BlogFolderNav({
  folders,
  title,
  countLabel,
  defaultOpen = false,
  className,
}: BlogFolderNavProps) {
  const { lang, formatNumber } = useI18n();

  return (
    <nav aria-labelledby="blog-folders-title" className={cn("flex flex-col gap-3", className)}>
      <p id="blog-folders-title" className="font-mono text-caption font-bold text-gray/75">
        {title}
      </p>
      <ul className="flex flex-col gap-2 border-l border-rule">
        {folders.map((folder) => (
          <li key={folder.id}>
            {/* Remounting when `defaultOpen` changes opens the folders while a tag filter is active. */}
            <CollapsibleRoot key={String(defaultOpen)} defaultOpen={defaultOpen}>
              <CollapsibleTrigger className="-ml-px flex w-full items-start gap-2 rounded-none border-l border-transparent py-1 pl-4 text-left font-sans text-body font-normal text-gray/75 hover:text-gray data-panel-open:border-green data-panel-open:text-foreground/80">
                <Folder aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span>{folder.title}</span>
                  <span className="font-mono text-caption text-gray/75">
                    {formatTemplate(countLabel, { count: formatNumber(folder.posts.length) })}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 transition-transform group-data-panel-open:rotate-180 motion-reduce:transition-none"
                />
              </CollapsibleTrigger>
              {/* hiddenUntilFound keeps the links in the prerendered HTML and in find-in-page. */}
              <CollapsiblePanel hiddenUntilFound className="pt-0">
                <ul className="flex flex-col">
                  {folder.posts.map((post) => (
                    <li key={post.slug} lang={post.lang === lang ? undefined : post.lang}>
                      <Link
                        to="/$lang/blog/$slug/"
                        params={{ lang, slug: post.slug }}
                        className="block py-1 pl-10 font-sans text-body text-gray/75 transition-colors hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CollapsiblePanel>
            </CollapsibleRoot>
          </li>
        ))}
      </ul>
    </nav>
  );
}
