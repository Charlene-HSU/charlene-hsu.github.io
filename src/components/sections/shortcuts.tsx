import { Link } from "@tanstack/react-router";
import { Pin } from "lucide-react";
import { profile, projects, site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { NavIcon } from "@/lib/icons";
import { getMarkdownContent } from "@/lib/markdown";
import { firstParagraph, getShortcuts, type Shortcut } from "@/lib/shortcuts";
import { useHydrated } from "@/lib/use-hydrated";

const cardClassName =
  "group flex h-full flex-col gap-2 rounded-lg border border-rule bg-surface p-5 transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

function navIconFor(kind: Shortcut["kind"]) {
  const id = kind === "project" ? "projects" : "blog";
  return site.nav.find((item) => item.id === id)?.icon;
}

function ShortcutCard({ item }: { item: Shortcut }) {
  const { lang, t, formatDate } = useI18n();
  const icon = navIconFor(item.kind);
  const kindLabel = t(site.ui.shortcuts.kinds[item.kind]);

  const body = (
    <>
      <span className="flex items-center justify-between gap-3 font-mono text-caption text-gray">
        <span className="inline-flex items-center gap-2">
          {icon ? <NavIcon name={icon} className="size-3.5" /> : null}
          <span>{kindLabel}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          {item.pinned ? (
            <Pin
              className="size-3.5 text-green"
              aria-label={t(site.ui.shortcuts.pinned)}
              role="img"
            />
          ) : null}
          <time dateTime={item.date}>{formatDate(item.date)}</time>
        </span>
      </span>
      <h3 className="font-mono text-lead font-bold text-foreground group-hover:text-green">
        {item.kind === "project"
          ? t(projects.items.find((project) => project.id === item.id)?.name ?? item.id)
          : item.title}
      </h3>
    </>
  );

  if (item.kind === "project") {
    return (
      <Link
        to="/$lang/projects/"
        params={{ lang }}
        search={{ p: item.id }}
        className={cardClassName}
      >
        {body}
      </Link>
    );
  }
  return (
    <Link to="/$lang/blog/$slug/" params={{ lang, slug: item.slug }} className={cardClassName}>
      {body}
    </Link>
  );
}

/** Always-on card linking to the About page, showing the first paragraph of the About text. */
function AboutCard({ intro }: { intro: string }) {
  const { lang, t } = useI18n();
  const entry = site.nav.find((item) => item.id === "about");

  return (
    <Link to="/$lang/about/" params={{ lang }} className={cardClassName}>
      <span className="inline-flex items-center gap-2 font-mono text-caption text-gray">
        {entry ? <NavIcon name={entry.icon} className="size-3.5" /> : null}
        <span>{entry ? t(entry.label) : null}</span>
      </span>
      <p className="line-clamp-3 font-sans text-paragraph text-foreground group-hover:text-green">
        {intro}
      </p>
    </Link>
  );
}

/** Home shortcuts: the About card, then pinned and recently updated projects and posts; hidden when empty. */
export function ShortcutsSection() {
  const { lang, t } = useI18n();
  const hydrated = useHydrated();

  // Prerendered HTML uses the build time; after hydration the visitor's clock
  // takes over, so shortcuts expire even if the site is not rebuilt.
  const now = hydrated ? new Date() : new Date(__BUILD_TIME__);
  const items = getShortcuts(lang, now);
  const intro = site.shortcuts.about ? firstParagraph(getMarkdownContent(profile.about, lang)) : "";
  if (items.length === 0 && !intro) return null;

  return (
    <section aria-labelledby="shortcuts-heading" className="w-full px-6 pb-16 md:pb-24">
      <div className="mx-auto flex w-full max-w-content flex-col gap-4">
        <h2 id="shortcuts-heading" className="font-mono text-body font-bold text-green">
          {t(site.ui.shortcuts.comment)}
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {intro ? (
            <li className="sm:col-span-2">
              <AboutCard intro={intro} />
            </li>
          ) : null}
          {items.map((item) => (
            <li key={item.kind === "project" ? `project-${item.id}` : `post-${item.slug}`}>
              <ShortcutCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
