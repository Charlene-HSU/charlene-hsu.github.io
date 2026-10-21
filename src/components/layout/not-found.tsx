import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/content";
import { languages, t, type Lang } from "@/lib/i18n";

/**
 * Not-found page. With a `lang` it renders in that language; without one
 * (an unknown language prefix, or the prerendered 404.html) it shows both.
 */
export function NotFoundPage({ lang }: { lang?: Lang }) {
  const shown: readonly Lang[] = lang ? [lang] : languages;

  return (
    <section className="w-full px-6 pt-header pb-16 md:pb-24">
      <div className="mx-auto flex w-full max-w-content flex-col gap-8 pt-8 md:pt-12">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-paragraph font-bold text-green">
            {site.ui.notFound.comment}
          </span>
          <h1 className="flex flex-col font-mono text-display font-bold text-foreground">
            {shown.map((l) => (
              <span key={l} lang={l}>
                {t(site.ui.notFound.title, l)}
              </span>
            ))}
          </h1>
        </div>
        {shown.map((l) => (
          <p key={l} lang={l} className="font-sans text-lead text-gray">
            {t(site.ui.notFound.message, l)}
          </p>
        ))}
        <div className="flex flex-wrap gap-3">
          {shown.map((l) => (
            <Link
              key={l}
              to="/$lang/"
              params={{ lang: l }}
              lang={l}
              className={buttonVariants({ variant: l === shown[0] ? "primary" : "outline" })}
            >
              {t(site.ui.notFound.homeLink, l)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
