import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { profile, site } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { NavIcon } from "@/lib/icons";
import { getMarkdownContent } from "@/lib/markdown";

/**
 * Home: the full self-introduction from `md/about.<lang>.md`, right under the
 * hero, with a link to the About page. `site.yaml` `shortcuts.about: false` hides it.
 */
export function AboutIntroSection() {
  const { lang, t } = useI18n();
  if (!site.shortcuts.about) return null;

  const body = getMarkdownContent(profile.about, lang);
  if (!body) return null;
  const entry = site.nav.find((item) => item.id === "about");

  return (
    <section aria-labelledby="about-intro-heading" className="w-full px-6 pb-16">
      <div className="mx-auto flex w-full max-w-content flex-col gap-4 rounded-lg border border-rule bg-surface p-6">
        <h2 id="about-intro-heading" className="font-mono text-paragraph font-bold">
          <Link
            to="/$lang/about/"
            params={{ lang }}
            className="group inline-flex items-center gap-2 text-green transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            {entry ? <NavIcon name={entry.icon} /> : null}
            <span>{entry ? t(entry.label) : null}</span>
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </h2>
        <Markdown content={body} />
      </div>
    </section>
  );
}
